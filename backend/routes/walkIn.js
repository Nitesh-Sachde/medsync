const express = require('express');
const router = express.Router();
const walkInController = require('../controllers/walkInController');
const auth = require('../middleware/auth');
const role = require('../middleware/role');

// Create walk-in (receptionist, admin)
router.post('/', auth, role(['receptionist', 'admin']), walkInController.createWalkIn);
// Get all walk-ins (receptionist, admin, doctor)
router.get('/', auth, role(['receptionist', 'admin', 'doctor']), walkInController.getWalkIns);
// Get single walk-in (receptionist, admin, doctor)
router.get('/:id', auth, role(['receptionist', 'admin', 'doctor']), walkInController.getWalkIn);
// Update walk-in (receptionist, admin)
router.put('/:id', auth, role(['receptionist', 'admin']), walkInController.updateWalkIn);
// Delete walk-in (receptionist, admin)
router.delete('/:id', auth, role(['receptionist', 'admin']), walkInController.deleteWalkIn);

module.exports = router; 