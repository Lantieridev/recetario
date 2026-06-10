import express from 'express';
import { adminAuth } from '../utils/adminAuth.js';
import {
    adminGetStats,
    adminGetPartners,
    adminCreatePartner,
    adminDeletePartner,
    adminGetUsers,
    adminAssociateUser,
    adminDissociateUser
} from '../controllers/adminController.js';

const router = express.Router();

// Todos los endpoints de administración requieren estar autenticados como administrador
router.use(adminAuth());

router.get('/stats', adminGetStats);
router.get('/partners', adminGetPartners);
router.post('/partners', adminCreatePartner);
router.delete('/partners/:nombre', adminDeletePartner);
router.get('/users', adminGetUsers);
router.post('/users/associate', adminAssociateUser);
router.post('/users/dissociate', adminDissociateUser);

export default router;
