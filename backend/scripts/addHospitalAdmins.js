const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Hospital = require('../models/Hospital');

async function addHospitalAdmins() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/medsync');
    console.log('🏥 Adding Hospital Administrators\n');
    
    // Get all hospitals
    const hospitals = await Hospital.find();
    
    const adminNames = [
      'Dr. Ramesh Gupta', 'Dr. Sunita Mehta', 'Dr. Vikash Sharma', 'Dr. Priya Joshi',
      'Dr. Anil Kumar', 'Dr. Kavita Singh', 'Dr. Suresh Patel', 'Dr. Meera Reddy',
      'Dr. Rajesh Nair', 'Dr. Anjali Verma', 'Dr. Deepak Agarwal', 'Dr. Pooja Malhotra'
    ];
    
    for (let i = 0; i < hospitals.length; i++) {
      const hospital = hospitals[i];
      const adminName = adminNames[i];
      
      // Create hospital admin user
      const email = `admin${i + 1}@${hospital.name.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`;
      
      const adminUser = new User({
        name: adminName,
        email: email,
        password: await bcrypt.hash('admin123', 10),
        role: 'admin', // Hospital admin role
        contact: `+91-${Math.floor(Math.random() * 9000000000) + 1000000000}`,
        hospitalId: hospital._id,
        isVerified: true,
        mustChangePassword: false
      });
      
      await adminUser.save();
      console.log(`✅ Created admin for ${hospital.name}: ${email}`);
    }
    
    console.log('\n🎉 All hospital admins created successfully!');
    console.log('\n🔑 Sample Hospital Admin Credentials:');
    console.log('admin1@apollohospitalchennai.com / admin123');
    console.log('admin2@fortishospitalmumbai.com / admin123');
    console.log('admin3@aiimsnewdelhi.com / admin123');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

addHospitalAdmins();
