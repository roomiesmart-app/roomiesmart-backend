import { Router } from 'express';
import { RoomieController } from './roomie.controller.js';

const router = Router();
const roomieController = new RoomieController();

// Deal: POST /api/v1/identity/register
router.post('/api/v1/identity/register', roomieController.register.bind(roomieController));

export default router;