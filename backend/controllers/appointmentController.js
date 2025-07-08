const Appointment = require('../models/Appointment');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');

// Create appointment (admin, receptionist)
exports.createAppointment = async (req, res) => {
  try {
    let { patient, doctor, hospitalId, date, time, status, type } = req.body;
    // If patient is booking, use their own id
    if (req.user.role === 'patient') patient = req.user.id;
    // Validate doctor belongs to hospital
    const doctorDoc = await Doctor.findById(doctor).populate('user');
    if (!doctorDoc) return res.status(404).json({ message: 'Doctor not found' });
    if (!doctorDoc.user.hospitalId || doctorDoc.user.hospitalId.toString() !== hospitalId) {
      return res.status(400).json({ message: 'Doctor does not belong to selected hospital' });
    }
    const appointment = new Appointment({ patient, doctor, hospitalId, date, time, status, type });
    await appointment.save();
    res.status(201).json({ appointment });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get all appointments (admin, receptionist, doctor)
exports.getAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find().populate('patient').populate('doctor');
    res.json({ appointments });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get single appointment (self, admin, receptionist, doctor)
exports.getAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id).populate('patient').populate('doctor');
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });
    // If patient or doctor, only allow self
    if (req.user.role === 'patient' && appointment.patient.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }
    if (req.user.role === 'doctor' && appointment.doctor.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }
    res.json({ appointment });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Update appointment (admin, receptionist)
exports.updateAppointment = async (req, res) => {
  try {
    const { date, time, status, type } = req.body;
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });
    if (date) appointment.date = date;
    if (time) appointment.time = time;
    if (status) appointment.status = status;
    if (type) appointment.type = type;
    await appointment.save();
    res.json({ appointment });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Delete appointment (admin, receptionist)
exports.deleteAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });
    await appointment.deleteOne();
    res.json({ message: 'Appointment deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}; 