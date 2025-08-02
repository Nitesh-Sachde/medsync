const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

async function testLogin(email, password) {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/medsync');
    
    console.log(`🔐 Testing login for: ${email}`);
    
    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      console.log('❌ User not found');
      return false;
    }
    
    console.log(`✅ User found: ${user.name} (${user.role})`);
    
    // Test password
    const isValid = await bcrypt.compare(password, user.password);
    if (isValid) {
      console.log('✅ Password is correct');
      console.log(`🏥 Hospital ID: ${user.hospitalId || 'Not assigned'}`);
      return true;
    } else {
      console.log('❌ Password is incorrect');
      return false;
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
    return false;
  } finally {
    await mongoose.disconnect();
  }
}

// Test the doctor credentials
console.log('🧪 Testing Login Credentials\n');
testLogin('rajeshkumar1@medsync.in', 'doctor123')
  .then(() => console.log('\n🔍 Login test completed'));
