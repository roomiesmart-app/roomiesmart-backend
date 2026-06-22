import { Router } from 'express';
import { RoomieController } from './roomie.controller.js';
import { requireClerkAuth } from '../../../../core/middlewares/clerk-auth.middleware.js';

const router = Router();
const roomieController = new RoomieController();

// Routes
// 1. Endpoint
// Deal: POST /api/v1/identity/register
router.post('/api/v1/identity/register', roomieController.register.bind(roomieController));
router.post('/api/v1/identity/login', roomieController.login.bind(roomieController));

// 2. Endpoint
// Deal: GET /api/v1/identity/matchmaking-profiles?userId=uuid-del-usuario
router.get('/api/v1/identity/matchmaking-profiles', roomieController.getMatchmakingCards.bind(roomieController));

// 1. Libre (Cualquiera puede preguntar si un correo existe)
router.get('/api/v1/identity/check-status/:email', roomieController.checkStatus.bind(roomieController));

// 2. PROTEGIDA POR CLERK (Solo entra si trae el Token JWT de Microsoft/Clerk)
router.post('/api/v1/identity/onboarding', requireClerkAuth, roomieController.onboarding.bind(roomieController));

export default router;