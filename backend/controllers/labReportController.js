const LabReport = require('../models/LabReport');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');

// Create lab report (doctor, admin)
exports.createLabReport = async (req, res) => {
  try {
    const { patient, test, date, status, result } = req.body;
    const labReport = new LabReport({ patient, test, date, status, result });
    await labReport.save();
    res.status(201).json({ labReport });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get all lab reports (doctor, admin)
exports.getLabReports = async (req, res) => {
  try {
    const labReports = await LabReport.find()
      .populate('patient')
      .populate('hospitalId');
    res.json({ labReports });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get single lab report (self, doctor, admin)
exports.getLabReport = async (req, res) => {
  try {
    const labReport = await LabReport.findById(req.params.id)
      .populate('patient')
      .populate('hospitalId');
    if (!labReport) return res.status(404).json({ message: 'Lab report not found' });
    // If patient, only allow self
    if (req.user.role === 'patient' && labReport.patient.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }
    res.json({ labReport });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Update lab report (doctor, admin)
exports.updateLabReport = async (req, res) => {
  try {
    const { test, date, status, result } = req.body;
    const labReport = await LabReport.findById(req.params.id);
    if (!labReport) return res.status(404).json({ message: 'Lab report not found' });
    if (test) labReport.test = test;
    if (date) labReport.date = date;
    if (status) labReport.status = status;
    if (result) labReport.result = result;
    await labReport.save();
    res.json({ labReport });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Delete lab report (doctor, admin)
exports.deleteLabReport = async (req, res) => {
  try {
    const labReport = await LabReport.findById(req.params.id);
    if (!labReport) return res.status(404).json({ message: 'Lab report not found' });
    await labReport.deleteOne();
    res.json({ message: 'Lab report deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}; 