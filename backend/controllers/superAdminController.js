const Hospital = require('../models/Hospital');
const User = require('../models/User');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

function generatePassword(length = 12) {
  return crypto.randomBytes(length).toString('base64').slice(0, length);
}

exports.createHospitalAndAdmin = async (req, res) => {
  try {
    if (req.user.role !== 'super-admin') return res.status(403).json({ message: 'Access denied' });
    const { hospitalName, hospitalAddress, hospitalContact, adminName, adminEmail, adminContact } = req.body;
    if (!hospitalName || !adminName || !adminEmail) return res.status(400).json({ message: 'Missing required fields' });
    const hospital = new Hospital({ name: hospitalName, address: hospitalAddress, contact: hospitalContact });
    await hospital.save();
    let user = await User.findOne({ email: adminEmail });
    if (user) return res.status(400).json({ message: 'Admin user already exists' });
    const adminPassword = generatePassword();
    user = new User({ name: adminName, email: adminEmail, password: adminPassword, role: 'admin', contact: adminContact, hospitalId: hospital._id, mustChangePassword: true });
    await user.save();
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
      to: adminEmail,
      subject: 'Your MedSync Admin Account',
      text: `Hello ${adminName},\n\nYour admin account has been created for hospital: ${hospitalName}.\n\nLogin Email: ${adminEmail}\nPassword: ${adminPassword}\n\nPlease log in and change your password immediately.\n\nMedSync Team`,
    });
    res.status(201).json({ hospital, admin: user });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getAllHospitals = async (req, res) => {
  try {
    if (req.user.role !== 'super-admin') return res.status(403).json({ message: 'Access denied' });
    // Populate admins for each hospital
    const hospitals = await require('../models/Hospital').find().lean();
    // For each hospital, find admins
    const User = require('../models/User');
    for (const hospital of hospitals) {
      hospital.admins = await User.find({ hospitalId: hospital._id, role: 'admin' }).select('-password');
    }
    res.json({ hospitals });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.updateHospital = async (req, res) => {
  try {
    if (req.user.role !== 'super-admin') return res.status(403).json({ message: 'Access denied' });
    const { id } = req.params;
    const { name, address, contact } = req.body;
    const hospital = await require('../models/Hospital').findByIdAndUpdate(
      id,
      { name, address, contact },
      { new: true }
    );
    if (!hospital) return res.status(404).json({ message: 'Hospital not found' });
    res.json({ hospital });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.deleteHospital = async (req, res) => {
  try {
    if (req.user.role !== 'super-admin') return res.status(403).json({ message: 'Access denied' });
    const { id } = req.params;
    const hospital = await require('../models/Hospital').findByIdAndDelete(id);
    if (!hospital) return res.status(404).json({ message: 'Hospital not found' });
    // Delete all admins for this hospital
    await User.deleteMany({ hospitalId: id, role: 'admin' });
    res.json({ message: 'Hospital and its admins deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.createAdmin = async (req, res) => {
  try {
    if (req.user.role !== 'super-admin') return res.status(403).json({ message: 'Access denied' });
    const { name, email, hospitalId, contact } = req.body;

    if (!name || !email || !hospitalId) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Check if hospital exists
    const hospital = await Hospital.findById(hospitalId);
    if (!hospital) {
      return res.status(404).json({ message: 'Hospital not found' });
    }

    // Check if admin already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'Admin user already exists' });
    }

    // Auto-generate password
    const password = generatePassword();

    // Create new admin
    user = new User({
      name,
      email,
      password,
      role: 'admin',
      contact,
      hospitalId,
      mustChangePassword: true
    });
    await user.save();

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
      subject: 'Your MedSync Admin Account',
      text: `Hello ${name},\n\nYour admin account has been created.\n\nLogin Email: ${email}\nPassword: ${password}\n\nPlease log in and change your password immediately.\n\nMedSync Team`,
    });

    // Return admin without password
    const adminWithoutPassword = user.toObject();
    delete adminWithoutPassword.password;

    res.status(201).json({ admin: adminWithoutPassword });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.updateAdmin = async (req, res) => {
  try {
    if (req.user.role !== 'super-admin') return res.status(403).json({ message: 'Access denied' });
    const { id } = req.params;
    const { name, email, contact } = req.body;

    // Don't allow password updates through this endpoint
    const admin = await User.findOneAndUpdate(
      { _id: id, role: 'admin' },
      { name, email, contact },
      { new: true }
    ).select('-password');

    if (!admin) return res.status(404).json({ message: 'Admin not found' });
    res.json({ admin });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.deleteAdmin = async (req, res) => {
  try {
    if (req.user.role !== 'super-admin') return res.status(403).json({ message: 'Access denied' });
    const { id } = req.params;

    // Only delete if user is an admin
    const admin = await User.findOneAndDelete({ _id: id, role: 'admin' });
    if (!admin) return res.status(404).json({ message: 'Admin not found' });

    res.json({ message: 'Admin deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getAdminsByHospital = async (req, res) => {
  try {
    if (req.user.role !== 'super-admin') return res.status(403).json({ message: 'Access denied' });
    const { hospitalId } = req.params;

    const admins = await User.find({ hospitalId, role: 'admin' })
      .select('-password')
      .lean();

    res.json({ admins });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}; 