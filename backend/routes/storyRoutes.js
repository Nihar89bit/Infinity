const express = require('express');
const router = express.Router();
const storyController = require('../controllers/storyController');
const authMiddleware = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/', authMiddleware, storyController.getStory);
router.post('/', authMiddleware, upload.single('image'), storyController.createStoryStage);
router.put('/:id', authMiddleware, upload.single('image'), storyController.updateStoryStage);
router.delete('/:id', authMiddleware, storyController.deleteStoryStage);

module.exports = router;
