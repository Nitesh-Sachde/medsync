const mongoose = require('mongoose');
const User = require('../models/User');
const Hospital = require('../models/Hospital');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const Appointment = require('../models/Appointment');
const Prescription = require('../models/Prescription');

async function clearTestData() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/medsync');
    console.log('📡 Connected to MongoDB');
    
    // Clear test data
    console.log('🧹 Clearing test data...');
    
    // Delete test users
    await User.deleteMany({ email: { $regex: '@test.com$' } });
    console.log('👥 Deleted test users');
    
    // Delete test hospital
    await Hospital.deleteMany({ name: 'Test General Hospital' });
    console.log('🏥 Deleted test hospital');
    
    // Clear related data
    await Doctor.deleteMany({});
    await Patient.deleteMany({});
    await Appointment.deleteMany({});
    await Prescription.deleteMany({});
    console.log('🗃️ Cleared related test data');
    
    console.log("✅ Test data cleared successfully!");
    
    await mongoose.disconnect();
    console.log('📡 Disconnected from MongoDB');
    process.exit(0);
    
  } catch (error) {
    console.error("❌ Error clearing data:", error);
    process.exit(1);
  }
}

// Check if script is run directly
if (require.main === module) {
  clearTestData();
}

module.exports = clearTestData;
