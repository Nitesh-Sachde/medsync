const User = require('../models/User');
const Doctor = require('../models/Doctor');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

function generatePassword(length = 12) {
  return crypto.randomBytes(length).toString('base64').slice(0, length);
}

exports.createUser = async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Access denied' });
    const { name, email, role, contact, specialty, department } = req.body;
    let hospitalId = req.user.hospitalId;
    if (!name || !email || !role) return res.status(400).json({ message: 'Missing required fields' });
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: 'User already exists' });
    const password = generatePassword();
    user = new User({ name, email, password, role, contact, hospitalId, mustChangePassword: true });
    await user.save();
    let extra = {};
    if (role === 'doctor') {
      const doctor = new Doctor({ user: user._id, specialty, department });
      await doctor.save();
      extra.doctor = doctor;
    }
    // Send email with credentials
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.ethereal.email',
      port: process.env.SMTP_PORT || 587,
      auth: {
        user: process.env.SMTP_USER || 'your_ethereal_user',
        pass: process.env.SMTP_PASS || 'your_ethereal_pass',
      },
    });
    await transporter.sendMail({
      from: 'no-reply@medsync.com',
      to: email,
      subject: 'Your MedSync Account',
      text: `Hello ${name},\n\nYour account has been created.\n\nLogin Email: ${email}\nPassword: ${password}\n\nPlease log in and change your password immediately.\n\nMedSync Team`,
    });
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

exports.updateUser = async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Access denied' });
    const { userId } = req.params;
    const { name, email, role, contact } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (name) user.name = name;
    if (email) user.email = email;
    if (role) user.role = role;
    if (contact) user.contact = contact;
    await user.save();
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getUsers = async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Access denied' });
    const users = await User.find({
      hospitalId: req.user.hospitalId,
      role: { $nin: ['super-admin', 'admin'] }
    }, '-password'); // Exclude password field
    res.json({ users });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Access denied' });
    const { userId } = req.params;
    const user = await User.findOne({ _id: userId, hospitalId: req.user.hospitalId, role: { $nin: ['super-admin', 'admin'] } });
    if (!user) return res.status(404).json({ message: 'User not found or cannot be deleted' });
    await user.deleteOne();
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.toggleUserActive = async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Access denied' });
    const { userId } = req.params;
    const user = await User.findOne({ _id: userId, hospitalId: req.user.hospitalId, role: { $nin: ['super-admin', 'admin'] } });
    if (!user) return res.status(404).json({ message: 'User not found or cannot be updated' });
    user.active = !user.active;
    await user.save();
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}; 