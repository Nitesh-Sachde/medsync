const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');
const role = require('../middleware/role');

router.post('/', auth, role(['admin']), userController.createUser);

// Change password route
router.post('/:userId/change-password', userController.changePassword);

module.exports = router; 