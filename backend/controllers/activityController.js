const Activity = require('../models/Activity');

// Create activity (admin)
exports.createActivity = async (req, res) => {
  try {
    const { type, message, time, priority } = req.body;
    const activity = new Activity({ type, message, time, priority });
    await activity.save();
    res.status(201).json({ activity });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get all activities (admin, doctor, receptionist, pharmacist)
exports.getActivities = async (req, res) => {
  try {
    const activities = await Activity.find();
    res.json({ activities });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get single activity (admin, doctor, receptionist, pharmacist)
exports.getActivity = async (req, res) => {
  try {
    const activity = await Activity.findById(req.params.id);
    if (!activity) return res.status(404).json({ message: 'Activity not found' });
    res.json({ activity });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Update activity (admin)
exports.updateActivity = async (req, res) => {
  try {
    const { type, message, time, priority } = req.body;
    const activity = await Activity.findById(req.params.id);
    if (!activity) return res.status(404).json({ message: 'Activity not found' });
    if (type) activity.type = type;
    if (message) activity.message = message;
    if (time) activity.time = time;
    if (priority) activity.priority = priority;
    await activity.save();
    res.json({ activity });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Delete activity (admin)
exports.deleteActivity = async (req, res) => {
  try {
    const activity = await Activity.findById(req.params.id);
    if (!activity) return res.status(404).json({ message: 'Activity not found' });
    await activity.deleteOne();
    res.json({ message: 'Activity deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}; 