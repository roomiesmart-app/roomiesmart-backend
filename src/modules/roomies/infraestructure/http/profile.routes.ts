import { Router } from 'express';
import { ProfileController } from './profile.controller.js';

const router = Router();
const profileController = new ProfileController();


router.get('/api/profiles', profileController.getProfile.bind(profileController));
router.post('/api/profiles', profileController.upsertProfile.bind(profileController));

export default router;