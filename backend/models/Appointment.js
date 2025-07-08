const mongoose = require('mongoose');

const AppointmentSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  status: { type: String, enum: ['confirmed', 'pending', 'checked-in', 'waiting', 'scheduled', 'urgent', 'completed'], default: 'pending' },
  type: { type: String },
  hospitalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital', required: true }
}, { timestamps: true });

module.exports = mongoose.model('Appointment', AppointmentSchema); 