const Prescription = require('../models/Prescription');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');

// Create prescription (doctor, pharmacist)
exports.createPrescription = async (req, res) => {
  try {
    const { patient, doctor, medication, quantity, status, date } = req.body;
    const prescription = new Prescription({ patient, doctor, medication, quantity, status, date });
    await prescription.save();
    res.status(201).json({ prescription });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get all prescriptions (doctor, pharmacist, patient)
exports.getPrescriptions = async (req, res) => {
  try {
    const prescriptions = await Prescription.find()
      .populate('patient')
      .populate({ path: 'doctor', populate: { path: 'user' } })
      .populate('hospitalId');
    res.json({ prescriptions });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get single prescription (self, doctor, pharmacist)
exports.getPrescription = async (req, res) => {
  try {
    const prescription = await Prescription.findById(req.params.id)
      .populate('patient')
      .populate({ path: 'doctor', populate: { path: 'user' } })
      .populate('hospitalId');
    if (!prescription) return res.status(404).json({ message: 'Prescription not found' });
    // If patient, only allow self
    if (req.user.role === 'patient' && prescription.patient.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }
    // If doctor, only allow self
    if (req.user.role === 'doctor' && prescription.doctor.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }
    res.json({ prescription });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Update prescription (doctor, pharmacist)
exports.updatePrescription = async (req, res) => {
  try {
    const { medication, quantity, status, date } = req.body;
    const prescription = await Prescription.findById(req.params.id);
    if (!prescription) return res.status(404).json({ message: 'Prescription not found' });
    if (medication) prescription.medication = medication;
    if (quantity) prescription.quantity = quantity;
    if (status) prescription.status = status;
    if (date) prescription.date = date;
    await prescription.save();
    res.json({ prescription });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Delete prescription (doctor, pharmacist)
exports.deletePrescription = async (req, res) => {
  try {
    const prescription = await Prescription.findById(req.params.id);
    if (!prescription) return res.status(404).json({ message: 'Prescription not found' });
    await prescription.deleteOne();
    res.json({ message: 'Prescription deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}; 