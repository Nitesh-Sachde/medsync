const mongoose = require('mongoose');
const Patient = require('../models/Patient');

async function checkPatientData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/medsync');
    
    const patient = await Patient.findOne().populate('user');
    console.log('Sample Patient Data:');
    console.log(JSON.stringify(patient, null, 2));
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

checkPatientData();
