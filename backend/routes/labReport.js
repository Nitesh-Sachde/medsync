const express = require('express');
const router = express.Router();
const labReportController = require('../controllers/labReportController');
const auth = require('../middleware/auth');
const role = require('../middleware/role');

// Create lab report (doctor, admin)
router.post('/', auth, role(['doctor', 'admin']), labReportController.createLabReport);
// Get all lab reports (doctor, admin, patient)
router.get('/', auth, role(['doctor', 'admin', 'patient']), labReportController.getLabReports);
// Get single lab report (self, doctor, admin)
router.get('/:id', auth, role(['doctor', 'admin', 'patient']), labReportController.getLabReport);
// Update lab report (doctor, admin)
router.put('/:id', auth, role(['doctor', 'admin']), labReportController.updateLabReport);
// Delete lab report (doctor, admin)
router.delete('/:id', auth, role(['doctor', 'admin']), labReportController.deleteLabReport);

module.exports = router; 