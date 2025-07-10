const express = require('express');
const router = express.Router();
const doctorController = require('../controllers/doctorController');
const auth = require('../middleware/auth');
const role = require('../middleware/role');

// Create doctor (admin)
router.post('/', auth, role(['admin']), doctorController.createDoctor);
// Get all doctors (admin, receptionist, doctor)
router.get('/', auth, role(['admin', 'receptionist', 'doctor']), doctorController.getDoctors);
// Get single doctor (self, admin, receptionist)
router.get('/:id', auth, role(['admin', 'receptionist', 'doctor']), doctorController.getDoctor);
// Update doctor (admin or self)
router.put('/:id', auth, role(['admin', 'doctor']), doctorController.updateDoctor);
// Delete doctor (admin)
router.delete('/:id', auth, role(['admin']), doctorController.deleteDoctor);
router.get('/by-hospital', auth, role(['admin', 'receptionist', 'doctor', 'patient']), doctorController.getDoctorsByHospital);
router.get('/by-user/:userId', auth, role(['doctor', 'admin', 'receptionist']), doctorController.getDoctorByUser);

module.exports = router; 