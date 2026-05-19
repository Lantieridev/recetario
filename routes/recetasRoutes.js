import express from 'express';
import { 
    crearReceta, 
    agregarIngrediente, 
    listarRecetas, 
    buscarRecetas 
} from '../controllers/recetasController.js';

const router = express.Router();

router.get('/buscar', buscarRecetas);
router.post('/', crearReceta);
router.post('/:titulo/ingredientes', agregarIngrediente);
router.get('/', listarRecetas);

export default router;
