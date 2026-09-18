const express = require('express');
const router = express.Router();
const settingController = require('../controllers/settingController');
const authMiddleware = require('../middleware/auth');
const upload = require('../middleware/upload');
const uploadMusic = require('../middleware/musicUpload');

router.get('/', settingController.getSettings);
router.put('/', authMiddleware, settingController.updateSettings);
router.post('/music', authMiddleware, uploadMusic.single('music'), settingController.uploadMusic);
router.get('/music/:filename', authMiddleware, settingController.streamMusic);
router.post('/hero-background', authMiddleware, upload.single('image'), settingController.uploadHeroBackground);
router.put('/hero-background', authMiddleware, settingController.updateHeroBackgroundLayout);
router.post('/verify-pin', authMiddleware, settingController.verifyPin);
router.put('/pin', authMiddleware, settingController.updatePin);

module.exports = router;
