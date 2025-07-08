const mongoose = require('mongoose');

const ApprovalSchema = new mongoose.Schema({
  type: { type: String, required: true },
  name: { type: String, required: true },
  department: { type: String },
  date: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Approval', ApprovalSchema); 