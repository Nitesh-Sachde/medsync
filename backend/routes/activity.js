const express = require('express');
const router = express.Router();
const activityController = require('../controllers/activityController');
const auth = require('../middleware/auth');
const role = require('../middleware/role');

// Create activity (admin)
router.post('/', auth, role(['admin']), activityController.createActivity);
// Get all activities (admin, doctor, receptionist, pharmacist)
router.get('/', auth, role(['admin', 'doctor', 'receptionist', 'pharmacist']), activityController.getActivities);
// Get single activity (admin, doctor, receptionist, pharmacist)
router.get('/:id', auth, role(['admin', 'doctor', 'receptionist', 'pharmacist']), activityController.getActivity);
// Update activity (admin)
router.put('/:id', auth, role(['admin']), activityController.updateActivity);
// Delete activity (admin)
router.delete('/:id', auth, role(['admin']), activityController.deleteActivity);

module.exports = router; 