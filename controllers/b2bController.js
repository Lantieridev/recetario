import { getSession } from '../config/neo4j.js';
import neo4j from 'neo4j-driver';

// POST /api/b2b/bidding
// Body: { ingrediente: 'Mayonesa', pesoAñadido: 5.0 }
export const patrocinarIngrediente = async (req, res) => {
    const { ingrediente, pesoAñadido } = req.body;
    const cliente = req.b2bClient;

    if (!ingrediente || !pesoAñadido) {
        return res.status(400).json({ error: 'Faltan parámetros: ingrediente o pesoAñadido' });
    }

    const session = getSession();
    try {
        const lower = ingrediente.trim().toLowerCase();
        const clientName = cliente.nombre.trim();
        
        // 1. Resolver el nombre base del ingrediente (Ej: "leches" -> "Leches", y buscar si existe "Leche" en el grafo)
        let baseName = lower.charAt(0).toUpperCase() + lower.slice(1);
        let alternative = null;
        if (baseName.endsWith('s') && baseName.length > 3) {
            alternative = baseName.slice(0, -1); // singular
        } else if (baseName.length > 2) {
            alternative = baseName + 's'; // plural
        }

        let baseNormalized = baseName;
        // Consultar a Neo4j para ver si existe la versión singular o plural (de forma insensible a mayúsculas/minúsculas)
        const checkQuery = `
            MATCH (i:Ingrediente)
            WHERE toLower(i.nombre) = toLower($baseName) OR ($alternative IS NOT NULL AND toLower(i.nombre) = toLower($alternative))
            RETURN i.nombre AS nombre LIMIT 1
        `;
        const checkResult = await session.run(checkQuery, { baseName, alternative });
        if (checkResult.records.length > 0) {
            baseNormalized = checkResult.records[0].get('nombre');
        } else {
            // Si es un ingrediente totalmente nuevo y venía en plural, lo registramos como singular por defecto
            if (baseName.endsWith('s') && baseName.length > 3) {
                baseNormalized = baseName.slice(0, -1);
            }
        }

        // 2. Anexar automáticamente el nombre del socio si no está presente
        let finalName = baseNormalized;
        if (!baseNormalized.toLowerCase().includes(clientName.toLowerCase())) {
            finalName = `${baseNormalized} ${clientName}`;
        }

        // Capitalizamos la primera letra
        const normalizedIngrediente = finalName.charAt(0).toUpperCase() + finalName.slice(1);

        // Usamos MERGE para crearlo automáticamente en el grafo si es un nuevo ingrediente corporativo
        const query = `
            MERGE (i:Ingrediente {nombre: $normalizedIngrediente})
            SET i.pesoPatrocinio = coalesce(i.pesoPatrocinio, 0) + $pesoAñadido
            RETURN i.nombre AS Ingrediente, i.pesoPatrocinio AS PesoActual
        `;
        
        const result = await session.run(query, { normalizedIngrediente, pesoAñadido: parseFloat(pesoAñadido) });
        
        res.status(200).json({
            message: `Bidding aplicado exitosamente para ${normalizedIngrediente}. El algoritmo priorizará este ingrediente de tu marca.`,
            cliente: cliente.nombre,
            ingrediente: result.records[0].get('Ingrediente'),
            nuevoPeso: result.records[0].get('PesoActual')
        });
    } catch (error) {
        console.error('Error en Graph Bidding:', error);
        res.status(500).json({ error: error.message });
    } finally {
        await session.close();
    }
};

// GET /api/b2b/analytics/flavor-trends
// Requiere Tier ENTERPRISE
export const obtenerTendenciasSabor = async (req, res) => {
    const session = getSession();
    try {
        // Cypher Query para Co-ocurrencia:
        // Encuentra pares de ingredientes que aparecen juntos en las mismas recetas
        // id(i1) < id(i2) es un truco de grafos para no contar (A, B) y (B, A) dos veces.
        const query = `
            MATCH (i1:Ingrediente)<-[:CONTIENE]-(r:Receta)-[:CONTIENE]->(i2:Ingrediente)
            WHERE id(i1) < id(i2)
            RETURN i1.nombre AS Ingrediente1, i2.nombre AS Ingrediente2, count(r) AS Afinidad
            ORDER BY Afinidad DESC
            LIMIT 20
        `;
        
        const result = await session.run(query);
        
        const tendencias = result.records.map(r => {
            const afinidad = r.get('Afinidad');
            return {
                ingrediente1: r.get('Ingrediente1'),
                ingrediente2: r.get('Ingrediente2'),
                scoreAfinidad: neo4j.isInt(afinidad) ? afinidad.toNumber() : Number(afinidad)
            };
        });
        
        res.status(200).json({
            producto: 'DaaS - Predictive Flavor Analytics',
            cliente: req.b2bClient.nombre,
            insight: 'Pares de ingredientes con mayor co-ocurrencia en la base de datos',
            tendencias
        });
    } catch (error) {
        console.error('Error en Analytics:', error);
        res.status(500).json({ error: error.message });
    } finally {
        await session.close();
    }
};

