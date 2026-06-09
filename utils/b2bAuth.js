// Mock de base de datos de clientes corporativos
// En producción esto estaría en Neo4j o en Redis
const CLIENTES_B2B = {
    'HELLMANNS-1234': { nombre: 'Hellmanns', tier: 'BRAND' },
    'CARREFOUR-5678': { nombre: 'Carrefour', tier: 'RETAIL' },
    'NESTLE-9999': { nombre: 'Nestle', tier: 'ENTERPRISE' }
};

export const b2bAuth = (requiredTier) => {
    return (req, res, next) => {
        const apiKey = req.header('X-API-KEY');

        if (!apiKey) {
            return res.status(401).json({ error: 'Acceso Denegado. Falla de Autenticación B2B (No API Key)' });
        }

        const cliente = CLIENTES_B2B[apiKey];

        if (!cliente) {
            return res.status(403).json({ error: 'API Key corporativa inválida.' });
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
