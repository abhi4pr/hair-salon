import { Router } from 'express';
import * as c from '../controllers/user.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';
import { upload } from '../middlewares/upload.middleware.js';

const router = Router();
router.use(verifyToken);

router.get('/me', c.getMe);
router.patch('/me', upload.single('avatar'), c.updateMe);
router.delete('/me', c.deleteAccount);
router.patch('/me/password', c.changePassword);

router.post('/me/addresses', c.addAddress);
router.patch('/me/addresses/:addressId', c.updateAddress);
router.delete('/me/addresses/:addressId', c.deleteAddress);

router.get('/me/favorites', c.getFavorites);
router.post('/me/favorites/:salonId', c.toggleFavoriteSalon);

export default router;
