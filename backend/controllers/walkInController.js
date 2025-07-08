const WalkIn = require('../models/WalkIn');

// Create walk-in (receptionist, admin)
exports.createWalkIn = async (req, res) => {
  try {
    const { name, arrivalTime, priority, reason } = req.body;
    const walkIn = new WalkIn({ name, arrivalTime, priority, reason });
    await walkIn.save();
    res.status(201).json({ walkIn });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get all walk-ins (receptionist, admin, doctor)
exports.getWalkIns = async (req, res) => {
  try {
    const walkIns = await WalkIn.find();
    res.json({ walkIns });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get single walk-in (receptionist, admin, doctor)
exports.getWalkIn = async (req, res) => {
  try {
    const walkIn = await WalkIn.findById(req.params.id);
    if (!walkIn) return res.status(404).json({ message: 'Walk-in not found' });
    res.json({ walkIn });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Update walk-in (receptionist, admin)
exports.updateWalkIn = async (req, res) => {
  try {
    const { name, arrivalTime, priority, reason } = req.body;
    const walkIn = await WalkIn.findById(req.params.id);
    if (!walkIn) return res.status(404).json({ message: 'Walk-in not found' });
    if (name) walkIn.name = name;
    if (arrivalTime) walkIn.arrivalTime = arrivalTime;
    if (priority) walkIn.priority = priority;
    if (reason) walkIn.reason = reason;
    await walkIn.save();
    res.json({ walkIn });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Delete walk-in (receptionist, admin)
exports.deleteWalkIn = async (req, res) => {
  try {
    const walkIn = await WalkIn.findById(req.params.id);
    if (!walkIn) return res.status(404).json({ message: 'Walk-in not found' });
    await walkIn.deleteOne();
    res.json({ message: 'Walk-in deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}; 