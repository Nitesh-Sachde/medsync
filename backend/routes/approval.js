const express = require('express');
const router = express.Router();
const approvalController = require('../controllers/approvalController');
const auth = require('../middleware/auth');
const role = require('../middleware/role');

// Create approval (admin)
router.post('/', auth, role(['admin']), approvalController.createApproval);
// Get all approvals (admin, receptionist, doctor)
router.get('/', auth, role(['admin', 'receptionist', 'doctor']), approvalController.getApprovals);
// Get single approval (admin, receptionist, doctor)
router.get('/:id', auth, role(['admin', 'receptionist', 'doctor']), approvalController.getApproval);
// Update approval (admin)
router.put('/:id', auth, role(['admin']), approvalController.updateApproval);
// Delete approval (admin)
router.delete('/:id', auth, role(['admin']), approvalController.deleteApproval);

module.exports = router; 