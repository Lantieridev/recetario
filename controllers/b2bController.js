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
        // En Neo4j, usamos SET para actualizar o crear la propiedad pesoPatrocinio
        const query = `
            MATCH (i:Ingrediente {nombre: $ingrediente})
            SET i.pesoPatrocinio = coalesce(i.pesoPatrocinio, 0) + $pesoAñadido
            RETURN i.nombre AS Ingrediente, i.pesoPatrocinio AS PesoActual
        `;
        
        const result = await session.run(query, { ingrediente, pesoAñadido: parseFloat(pesoAñadido) });
        
        if (result.records.length === 0) {
            return res.status(404).json({ error: 'Ingrediente no encontrado en el grafo' });
        }
        
        res.status(200).json({
            message: 'Bidding aplicado exitosamente. El algoritmo priorizará este ingrediente.',
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
