const Inventory = require('../models/Inventory');

// Create inventory item (pharmacist, admin)
exports.createInventory = async (req, res) => {
  try {
    const { name, currentStock, minStock, supplier } = req.body;
    const inventory = new Inventory({ name, currentStock, minStock, supplier });
    await inventory.save();
    res.status(201).json({ inventory });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get all inventory items (pharmacist, admin, doctor)
exports.getInventories = async (req, res) => {
  try {
    const inventories = await Inventory.find();
    res.json({ inventories });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get single inventory item (pharmacist, admin, doctor)
exports.getInventory = async (req, res) => {
  try {
    const inventory = await Inventory.findById(req.params.id);
    if (!inventory) return res.status(404).json({ message: 'Inventory item not found' });
    res.json({ inventory });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Update inventory item (pharmacist, admin)
exports.updateInventory = async (req, res) => {
  try {
    const { name, currentStock, minStock, supplier } = req.body;
    const inventory = await Inventory.findById(req.params.id);
    if (!inventory) return res.status(404).json({ message: 'Inventory item not found' });
    if (name) inventory.name = name;
    if (currentStock !== undefined) inventory.currentStock = currentStock;
    if (minStock !== undefined) inventory.minStock = minStock;
    if (supplier) inventory.supplier = supplier;
    await inventory.save();
    res.json({ inventory });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Delete inventory item (pharmacist, admin)
exports.deleteInventory = async (req, res) => {
  try {
    const inventory = await Inventory.findById(req.params.id);
    if (!inventory) return res.status(404).json({ message: 'Inventory item not found' });
    await inventory.deleteOne();
    res.json({ message: 'Inventory item deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}; 