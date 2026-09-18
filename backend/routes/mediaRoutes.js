const express = require('express');
const router = express.Router();
const memoryController = require('../controllers/memoryController');

// Serves uploaded files securely ONLY to authenticated users
router.get('/:filename', memoryController.serveMedia);

module.exports = router;
