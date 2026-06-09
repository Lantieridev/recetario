import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import usuariosRoutes from './routes/usuariosRoutes.js';
import recetasRoutes from './routes/recetasRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import b2bRoutes from './routes/b2bRoutes.js';

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

// Endpoint de salud
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', timestamp: new Date() });
});

// Manejo de ruta 404
app.use((req, res, next) => {
    res.status(404).json({ error: 'Ruta no encontrada' });
});

export default app;
