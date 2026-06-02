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
    obtenerTendencias
} from '../controllers/recetasController.js';

const router = express.Router();

router.get('/categorias', obtenerCategorias);
router.get('/ingredientes', obtenerIngredientes);
router.get('/buscar', buscarRecetas);
router.get('/tendencias', obtenerTendencias);
router.get('/del-dia', obtenerRecetaDelDia);
router.post('/', crearReceta);
router.get('/', listarRecetas);
router.post('/:titulo/ingredientes', agregarIngrediente);
router.get('/:titulo/similares', obtenerRecetasSimilares);
router.get('/:titulo', obtenerReceta);

export default router;
