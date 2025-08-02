const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

async function debugLogin() {
  try {
    await mongoose.connect('mongodb://localhost:27017/medsync', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    // Test with known super-admin that works
    const superAdmin = await User.findOne({ email: 'superadmin@medsync.in' });
    if (superAdmin) {
      console.log('\n=== SUPER ADMIN DEBUG ===');
      console.log('Email:', superAdmin.email);
      console.log('Role:', superAdmin.role);
      console.log('Password hash length:', superAdmin.password.length);
      console.log('Password starts with $2a or $2b:', superAdmin.password.startsWith('$2a') || superAdmin.password.startsWith('$2b'));
      
      const testPassword = 'password123';
      const isMatch = await superAdmin.comparePassword(testPassword);
      console.log(`Password "${testPassword}" matches:`, isMatch);
      
      // Manual bcrypt compare
      const manualMatch = await bcrypt.compare(testPassword, superAdmin.password);
      console.log('Manual bcrypt compare:', manualMatch);
    }

    // Test with a doctor that fails
    const doctor = await User.findOne({ email: 'priyasharma1@medsync.in' });
    if (doctor) {
      console.log('\n=== DOCTOR DEBUG ===');
      console.log('Email:', doctor.email);
      console.log('Role:', doctor.role);
      console.log('Password hash length:', doctor.password.length);
      console.log('Password starts with $2a or $2b:', doctor.password.startsWith('$2a') || doctor.password.startsWith('$2b'));
      
      const testPassword = 'doctor123';
      const isMatch = await doctor.comparePassword(testPassword);
      console.log(`Password "${testPassword}" matches:`, isMatch);
      
      // Manual bcrypt compare
      const manualMatch = await bcrypt.compare(testPassword, doctor.password);
      console.log('Manual bcrypt compare:', manualMatch);
    }

    // Test creating a new password hash directly
    console.log('\n=== DIRECT HASH TEST ===');
    const directHash = await bcrypt.hash('doctor123', 10);
    console.log('Direct hash of "doctor123":', directHash);
    const directMatch = await bcrypt.compare('doctor123', directHash);
    console.log('Direct comparison result:', directMatch);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

debugLogin();
