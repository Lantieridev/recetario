import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import usuariosRoutes from './routes/usuariosRoutes.js';
import recetasRoutes from './routes/recetasRoutes.js';

const app = express();

// Middlewares
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Rutas
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/recetas', recetasRoutes);

// Endpoint de salud
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', timestamp: new Date() });
});

// Manejo de ruta 404
app.use((req, res, next) => {
    res.status(404).json({ error: 'Ruta no encontrada' });
});

export default app;
