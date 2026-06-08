import express from 'express';
import { 
    obtenerStats, 
    obtenerTopCreadores 
} from '../controllers/dashboardController.js';

const router = express.Router();

router.get('/stats', obtenerStats);
router.get('/top-creadores', obtenerTopCreadores);

export default router;
