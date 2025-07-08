const mongoose = require('mongoose');

const WalkInSchema = new mongoose.Schema({
  name: { type: String, required: true },
  arrivalTime: { type: String, required: true },
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'low' },
  reason: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('WalkIn', WalkInSchema); 