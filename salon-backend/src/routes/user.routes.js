const router = require('express').Router();
const c = require('../controllers/user.controller');
const { verifyToken } = require('../middlewares/auth.middleware');
const { upload } = require('../middlewares/upload.middleware');

router.use(verifyToken);

router.get('/me', c.getMe);
router.patch('/me', upload.single('avatar'), c.updateMe);
router.delete('/me', c.deleteAccount);
router.patch('/me/password', c.changePassword);

router.get('/me/addresses', c.getMe);
router.post('/me/addresses', c.addAddress);
router.patch('/me/addresses/:addressId', c.updateAddress);
router.delete('/me/addresses/:addressId', c.deleteAddress);

router.get('/me/favorites', c.getFavorites);
router.post('/me/favorites/:salonId', c.toggleFavoriteSalon);

module.exports = router;
