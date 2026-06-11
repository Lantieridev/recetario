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
    obtenerSugerenciasImagenes
} from '../controllers/recetasController.js';

const router = express.Router();

router.get('/categorias', obtenerCategorias);
router.get('/ingredientes', obtenerIngredientes);
router.get('/buscar', buscarRecetas);
router.get('/tendencias', obtenerTendencias);
router.get('/del-dia', obtenerRecetaDelDia);
router.get('/estadisticas-publicas', obtenerEstadisticasPublicas);
router.get('/sugerencias-imagenes', obtenerSugerenciasImagenes);
router.post('/', crearReceta);
router.get('/', listarRecetas);
router.post('/ingredientes/:ingrediente/alergenos', enlazarAlergeno);
router.post('/:titulo/ingredientes', agregarIngrediente);
router.get('/:titulo/similares', obtenerRecetasSimilares);
router.get('/:titulo/grafo', obtenerGrafoReceta);
router.get('/:titulo', obtenerReceta);

export default router;
