const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

async function testMultipleLogins() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/medsync');
    
    console.log('🔐 Testing Multiple Login Credentials\n');
    
    const testUsers = [
      'rajeshkumar1@medsync.in',
      'priyasharma1@medsync.in', 
      'arunpatel1@medsync.in',
      'superadmin@test.com',
      'admin1@apollohospitalchennai.com',
      'rameshkumar1@gmail.com'
    ];
    
    for (const email of testUsers) {
      console.log(`🔍 Testing: ${email}`);
      
      const user = await User.findOne({ email });
      if (!user) {
        console.log('   ❌ User not found\n');
        continue;
      }
      
      // Test different passwords
      const passwords = ['doctor123', 'patient123', 'admin123', 'password123'];
      let foundPassword = false;
      
      for (const pwd of passwords) {
        const isValid = await bcrypt.compare(pwd, user.password);
        if (isValid) {
          console.log(`   ✅ WORKING PASSWORD: ${pwd}`);
          console.log(`   👤 User: ${user.name} (${user.role})\n`);
          foundPassword = true;
          break;
        }
      }
      
      if (!foundPassword) {
        console.log('   ❌ None of the test passwords work');
        console.log(`   👤 User: ${user.name} (${user.role})`);
        console.log('   🔧 Will fix this password...\n');
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

testMultipleLogins();
