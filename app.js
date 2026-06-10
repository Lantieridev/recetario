import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import usuariosRoutes from './routes/usuariosRoutes.js';
import recetasRoutes from './routes/recetasRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import b2bRoutes from './routes/b2bRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import { getSession } from './config/neo4j.js';

const app = express();

// Middlewares
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.static('FrontEnd'));

// Rutas
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/recetas', recetasRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/b2b', b2bRoutes);
app.use('/api/admin', adminRoutes);

// Endpoint de salud
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', timestamp: new Date() });
});

// Inicialización asíncrona de datos de administrador y socios corporativos de demostración
const inicializarDatosAdminB2B = async () => {
    const session = getSession();
    try {
        console.log('⏳ Asegurando usuarios demo B2B y administrador en Neo4j...');
        
        // Crear administrador
        await session.run(`
            MERGE (u:Usuario {nombre: 'Admin'})
            ON CREATE SET u.mail = 'admin@recetario.com', u.contrasena = 'admin123', u.isAdmin = true
            ON MATCH SET u.isAdmin = true
        `);

        // Crear partners
        await session.run(`
            MERGE (p1:Partner {nombre: 'Hellmanns'}) ON CREATE SET p1.tier = 'BRAND'
            MERGE (p2:Partner {nombre: 'Carrefour'}) ON CREATE SET p2.tier = 'RETAIL'
            MERGE (p3:Partner {nombre: 'Nestle'}) ON CREATE SET p3.tier = 'ENTERPRISE'
        `);

        // Crear usuarios de prueba corporativos y sus relaciones
        await session.run(`
            MERGE (u1:Usuario {nombre: 'Hellmanns'})
            ON CREATE SET u1.mail = 'socio@hellmanns.com', u1.contrasena = 'pass123'
            WITH u1
            MATCH (p1:Partner {nombre: 'Hellmanns'})
            MERGE (u1)-[:EMPLEADO_DE]->(p1)
        `);

        await session.run(`
            MERGE (u2:Usuario {nombre: 'Carrefour'})
            ON CREATE SET u2.mail = 'socio@carrefour.com', u2.contrasena = 'pass123'
            WITH u2
            MATCH (p2:Partner {nombre: 'Carrefour'})
            MERGE (u2)-[:EMPLEADO_DE]->(p2)
        `);

        await session.run(`
            MERGE (u3:Usuario {nombre: 'Nestle'})
            ON CREATE SET u3.mail = 'socio@nestle.com', u3.contrasena = 'pass123'
            WITH u3
            MATCH (p3:Partner {nombre: 'Nestle'})
            MERGE (u3)-[:EMPLEADO_DE]->(p3)
        `);

        console.log('✅ Usuarios demo B2B y administrador asegurados.');
    } catch (e) {
        console.error('❌ Error al inicializar datos administrativos:', e);
    } finally {
        await session.close();
    }
};

inicializarDatosAdminB2B();

// Manejo de ruta 404
app.use((req, res, next) => {
    res.status(404).json({ error: 'Ruta no encontrada' });
});

export default app;
