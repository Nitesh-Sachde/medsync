const mongoose = require('mongoose');

const LabReportSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  test: { type: String, required: true },
  date: { type: String, required: true },
  status: { type: String, enum: ['ready', 'pending'], default: 'pending' },
  result: { type: String },
  hospitalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital', required: true }
}, { timestamps: true });

module.exports = mongoose.model('LabReport', LabReportSchema); 