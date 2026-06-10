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
        // Consultar a Neo4j para ver si existe la versión singular o plural
        const checkQuery = `
            MATCH (i:Ingrediente)
            WHERE i.nombre = $baseName OR ($alternative IS NOT NULL AND i.nombre = $alternative)
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
