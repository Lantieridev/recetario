import express from 'express';
import { 
    crearUsuario, 
    obtenerUsuario, 
    agregarFavorito, 
    obtenerRecomendaciones,
    loginUsuario,
    toggleFavorito,
    seguirUsuario,
    dejarDeSeguirUsuario,
    obtenerComunidad,
    registrarHistorial,
    obtenerExplicacionRecomendacion,
    obtenerUsuarioStatus
} from '../controllers/usuariosController.js';

const router = express.Router();

router.post('/login', loginUsuario);
router.post('/', crearUsuario);
router.get('/:nombre/status', obtenerUsuarioStatus);
router.get('/:nombre/comunidad', obtenerComunidad);
router.get('/:nombre/recomendaciones', obtenerRecomendaciones);
router.get('/:nombre/recomendaciones/:recetaId/explicacion', obtenerExplicacionRecomendacion);
router.get('/:nombre', obtenerUsuario);
router.post('/:nombre/favoritos/toggle', toggleFavorito);
router.post('/:nombre/favoritos', agregarFavorito);
router.post('/:nombre/seguir', seguirUsuario);
router.post('/:nombre/dejardeseguir', dejarDeSeguirUsuario);
router.post('/:nombre/historial', registrarHistorial);

export default router;
