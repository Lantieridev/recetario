import express from 'express';
import { 
    crearReceta, 
    agregarIngrediente, 
    listarRecetas, 
    buscarRecetas,
    obtenerReceta,
    obtenerCategorias,
    obtenerIngredientes,
    obtenerRecetasSimilares,
    obtenerRecetaDelDia,
    obtenerTendencias,
    obtenerGrafoReceta,
    enlazarAlergeno,
    obtenerEstadisticasPublicas,
    obtenerFeedSeguidos
} from '../controllers/recetasController.js';

const router = express.Router();

router.get('/categorias', obtenerCategorias);
router.get('/ingredientes', obtenerIngredientes);
router.get('/buscar', buscarRecetas);
router.get('/tendencias', obtenerTendencias);
router.get('/del-dia', obtenerRecetaDelDia);
router.get('/estadisticas-publicas', obtenerEstadisticasPublicas);
router.get('/feed/seguidos', obtenerFeedSeguidos);
router.post('/', crearReceta);
router.get('/', listarRecetas);
router.post('/ingredientes/:ingrediente/alergenos', enlazarAlergeno);
router.post('/:id/ingredientes', agregarIngrediente);
router.get('/:id/similares', obtenerRecetasSimilares);
router.get('/:id/grafo', obtenerGrafoReceta);
router.get('/:id', obtenerReceta);

export default router;
