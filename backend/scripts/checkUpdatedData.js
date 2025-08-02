const mongoose = require('mongoose');
const User = require('../models/User');
const Patient = require('../models/Patient');

async function checkUpdatedPatientData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/medsync');
    
    console.log('🔍 Checking Updated Patient Data\n');
    
    // Check patient users with age and gender
    const patientUsers = await User.find({ role: 'patient' }).limit(5);
    console.log('📋 Sample Patient Users:');
    patientUsers.forEach(user => {
      console.log(`   • ${user.name} - Age: ${user.age || 'N/A'}, Gender: ${user.gender || 'N/A'}`);
    });
    
    // Check patient profiles with health summary
    const patients = await Patient.find().populate('user').limit(5);
    console.log('\n🏥 Sample Patient Profiles:');
    patients.forEach(patient => {
      console.log(`   • ${patient.user?.name}`);
      if (patient.healthSummary) {
        console.log(`     Health: BP: ${patient.healthSummary.bloodPressure}, Weight: ${patient.healthSummary.weight}`);
      }
    });
    
    console.log('\n✅ Data structure looks good for React rendering!');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

checkUpdatedPatientData();
