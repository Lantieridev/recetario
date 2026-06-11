import express from 'express';
import { b2bAuth } from '../utils/b2bAuth.js';
import { patrocinarIngrediente, obtenerTendenciasSabor } from '../controllers/b2bController.js';

const router = express.Router();

// Aplica nivel BRAND (Marcas) o RETAIL (Supermercados) o ENTERPRISE
router.post('/bidding', b2bAuth(), patrocinarIngrediente);
router.post('/stock-clearance', b2bAuth('RETAIL'), patrocinarIngrediente);

// Aplica nivel ENTERPRISE
router.get('/analytics/flavor-trends', b2bAuth('ENTERPRISE'), obtenerTendenciasSabor);

// Valida la API Key corporativa y retorna la información del partner
router.get('/validate', b2bAuth(), (req, res) => {
    res.status(200).json({ valid: true, client: req.b2bClient });
});

export default router;
