import { Router } from 'express';
import { RoomieController } from './roomie.controller.js';

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

export default router;