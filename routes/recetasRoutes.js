import express from 'express';
import { 
    crearReceta, 
    agregarIngrediente, 
    listarRecetas, 
    buscarRecetas,
    obtenerReceta,
    obtenerCategorias,
    obtenerIngredientes
} from '../controllers/recetasController.js';

const router = express.Router();

router.get('/categorias', obtenerCategorias);
router.get('/ingredientes', obtenerIngredientes);
router.get('/buscar', buscarRecetas);
router.post('/', crearReceta);
router.post('/:titulo/ingredientes', agregarIngrediente);
router.get('/', listarRecetas);
router.get('/:titulo', obtenerReceta);

export default router;
