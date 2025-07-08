const User = require('../models/User');
const Doctor = require('../models/Doctor');

exports.createUser = async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Access denied' });
    const { name, email, password, role, contact, specialty, department } = req.body;
    let hospitalId = req.user.hospitalId;
    if (!name || !email || !password || !role) return res.status(400).json({ message: 'Missing required fields' });
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: 'User already exists' });
    user = new User({ name, email, password, role, contact, hospitalId });
    await user.save();
    let extra = {};
    if (role === 'doctor') {
      const doctor = new Doctor({ user: user._id, specialty, department });
      await doctor.save();
      extra.doctor = doctor;
    }
    res.status(201).json({ user, ...extra });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { userId } = req.params;
    const { password } = req.body;
    if (!password || password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters.' });
    }
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.password = password;
    user.mustChangePassword = false;
    await user.save();
    res.json({ message: 'Password changed successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}; 