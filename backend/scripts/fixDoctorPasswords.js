const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

async function fixDoctorPasswords() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/medsync');
    
    console.log('🔧 Fixing doctor passwords...\n');
    
    // Get all doctors
    const doctors = await User.find({ role: 'doctor' });
    console.log(`Found ${doctors.length} doctors`);
    
    // Update all doctor passwords to 'doctor123'
    const hashedPassword = await bcrypt.hash('doctor123', 10);
    
    const result = await User.updateMany(
      { role: 'doctor' },
      { password: hashedPassword }
    );
    
    console.log(`✅ Updated ${result.modifiedCount} doctor passwords`);
    
    // Test the first doctor login
    const testUser = await User.findOne({ email: 'rajeshkumar1@medsync.in' });
    if (testUser) {
      const isValid = await bcrypt.compare('doctor123', testUser.password);
      console.log(`🧪 Test login for ${testUser.email}: ${isValid ? '✅ SUCCESS' : '❌ FAILED'}`);
    }
    
    console.log('\n🎉 All doctor passwords fixed!');
    console.log('🔑 Doctor login: rajeshkumar1@medsync.in / doctor123');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

fixDoctorPasswords();
