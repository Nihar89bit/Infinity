const express = require('express');
const router = express.Router();
const timelineController = require('../controllers/timelineController');
const authMiddleware = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/', authMiddleware, timelineController.getTimeline);
router.post('/', authMiddleware, upload.single('image'), timelineController.createTimelineEvent);
router.put('/:id', authMiddleware, upload.single('image'), timelineController.updateTimelineEvent);
router.delete('/:id', authMiddleware, timelineController.deleteTimelineEvent);

module.exports = router;