// GET /api/b2b/retail/brands
// Requiere Tier RETAIL
export const obtenerMarcasRetail = async (req, res) => {
    const session = getSession();
    const retailerName = req.b2bClient.nombre;
    try {
        const query = `
            MATCH (b:Partner)
            WHERE b.tier = 'BRAND' OR b.tier = 'ENTERPRISE'
            OPTIONAL MATCH (r:Partner {nombre: $retailerName})-[:DISTRIBUYE]->(b)
            RETURN b.nombre AS nombre, b.dominio AS dominio, r IS NOT NULL AS distribuido
            ORDER BY b.nombre
        `;
        const result = await session.run(query, { retailerName });
        const brands = result.records.map(record => ({
            nombre: record.get('nombre'),
            dominio: record.get('dominio'),
            distribuido: record.get('distribuido')
        }));
        res.status(200).json({ brands });
    } catch (error) {
        console.error('Error al obtener marcas retail:', error);
        res.status(500).json({ error: error.message });
    } finally {
        await session.close();
    }
};

// POST /api/b2b/retail/brands/toggle
// Requiere Tier RETAIL
// Body: { brandNombre }
export const toggleMarcaRetail = async (req, res) => {
    const { brandNombre } = req.body;
    const retailerName = req.b2bClient.nombre;
    if (!brandNombre) {
        return res.status(400).json({ error: 'Falta parámetro obligatorio: brandNombre' });
    }

    const session = getSession();
    try {
        const checkQuery = `
            MATCH (r:Partner {nombre: $retailerName})-[rel:DISTRIBUYE]->(b:Partner {nombre: $brandNombre})
            RETURN rel
        `;
        const checkResult = await session.run(checkQuery, { retailerName, brandNombre });
        let distribuido = false;

        if (checkResult.records.length > 0) {
            await session.run(`
                MATCH (r:Partner {nombre: $retailerName})-[rel:DISTRIBUYE]->(b:Partner {nombre: $brandNombre})
                DELETE rel
            `, { retailerName, brandNombre });
        } else {
            await session.run(`
                MATCH (r:Partner {nombre: $retailerName})
                MATCH (b:Partner {nombre: $brandNombre})
                MERGE (r)-[:DISTRIBUYE]->(b)
            `, { retailerName, brandNombre });
            distribuido = true;
        }

        res.status(200).json({
            message: distribuido ? 'Marca asociada exitosamente' : 'Marca desasociada exitosamente',
            distribuido
        });
    } catch (error) {
        console.error('Error al toggle de marca retail:', error);
        res.status(500).json({ error: error.message });
    } finally {
        await session.close();
    }
};

// GET /api/b2b/analytics/retail-conversions
// Requiere Tier RETAIL
export const obtenerConversionesRetail = async (req, res) => {
    const session = getSession();
    const retailerName = req.b2bClient.nombre;
    try {
        const comprasQuery = `
            MATCH (c:Compra)-[:COMPRADA_EN]->(p:Partner {nombre: $retailerName})
            RETURN c.id AS id, c.fecha AS fecha, c.monto AS monto, c.itemsCount AS itemsCount
            ORDER BY c.fecha DESC
        `;
        const comprasResult = await session.run(comprasQuery, { retailerName });
        const compras = comprasResult.records.map(record => {
            const monto = record.get('monto');
            const itemsCount = record.get('itemsCount');
            return {
                id: record.get('id'),
                fecha: record.get('fecha'),
                monto: neo4j.isInt(monto) ? monto.toNumber() : Number(monto),
                itemsCount: neo4j.isInt(itemsCount) ? itemsCount.toNumber() : Number(itemsCount)
            };
        });

        const totalCompras = compras.length;
        const totalIngresos = compras.reduce((sum, c) => sum + c.monto, 0);
        const ticketPromedio = totalCompras > 0 ? (totalIngresos / totalCompras) : 0;
        const vistasEstimadas = totalCompras * 12 + 150;
        const tasaConversion = totalCompras > 0 ? Number(((totalCompras / vistasEstimadas) * 100).toFixed(2)) : 0;

        const marcasRanking = [
            { nombre: 'Hellmanns', ventas: Math.round(totalCompras * 0.6) },
            { nombre: 'Nestle', ventas: Math.round(totalCompras * 0.3) }
        ].filter(m => m.ventas > 0);

        res.status(200).json({
            retailer: retailerName,
            totalCompras,
            totalIngresos,
            ticketPromedio: Number(ticketPromedio.toFixed(2)),
            tasaConversion,
            compras,
            marcasRanking
        });
    } catch (error) {
        console.error('Error al obtener analíticas de retail:', error);
        res.status(500).json({ error: error.message });
    } finally {
        await session.close();
    }
};

