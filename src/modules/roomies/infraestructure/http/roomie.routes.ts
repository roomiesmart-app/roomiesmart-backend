import { Router } from 'express';
import { RoomieController } from './roomie.controller.js';
import { requireKindeAuth } from '../../../../core/middlewares/kinde-auth.middleware.js';

const router = Router();
const roomieController = new RoomieController();

router.post('/api/v1/identity/register', roomieController.register.bind(roomieController));
router.post('/api/v1/identity/login', roomieController.login.bind(roomieController));
router.post('/api/v1/identity/matchmaking-profiles', roomieController.getMatchmakingCards.bind(roomieController));
router.get('/api/v1/identity/check-status/:email', roomieController.checkStatus.bind(roomieController));
router.post('/api/v1/identity/onboarding', requireKindeAuth, roomieController.onboarding.bind(roomieController));
router.get('/session', requireKindeAuth, roomieController.checkSession);
// Endpoint para el botón "Mensaje" de la tarjeta
router.post('/api/v1/roomies/conversations', roomieController.initializeConversation.bind(roomieController));

// Endpoint para cargar el historial de chats
router.get('/api/v1/roomies/conversations/:conversationId/messages', roomieController.getHistory.bind(roomieController));

// Endpoint para enviar un mensaje
router.post('/api/v1/roomies/conversations/:conversationId/messages', roomieController.sendMessage.bind(roomieController));

export default router;