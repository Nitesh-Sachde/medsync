const mongoose = require('mongoose');

const ActivitySchema = new mongoose.Schema({
  type: { type: String, required: true },
  message: { type: String, required: true },
  time: { type: String, required: true },
  priority: { type: String, enum: ['low', 'normal', 'medium', 'high'], default: 'normal' }
}, { timestamps: true });

module.exports = mongoose.model('Activity', ActivitySchema); 