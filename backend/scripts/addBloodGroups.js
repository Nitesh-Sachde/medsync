const mongoose = require('mongoose');
const Patient = require('../models/Patient');
const User = require('../models/User');

async function addBloodGroupsToPatients() {
  try {
    await mongoose.connect('mongodb://localhost:27017/medsync', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('🩸 Adding blood groups to patients...\n');

    const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    
    const patients = await Patient.find().populate('user');
    console.log(`Found ${patients.length} patients`);

    for (let i = 0; i < patients.length; i++) {
      const patient = patients[i];
      
      // Assign a random blood group if not already set
      if (!patient.bloodGroup) {
        const randomBloodGroup = bloodGroups[Math.floor(Math.random() * bloodGroups.length)];
        patient.bloodGroup = randomBloodGroup;
        await patient.save();
        
        console.log(`✅ ${patient.user.name}: ${randomBloodGroup}`);
      } else {
        console.log(`ℹ️  ${patient.user.name}: Already has ${patient.bloodGroup}`);
      }
    }

    console.log('\n🎉 Successfully added blood groups to all patients!');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

addBloodGroupsToPatients();
