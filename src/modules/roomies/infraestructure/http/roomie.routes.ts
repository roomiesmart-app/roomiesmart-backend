import { Router } from 'express';
import { RoomieController } from './roomie.controller.js';
import { requireKindeAuth } from '../../../../core/middlewares/kinde-auth.middleware.js';

const router = Router();
const roomieController = new RoomieController();

router.post('/api/v1/identity/register', roomieController.register.bind(roomieController));
router.post('/api/v1/identity/login', roomieController.login.bind(roomieController));
router.post('/api/v1/identity/matchmaking-profiles', roomieController.getMatchmakingCards.bind(roomieController));
router.get('/api/v1/identity/check-status/:email', roomieController.checkStatus.bind(roomieController));
router.get('/api/v1/identity/me', requireKindeAuth, roomieController.getMe.bind(roomieController));
router.post('/api/v1/identity/onboarding', requireKindeAuth, roomieController.onboarding.bind(roomieController));
router.get('/session', requireKindeAuth, roomieController.checkSession);


router.post('/api/v1/roomies/conversations', roomieController.initializeConversation.bind(roomieController));


router.get('/api/v1/roomies/conversations/user/:userId', roomieController.getInbox.bind(roomieController));


router.get('/api/v1/roomies/conversations/:conversationId/messages', roomieController.getHistory.bind(roomieController));


router.post('/api/v1/roomies/conversations/:conversationId/messages', roomieController.sendMessage.bind(roomieController));


router.get('/api/v1/catalogs/cities', roomieController.getCities.bind(roomieController));
router.get('/api/v1/catalogs/common-areas', roomieController.getCommonAreas.bind(roomieController));
router.get('/api/v1/catalogs/amenities', roomieController.getAmenities.bind(roomieController));


router.post(
  '/api/v1/roomies/spaces',
  roomieController.createSpace.bind(roomieController)
);


router.get(
  '/api/v1/roomies/spaces',
  roomieController.listSpaces.bind(roomieController)
);

router.get(
  '/api/v1/roomies/users/:userId/departments',
  roomieController.listUserDepartments.bind(roomieController)
);


router.post(
  '/api/v1/roomies/spaces/:id/requests',
  roomieController.requestToJoin.bind(roomieController)
);
router.get(
  '/api/v1/roomies/requests',
  roomieController.listPendingRequests.bind(roomieController)
);
router.patch(
  '/api/v1/roomies/requests/:id',
  roomieController.resolveRequest.bind(roomieController)
);
router.get(
  '/api/v1/roomies/departments/:id/members',
  roomieController.getDepartmentMembers.bind(roomieController)
);


router.put(
  '/api/v1/roomies/spaces/:id',
  requireKindeAuth,
  roomieController.updateSpace.bind(roomieController)
);
router.delete(
  '/api/v1/roomies/spaces/:id',
  requireKindeAuth,
  roomieController.deleteSpace.bind(roomieController)
);

export default router;

