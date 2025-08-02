const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

async function fixAllPasswords() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/medsync');
    
    console.log('🔧 Fixing All User Passwords\n');
    
    // Fix doctors
    console.log('👨‍⚕️ Fixing doctor passwords...');
    const doctors = await User.find({ role: 'doctor' });
    for (const doctor of doctors) {
      doctor.password = 'doctor123'; // This will trigger the pre-save hook
      await doctor.save();
    }
    console.log(`✅ Fixed ${doctors.length} doctor passwords\n`);
    
    // Fix patients
    console.log('👥 Fixing patient passwords...');
    const patients = await User.find({ role: 'patient' });
    for (const patient of patients) {
      patient.password = 'patient123';
      await patient.save();
    }
    console.log(`✅ Fixed ${patients.length} patient passwords\n`);
    
    // Fix hospital admins
    console.log('🏥 Fixing admin passwords...');
    const admins = await User.find({ role: 'admin' });
    for (const admin of admins) {
      admin.password = 'admin123';
      await admin.save();
    }
    console.log(`✅ Fixed ${admins.length} admin passwords\n`);
    
    // Test the fixes
    console.log('🧪 Testing fixed passwords...\n');
    
    const testCases = [
      { email: 'rajeshkumar1@medsync.in', password: 'doctor123', role: 'doctor' },
      { email: 'priyasharma1@medsync.in', password: 'doctor123', role: 'doctor' },
      { email: 'rameshkumar1@gmail.com', password: 'patient123', role: 'patient' },
      { email: 'superadmin@test.com', password: 'password123', role: 'super-admin' }
    ];
    
    for (const test of testCases) {
      const user = await User.findOne({ email: test.email });
      if (user) {
        const isValid = await bcrypt.compare(test.password, user.password);
        console.log(`${isValid ? '✅' : '❌'} ${test.email} - ${test.password} - ${isValid ? 'WORKING' : 'FAILED'}`);
      } else {
        console.log(`❌ ${test.email} - USER NOT FOUND`);
      }
    }
    
    console.log('\n🎉 All passwords have been fixed!');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

fixAllPasswords();
