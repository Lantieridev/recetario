import express from 'express';
import { 
    crearUsuario, 
    obtenerUsuario, 
    agregarFavorito, 
    obtenerRecomendaciones 
} from '../controllers/usuariosController.js';

const router = express.Router();

router.post('/', crearUsuario);
router.get('/:nombre', obtenerUsuario);
router.post('/:nombre/favoritos', agregarFavorito);
router.get('/:nombre/recomendaciones', obtenerRecomendaciones);

export default router;