// POST /api/b2b/retail/checkout (Público)
export const registrarCheckoutRetail = async (req, res) => {
    const { retailerNombre, monto, itemsCount } = req.body;
    if (!retailerNombre || !monto) {
        return res.status(400).json({ error: 'Faltan parámetros: retailerNombre o monto' });
    }

    const session = getSession();
    try {
        const query = `
            MATCH (p:Partner {nombre: $retailerNombre})
            CREATE (c:Compra {
                id: $id,
                fecha: $fecha,
                monto: $monto,
                itemsCount: $itemsCount
            })-[:COMPRADA_EN]->(p)
            RETURN c.id AS id
        `;
        const id = 'compra_' + Math.random().toString(36).substr(2, 9);
        const fecha = new Date().toISOString().split('T')[0];

        await session.run(query, {
            retailerNombre,
            id,
            fecha,
            monto: parseFloat(monto),
            itemsCount: parseInt(itemsCount || 0)
        });

        res.status(201).json({
            message: 'Compra registrada exitosamente',
            id
        });
    } catch (error) {
        console.error('Error al registrar checkout:', error);
        res.status(500).json({ error: error.message });
    } finally {
        await session.close();
    }
};

// GET /api/b2b/retail/resolve-cart (Público)
export const resolverCarritoRetail = async (req, res) => {
    const { retailer, ingredientes } = req.query;
    if (!retailer || !ingredientes) {
        return res.status(400).json({ error: 'Faltan parámetros: retailer o ingredientes' });
    }

    const listaIngredientes = ingredientes.split(',').map(i => i.trim()).filter(Boolean);
    const session = getSession();
    try {
        const brandsQuery = `
            MATCH (p:Partner {nombre: $retailer})-[:DISTRIBUYE]->(b:Partner {tier: 'BRAND'})
            RETURN b.nombre AS brandName
        `;
        const brandsResult = await session.run(brandsQuery, { retailer });
        const marcasDistribuidas = brandsResult.records.map(r => r.get('brandName'));

        const sponsoredQuery = `
            MATCH (i:Ingrediente)
            WHERE i.pesoPatrocinio > 0
            RETURN i.nombre AS nombre, i.pesoPatrocinio AS peso
        `;
        const sponsoredResult = await session.run(sponsoredQuery);
        const sponsoredIngs = sponsoredResult.records.map(r => ({
            nombre: r.get('nombre'),
            peso: r.get('peso')
        }));

        const items = listaIngredientes.map(ing => {
            const lowerIng = ing.toLowerCase();
            const match = sponsoredIngs.find(si => {
                const lowerSi = si.nombre.toLowerCase();
                const matchesIng = lowerSi.includes(lowerIng);
                const matchesBrand = marcasDistribuidas.some(b => lowerSi.includes(b.toLowerCase()));
                return matchesIng && matchesBrand;
            });

            if (match) {
                const baseHash = match.nombre.charCodeAt(0) + (match.nombre.charCodeAt(1) || 0);
                const precio = 350 + (baseHash % 25) * 20; 
                return {
                    original: ing,
                    nombre: match.nombre,
                    marca: marcasDistribuidas.find(b => match.nombre.toLowerCase().includes(b.toLowerCase())),
                    precio,
                    esPatrocinado: true
                };
            } else {
                const baseHash = ing.charCodeAt(0) + (ing.charCodeAt(1) || 0);
                const precio = 150 + (baseHash % 15) * 15; 
                return {
                    original: ing,
                    nombre: `${ing.charAt(0).toUpperCase() + ing.slice(1)} (Genérico ${retailer})`,
                    marca: `Marca Propia ${retailer}`,
                    precio,
                    esPatrocinado: false
                };
            }
        });

        const total = items.reduce((sum, item) => sum + item.precio, 0);

        res.status(200).json({
            retailer,
            items,
            total
        });
    } catch (error) {
        console.error('Error al resolver carrito de retail:', error);
        res.status(500).json({ error: error.message });
    } finally {
        await session.close();
    }
};
