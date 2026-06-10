import { getSession } from '../config/neo4j.js';
import neo4j from 'neo4j-driver';

// GET /api/admin/stats
export const adminGetStats = async (req, res) => {
    const session = getSession();
    try {
        const uRes = await session.run('MATCH (u:Usuario) RETURN count(u) AS count');
        const rRes = await session.run('MATCH (r:Receta) RETURN count(r) AS count');
        const pRes = await session.run('MATCH (p:Partner) RETURN count(p) AS count');
        const bRes = await session.run('MATCH (i:Ingrediente) WHERE i.pesoPatrocinio > 0 RETURN count(i) AS count');

        const toNumber = (val) => neo4j.isInt(val) ? val.toNumber() : Number(val);

        res.status(200).json({
            totalUsers: toNumber(uRes.records[0].get('count')),
            totalRecipes: toNumber(rRes.records[0].get('count')),
            totalPartners: toNumber(pRes.records[0].get('count')),
            activeBids: toNumber(bRes.records[0].get('count'))
        });
    } catch (error) {
        console.error('Error al obtener estadísticas de admin:', error);
        res.status(500).json({ error: 'Error al obtener métricas del sistema.' });
    } finally {
        await session.close();
    }
};

// GET /api/admin/partners
export const adminGetPartners = async (req, res) => {
    const session = getSession();
    try {
        const result = await session.run('MATCH (p:Partner) RETURN p.nombre AS nombre, p.tier AS tier, p.dominio AS dominio ORDER BY p.nombre');
        const partners = result.records.map(r => ({
            nombre: r.get('nombre'),
            tier: r.get('tier'),
            dominio: r.get('dominio') || ''
        }));
        res.status(200).json({ partners });
    } catch (error) {
        console.error('Error al listar partners:', error);
        res.status(500).json({ error: 'Error al obtener listado de partners.' });
    } finally {
        await session.close();
    }
};

// POST /api/admin/partners
export const adminCreatePartner = async (req, res) => {
    const { nombre, tier, dominio } = req.body;
    if (!nombre || !tier || !dominio) {
        return res.status(400).json({ error: 'Faltan parámetros obligatorios: nombre, tier y dominio.' });
    }

    const session = getSession();
    try {
        const cleanDominio = dominio.trim().toLowerCase();
        const result = await session.run(`
            MERGE (p:Partner {nombre: $nombre})
            ON CREATE SET p.tier = $tier, p.dominio = $cleanDominio
            ON MATCH SET p.tier = $tier, p.dominio = $cleanDominio
            RETURN p.nombre AS nombre, p.tier AS tier, p.dominio AS dominio
        `, { nombre: nombre.trim(), tier, cleanDominio });

        res.status(201).json({
            message: 'Partner creado/actualizado exitosamente',
            partner: {
                nombre: result.records[0].get('nombre'),
                tier: result.records[0].get('tier'),
                dominio: result.records[0].get('dominio')
            }
        });
    } catch (error) {
        console.error('Error al crear partner:', error);
        res.status(500).json({ error: 'Error al registrar el partner.' });
    } finally {
        await session.close();
    }
};

// DELETE /api/admin/partners/:nombre
export const adminDeletePartner = async (req, res) => {
    const { nombre } = req.params;
    const session = getSession();
    try {
        await session.run('MATCH (p:Partner {nombre: $nombre}) DETACH DELETE p', { nombre });
        res.status(200).json({ message: 'Partner eliminado exitosamente.' });
    } catch (error) {
        console.error('Error al eliminar partner:', error);
        res.status(500).json({ error: 'Error al eliminar el partner.' });
    } finally {
        await session.close();
    }
};

