const express = require('express');
const router = express.Router();
const secretController = require('../controllers/secretController');
const authMiddleware = require('../middleware/auth');
const pinAuthMiddleware = require('../middleware/pinAuth');

router.use(authMiddleware);
router.use(pinAuthMiddleware);

router.get('/', secretController.getSecretItems);
router.post('/', secretController.createSecretItem);
router.put('/:id', secretController.updateSecretItem);
router.delete('/:id', secretController.deleteSecretItem);

module.exports = router;
