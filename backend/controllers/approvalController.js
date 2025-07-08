const Approval = require('../models/Approval');

// Create approval (admin)
exports.createApproval = async (req, res) => {
  try {
    const { type, name, department, date } = req.body;
    const approval = new Approval({ type, name, department, date });
    await approval.save();
    res.status(201).json({ approval });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get all approvals (admin, receptionist, doctor)
exports.getApprovals = async (req, res) => {
  try {
    const approvals = await Approval.find();
    res.json({ approvals });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get single approval (admin, receptionist, doctor)
exports.getApproval = async (req, res) => {
  try {
    const approval = await Approval.findById(req.params.id);
    if (!approval) return res.status(404).json({ message: 'Approval not found' });
    res.json({ approval });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Update approval (admin)
exports.updateApproval = async (req, res) => {
  try {
    const { type, name, department, date } = req.body;
    const approval = await Approval.findById(req.params.id);
    if (!approval) return res.status(404).json({ message: 'Approval not found' });
    if (type) approval.type = type;
    if (name) approval.name = name;
    if (department) approval.department = department;
    if (date) approval.date = date;
    await approval.save();
    res.json({ approval });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Delete approval (admin)
exports.deleteApproval = async (req, res) => {
  try {
    const approval = await Approval.findById(req.params.id);
    if (!approval) return res.status(404).json({ message: 'Approval not found' });
    await approval.deleteOne();
    res.json({ message: 'Approval deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}; 