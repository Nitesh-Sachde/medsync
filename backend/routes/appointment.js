const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');
const auth = require('../middleware/auth');
const role = require('../middleware/role');

// Create appointment (admin, receptionist, patient)
router.post('/', auth, role(['admin', 'receptionist', 'patient']), appointmentController.createAppointment);
// Get all appointments (admin, receptionist, doctor, patient)
router.get('/', auth, role(['admin', 'receptionist', 'doctor', 'patient']), appointmentController.getAppointments);
// Get single appointment (self, admin, receptionist, doctor)
router.get('/:id', auth, role(['admin', 'receptionist', 'doctor', 'patient']), appointmentController.getAppointment);
// Update appointment (admin, receptionist)
router.put('/:id', auth, role(['admin', 'receptionist']), appointmentController.updateAppointment);
// Delete appointment (admin, receptionist)
router.delete('/:id', auth, role(['admin', 'receptionist']), appointmentController.deleteAppointment);

module.exports = router; 