// GET /api/admin/users
export const adminGetUsers = async (req, res) => {
    const session = getSession();
    try {
        const result = await session.run(`
            MATCH (u:Usuario)
            OPTIONAL MATCH (u)-[r:EMPLEADO_DE]->(p:Partner)
            RETURN u.nombre AS nombre, u.mail AS mail, u.isAdmin AS isAdmin, p.nombre AS partnerNombre, p.tier AS partnerTier, r.activo AS partnerActivo
            ORDER BY u.nombre
        `);

        const users = result.records.map(r => ({
            nombre: r.get('nombre'),
            mail: r.get('mail'),
            isAdmin: !!r.get('isAdmin'),
            partner: r.get('partnerNombre') ? {
                nombre: r.get('partnerNombre'),
                tier: r.get('partnerTier'),
                activo: r.get('partnerActivo') !== false // defaults to true if property is missing, or checks value
            } : null
        }));

        res.status(200).json({ users });
    } catch (error) {
        console.error('Error al listar usuarios:', error);
        res.status(500).json({ error: 'Error al obtener listado de usuarios.' });
    } finally {
        await session.close();
    }
};

// POST /api/admin/users/associate
export const adminAssociateUser = async (req, res) => {
    const { usuarioNombre, partnerNombre } = req.body;
    if (!usuarioNombre || !partnerNombre) {
        return res.status(400).json({ error: 'Faltan parámetros obligatorios: usuarioNombre y partnerNombre.' });
    }

    const session = getSession();
    try {
        // Eliminar cualquier asociación B2B anterior y crear la nueva pre-confirmada (activo: true)
        const query = `
            MATCH (u:Usuario {nombre: $usuarioNombre})
            MATCH (p:Partner {nombre: $partnerNombre})
            OPTIONAL MATCH (u)-[r:EMPLEADO_DE]->(:Partner)
            DELETE r
            WITH u, p
            MERGE (u)-[:EMPLEADO_DE {activo: true}]->(p)
            RETURN u.nombre AS usuario, p.nombre AS partner
        `;
        const result = await session.run(query, { usuarioNombre, partnerNombre });

        if (result.records.length === 0) {
            return res.status(404).json({ error: 'Usuario o Partner no encontrados.' });
        }

        res.status(200).json({
            message: 'Usuario asociado al partner comercial exitosamente',
            usuario: result.records[0].get('usuario'),
            partner: result.records[0].get('partner')
        });
    } catch (error) {
        console.error('Error al asociar usuario a partner:', error);
        res.status(500).json({ error: 'Error al asociar el usuario.' });
    } finally {
        await session.close();
    }
};

// POST /api/admin/users/confirm
export const adminConfirmUser = async (req, res) => {
    const { usuarioNombre } = req.body;
    if (!usuarioNombre) {
        return res.status(400).json({ error: 'Falta parámetro obligatorio: usuarioNombre.' });
    }

    const session = getSession();
    try {
        const query = `
            MATCH (u:Usuario {nombre: $usuarioNombre})-[r:EMPLEADO_DE]->(:Partner)
            SET r.activo = true
            RETURN u.nombre AS usuario
        `;
        const result = await session.run(query, { usuarioNombre });

        if (result.records.length === 0) {
            return res.status(404).json({ error: 'Relación B2B no encontrada para el usuario especificado.' });
        }

        res.status(200).json({
            message: 'Usuario verificado y autorizado para operar B2B.',
            usuario: result.records[0].get('usuario')
        });
    } catch (error) {
        console.error('Error al confirmar usuario:', error);
        res.status(500).json({ error: 'Error al autorizar el usuario.' });
    } finally {
        await session.close();
    }
};

// POST /api/admin/users/dissociate
export const adminDissociateUser = async (req, res) => {
    const { usuarioNombre } = req.body;
    if (!usuarioNombre) {
        return res.status(400).json({ error: 'Falta parámetro obligatorio: usuarioNombre.' });
    }

    const session = getSession();
    try {
        const query = `
            MATCH (u:Usuario {nombre: $usuarioNombre})-[r:EMPLEADO_DE]->(:Partner)
            DELETE r
            RETURN u.nombre AS usuario
        `;
        const result = await session.run(query, { usuarioNombre });

        res.status(200).json({
            message: 'Acceso B2B revocado exitosamente para el usuario.',
            usuario: result.records.length > 0 ? result.records[0].get('usuario') : usuarioNombre
        });
    } catch (error) {
        console.error('Error al desasociar usuario:', error);
        res.status(500).json({ error: 'Error al revocar el acceso B2B.' });
    } finally {
        await session.close();
    }
};
