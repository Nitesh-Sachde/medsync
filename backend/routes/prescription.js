const express = require('express');
const router = express.Router();
const prescriptionController = require('../controllers/prescriptionController');
const auth = require('../middleware/auth');
const role = require('../middleware/role');

// Create prescription (doctor, pharmacist)
router.post('/', auth, role(['doctor', 'pharmacist']), prescriptionController.createPrescription);
// Get all prescriptions (doctor, pharmacist, patient)
router.get('/', auth, role(['doctor', 'pharmacist', 'patient']), prescriptionController.getPrescriptions);
// Get single prescription (self, doctor, pharmacist)
router.get('/:id', auth, role(['doctor', 'pharmacist', 'patient']), prescriptionController.getPrescription);
// Update prescription (doctor, pharmacist)
router.put('/:id', auth, role(['doctor', 'pharmacist']), prescriptionController.updatePrescription);
// Delete prescription (doctor, pharmacist)
router.delete('/:id', auth, role(['doctor', 'pharmacist']), prescriptionController.deletePrescription);

module.exports = router; 