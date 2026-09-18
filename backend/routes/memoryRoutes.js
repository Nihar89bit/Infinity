const express = require('express');
const router = express.Router();
const memoryController = require('../controllers/memoryController');
const authMiddleware = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/', authMiddleware, memoryController.getMemories);
router.post('/', authMiddleware, upload.single('image'), memoryController.uploadMemory);
router.put('/:id', authMiddleware, memoryController.updateMemory);
router.delete('/:id', authMiddleware, memoryController.deleteMemory);

module.exports = router;
