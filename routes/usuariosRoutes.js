import express from 'express';
import { 
    crearUsuario, 
    obtenerUsuario, 
    agregarFavorito, 
    obtenerRecomendaciones,
    loginUsuario,
    toggleFavorito
} from '../controllers/usuariosController.js';

const router = express.Router();

router.post('/login', loginUsuario);
router.post('/', crearUsuario);
router.get('/:nombre', obtenerUsuario);
router.post('/:nombre/favoritos', agregarFavorito);
router.post('/:nombre/favoritos/toggle', toggleFavorito);
router.get('/:nombre/recomendaciones', obtenerRecomendaciones);

export default router;
