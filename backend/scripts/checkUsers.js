const mongoose = require('mongoose');
const User = require('../models/User');

async function checkUsers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/medsync');
    
    console.log('🔍 Checking User Accounts\n');
    
    // Check all users
    const allUsers = await User.find({}).select('name email role hospitalId');
    console.log(`Total users: ${allUsers.length}\n`);
    
    // Group by role
    const usersByRole = {};
    for (const user of allUsers) {
      if (!usersByRole[user.role]) {
        usersByRole[user.role] = [];
      }
      usersByRole[user.role].push(user);
    }
    
    for (const [role, users] of Object.entries(usersByRole)) {
      console.log(`📋 ${role.toUpperCase()} (${users.length}):`);
      users.slice(0, 5).forEach(user => {
        console.log(`   • ${user.name} - ${user.email}`);
      });
      if (users.length > 5) {
        console.log(`   ... and ${users.length - 5} more`);
      }
      console.log('');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

checkUsers();
