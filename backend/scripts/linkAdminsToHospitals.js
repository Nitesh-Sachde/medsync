const mongoose = require('mongoose');
const User = require('../models/User');
const Hospital = require('../models/Hospital');

async function linkAdminsToHospitals() {
  try {
    await mongoose.connect('mongodb://localhost:27017/medsync', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('🔗 Linking admins to hospitals...\n');

    // Get all hospitals
    const hospitals = await Hospital.find().sort({ name: 1 });
    console.log(`Found ${hospitals.length} hospitals`);

    // Get all admin users (excluding super-admin)
    const adminUsers = await User.find({ role: 'admin' }).sort({ email: 1 });
    console.log(`Found ${adminUsers.length} admin users`);

    // Create hospital admins if they don't exist
    const hospitalAdminMap = [
      { hospitalName: 'Apollo Hospital Chennai', adminEmail: 'admin1@apollohospitalchennai.com', adminName: 'Apollo Admin' },
      { hospitalName: 'Fortis Hospital Mumbai', adminEmail: 'admin2@fortishospitalmumbai.com', adminName: 'Fortis Admin' },
      { hospitalName: 'AIIMS New Delhi', adminEmail: 'admin3@aiimsnewdelhi.com', adminName: 'AIIMS Admin' },
      { hospitalName: 'Manipal Hospital Bangalore', adminEmail: 'admin4@manipalhospitalbangalore.com', adminName: 'Manipal Admin' },
      { hospitalName: 'Max Super Specialty Hospital Delhi', adminEmail: 'admin5@maxhospitaldelhi.com', adminName: 'Max Admin' },
      { hospitalName: 'Kokilaben Dhirubhai Ambani Hospital Mumbai', adminEmail: 'admin6@kokilabenhospitalmumbai.com', adminName: 'Kokilaben Admin' },
      { hospitalName: 'Medanta - The Medicity Gurgaon', adminEmail: 'admin7@medantagurgaon.com', adminName: 'Medanta Admin' },
      { hospitalName: 'Christian Medical College Vellore', adminEmail: 'admin8@cmcvellore.com', adminName: 'CMC Admin' },
      { hospitalName: 'Tata Memorial Hospital Mumbai', adminEmail: 'admin9@tatamemorialmumbai.com', adminName: 'Tata Memorial Admin' },
      { hospitalName: 'Sankara Nethralaya Chennai', adminEmail: 'admin10@sankaranethralayachennai.com', adminName: 'Sankara Admin' },
      { hospitalName: 'Ruby Hall Clinic Pune', adminEmail: 'admin11@rubyhallpune.com', adminName: 'Ruby Hall Admin' },
      { hospitalName: 'Narayana Health Bangalore', adminEmail: 'admin12@narayanahealthbangalore.com', adminName: 'Narayana Admin' }
    ];

    for (let i = 0; i < hospitals.length && i < hospitalAdminMap.length; i++) {
      const hospital = hospitals[i];
      const adminInfo = hospitalAdminMap[i];
      
      console.log(`\n🏥 Processing ${hospital.name}...`);
      
      // Check if admin already exists
      let adminUser = await User.findOne({ email: adminInfo.adminEmail });
      
      if (!adminUser) {
        // Create new admin user
        adminUser = new User({
          name: adminInfo.adminName,
          email: adminInfo.adminEmail,
          password: 'admin123', // Will be hashed by pre-save hook
          role: 'admin',
          contact: `+91-${Math.floor(Math.random() * 9000000000) + 1000000000}`,
          hospitalId: hospital._id,
          active: true
        });
        await adminUser.save();
        console.log(`  ✅ Created admin: ${adminInfo.adminEmail}`);
      } else {
        // Update existing admin to link to hospital
        adminUser.hospitalId = hospital._id;
        await adminUser.save();
        console.log(`  ✅ Updated admin: ${adminInfo.adminEmail}`);
      }

      // Add admin to hospital's admins array
      if (!hospital.admins.includes(adminUser._id)) {
        hospital.admins.push(adminUser._id);
        await hospital.save();
        console.log(`  ✅ Linked admin to hospital`);
      } else {
        console.log(`  ℹ️  Admin already linked to hospital`);
      }
    }

    console.log('\n🎉 Successfully linked all admins to hospitals!');
    
    // Verify the linking
    console.log('\n📋 Verification:');
    const hospitalsWithAdmins = await Hospital.find().populate('admins', 'name email role');
    
    hospitalsWithAdmins.forEach(hospital => {
      console.log(`\n🏥 ${hospital.name}:`);
      if (hospital.admins && hospital.admins.length > 0) {
        hospital.admins.forEach(admin => {
          console.log(`  👤 ${admin.name} (${admin.email})`);
        });
      } else {
        console.log('  ❌ No admins linked');
      }
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

linkAdminsToHospitals();
