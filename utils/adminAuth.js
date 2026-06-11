import { getSession } from '../config/neo4j.js';

export const adminAuth = () => {
    return async (req, res, next) => {
        const userName = req.header('X-USER-NAME');

        if (!userName) {
            return res.status(401).json({ error: 'Acceso Denegado. No se especificó el usuario.' });
        }

        const session = getSession();
        try {
            const query = `
                MATCH (u:Usuario {nombre: $userName})
                RETURN u.isAdmin AS isAdmin
            `;
            const result = await session.run(query, { userName });

            if (result.records.length === 0) {
                return res.status(404).json({ error: 'Usuario no encontrado' });
            }

            const isAdmin = result.records[0].get('isAdmin');

            if (!isAdmin) {
                return res.status(403).json({ error: 'Acceso Denegado. Se requieren permisos de administrador.' });
            }

            next();
        } catch (error) {
            console.error('Error en adminAuth:', error);
            res.status(500).json({ error: 'Error en la verificación de permisos.' });
        } finally {
            await session.close();
        }
    };
};
