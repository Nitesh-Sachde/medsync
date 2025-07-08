const mongoose = require('mongoose');

const InventorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  currentStock: { type: Number, required: true },
  minStock: { type: Number, required: true },
  supplier: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Inventory', InventorySchema); 