const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';

exports.register = async (req, res) => {
  try {
    const { name, email, password, role, contact } = req.body;
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: 'User already exists' });
    user = new User({ name, email, password, role, contact });
    await user.save();
    // If registering a doctor, also create a Doctor document
    if (role === 'doctor') {
      const Doctor = require('../models/Doctor');
      const specialty = req.body.specialty || '';
      const department = req.body.department || '';
      await new Doctor({ user: user._id, specialty, department }).save();
    }
    // If registering a patient, also create a Patient document
    if (role === 'patient') {
      const Patient = require('../models/Patient');
      await new Patient({ user: user._id, healthSummary: {} }).save();
    }
    // Add hospitalId to token if present
    const tokenPayload = { id: user._id, role: user.role, name: user.name, email: user.email };
    if (user.hospitalId) tokenPayload.hospitalId = user.hospitalId;
    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ 
      token, 
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email, 
        role: user.role,
        hospitalId: user.hospitalId 
      } 
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });
    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });
    // Add hospitalId to token if present
    const tokenPayload = { id: user._id, role: user.role, name: user.name, email: user.email };
    if (user.hospitalId) tokenPayload.hospitalId = user.hospitalId;
    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '7d' });
    res.json({ 
      token, 
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email, 
        role: user.role, 
        hospitalId: user.hospitalId,
        mustChangePassword: user.mustChangePassword 
      } 
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}; 