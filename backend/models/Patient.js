const mongoose = require('mongoose');

const PatientSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  healthSummary: {
    bloodPressure: String,
    weight: String,
    glucose: String,
    heartRate: String
  }
}, { timestamps: true });

module.exports = mongoose.model('Patient', PatientSchema); 