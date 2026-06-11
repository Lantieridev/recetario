import { getSession } from '../config/neo4j.js';

// Mock de base de datos de clientes corporativos por retrocompatibilidad
const CLIENTES_B2B_MOCK = {
    'HELLMANNS-1234': { nombre: 'Hellmanns', tier: 'BRAND' },
    'CARREFOUR-5678': { nombre: 'Carrefour', tier: 'RETAIL' },
    'NESTLE-9999': { nombre: 'Nestle', tier: 'ENTERPRISE' }
};

export const b2bAuth = (requiredTier) => {
    return async (req, res, next) => {
        // Puede venir como X-USER-EMAIL o X-API-KEY
        const credential = req.header('X-USER-EMAIL') || req.header('X-API-KEY');

        if (!credential) {
            return res.status(401).json({ error: 'Acceso Denegado. Falla de Autenticación B2B (No Credencial)' });
        }

        let cliente = null;

        // Comprobación 1: Retrocompatibilidad con claves demo
        if (CLIENTES_B2B_MOCK[credential]) {
            cliente = CLIENTES_B2B_MOCK[credential];
        } else if (credential.includes('@')) {
            // Comprobación 2: Búsqueda dinámica en Neo4j por email y relación EMPLEADO_DE
            const session = getSession();
            try {
                const query = `
                    MATCH (u:Usuario {mail: $email})-[r:EMPLEADO_DE]->(p:Partner)
                    WHERE r.activo = true
                    RETURN p.nombre AS nombre, p.tier AS tier
                `;
                const result = await session.run(query, { email: credential });

                if (result.records.length > 0) {
                    const record = result.records[0];
                    cliente = {
                        nombre: record.get('nombre'),
                        tier: record.get('tier')
                    };
                }
            } catch (error) {
                console.error('Error al verificar socio B2B en Neo4j:', error);
                return res.status(500).json({ error: 'Error interno de autenticación B2B' });
            } finally {
                await session.close();
            }
        }

        if (!cliente) {
            return res.status(403).json({ error: 'Acceso Denegado. Socio B2B no registrado o sin vinculación activa.' });
        }

        // Si la ruta requiere un tier específico, verificamos
        if (requiredTier && cliente.tier !== requiredTier && cliente.tier !== 'ENTERPRISE') {
            return res.status(403).json({ 
                error: `Suscripción Insuficiente. Nivel requerido: ${requiredTier}. Nivel actual: ${cliente.tier}` 
            });
        }

        // Inyectamos los datos del cliente en la request
        req.b2bClient = cliente;
        next();
    };
};
