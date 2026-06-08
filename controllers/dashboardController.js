import { getSession } from '../config/neo4j.js';
import neo4j from 'neo4j-driver';

// 1. Estadísticas Generales
// GET /api/dashboard/stats
export const obtenerStats = async (req, res) => {
    const session = getSession();
    try {
        const query = `
            MATCH (u:Usuario) WITH count(u) AS totalUsuarios
            MATCH (r:Receta) WITH totalUsuarios, count(r) AS totalRecetas
            OPTIONAL MATCH (c:Categoria)<-[:PERTENECE_A]-(rc:Receta)
            WITH totalUsuarios, totalRecetas, c.nombre AS categoriaTop, count(rc) AS recPorCat
            ORDER BY recPorCat DESC LIMIT 1
            RETURN totalUsuarios, totalRecetas, categoriaTop
        `;
        const result = await session.run(query);
        if (result.records.length === 0) {
            return res.status(200).json({ stats: { totalUsuarios: 0, totalRecetas: 0, categoriaTop: null } });
        }
        const r = result.records[0];
        
        const tu = r.get('totalUsuarios');
        const tr = r.get('totalRecetas');
        
        res.status(200).json({
            stats: {
                totalUsuarios: neo4j.isInt(tu) ? tu.toNumber() : Number(tu),
                totalRecetas: neo4j.isInt(tr) ? tr.toNumber() : Number(tr),
                categoriaTop: r.get('categoriaTop')
            }
        });
    } catch (error) {
        console.error('Error al obtener stats:', error);
        res.status(500).json({ error: 'Error interno', detalle: error.message });
    } finally {
        await session.close();
    }
};

// 2. Top Creadores
// GET /api/dashboard/top-creadores
export const obtenerTopCreadores = async (req, res) => {
    const session = getSession();
    try {
        const query = `
            MATCH (u:Usuario)-[:CREO]->(r:Receta)
            RETURN u.nombre AS creador, count(r) AS recetasAportadas
            ORDER BY recetasAportadas DESC LIMIT 5
        `;
        const result = await session.run(query);
        const topCreadores = result.records.map(r => {
            const count = r.get('recetasAportadas');
            return {
                creador: r.get('creador'),
                recetasAportadas: neo4j.isInt(count) ? count.toNumber() : Number(count)
            };
        });
        res.status(200).json({ topCreadores });
    } catch (error) {
        console.error('Error al obtener top creadores:', error);
        res.status(500).json({ error: 'Error interno', detalle: error.message });
    } finally {
        await session.close();
    }
};
