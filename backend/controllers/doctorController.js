const Doctor = require('../models/Doctor');
const User = require('../models/User');

// Create a new doctor (admin)
exports.createDoctor = async (req, res) => {
  try {
    const { name, email, password, contact, specialty, department } = req.body;
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: 'User already exists' });
    user = new User({ name, email, password, role: 'doctor', contact });
    await user.save();
    const doctor = new Doctor({ user: user._id, specialty, department });
    await doctor.save();
    res.status(201).json({ doctor });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get all doctors (admin, receptionist, doctor)
exports.getDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find().populate('user');
    res.json({ doctors });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get single doctor (self, admin, receptionist)
exports.getDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id).populate('user');
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });
    // If doctor, only allow self
    if (req.user.role === 'doctor' && doctor.user._id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }
    res.json({ doctor });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Update doctor (admin or self)
exports.updateDoctor = async (req, res) => {
  try {
    const { specialty, department, contact } = req.body;
    const doctor = await Doctor.findById(req.params.id).populate('user');
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });
    // Only admin or self
    if (req.user.role === 'doctor' && doctor.user._id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }
    if (specialty) doctor.specialty = specialty;
    if (department) doctor.department = department;
    if (contact) doctor.user.contact = contact;
    await doctor.user.save();
    await doctor.save();
    res.json({ doctor });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Delete doctor (admin)
exports.deleteDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });
    await User.findByIdAndDelete(doctor.user);
    await doctor.deleteOne();
    res.json({ message: 'Doctor deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getDoctorsByHospital = async (req, res) => {
  try {
    const { hospitalId } = req.query;
    if (!hospitalId) return res.status(400).json({ message: 'hospitalId is required' });
    const doctors = await Doctor.find({ department: { $exists: true }, user: { $exists: true } })
      .populate('user')
      .where('user.hospitalId').equals(hospitalId);
    res.json({ doctors });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get doctor by user ID (for login/dashboard)
exports.getDoctorByUser = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ user: req.params.userId }).populate('user');
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });
    res.json({ doctor });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}; 