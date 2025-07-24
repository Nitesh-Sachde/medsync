const mongoose = require('mongoose');
const User = require('../models/User');
const Hospital = require('../models/Hospital');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');

async function seedTestData() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/medsync');
    console.log('📡 Connected to MongoDB');
    
    // Clear existing test data
    await User.deleteMany({ email: { $regex: '@test.com$' } });
    await Hospital.deleteMany({ name: 'Test General Hospital' });
    console.log('🧹 Cleared existing test data');
    
    // Create Super Admin
    console.log('👑 Creating Super Admin...');
    const superAdmin = new User({
      name: "Super Administrator",
      email: "superadmin@test.com",
      password: "password123",
      role: "super-admin",
      contact: "+1234567890",
      mustChangePassword: false
    });
    await superAdmin.save();
    
    // Create Test Hospital
    console.log('🏥 Creating Test Hospital...');
    const hospital = new Hospital({
      name: "Test General Hospital",
      address: "123 Medical Ave, Test City, TC 12345",
      contact: "+1987654321"
    });
    await hospital.save();
    
    // Create Hospital Admin
    console.log('👨‍💼 Creating Hospital Admin...');
    const admin = new User({
      name: "Hospital Administrator",
      email: "admin@test.com",
      password: "password123",
      role: "admin",
      contact: "+1111111111",
      hospitalId: hospital._id,
      mustChangePassword: false
    });
    await admin.save();
    
    // Create Doctor
    console.log('👨‍⚕️ Creating Doctor...');
    const doctor = new User({
      name: "Dr. John Smith",
      email: "doctor@test.com", 
      password: "password123",
      role: "doctor",
      contact: "+2222222222",
      hospitalId: hospital._id,
      mustChangePassword: false
    });
    await doctor.save();
    
    // Create Doctor profile
    const doctorProfile = new Doctor({
      user: doctor._id,
      specialty: "Cardiology",
      department: "Cardiology Department",
      qualifications: ["MBBS", "MD Cardiology"],
      experience: "10 years"
    });
    await doctorProfile.save();
    
    // Create Pharmacist
    console.log('💊 Creating Pharmacist...');
    const pharmacist = new User({
      name: "Sarah Pharmacy",
      email: "pharmacist@test.com",
      password: "password123", 
      role: "pharmacist",
      contact: "+3333333333",
      hospitalId: hospital._id,
      mustChangePassword: false
    });
    await pharmacist.save();
    
    // Create Receptionist
    console.log('📋 Creating Receptionist...');
    const receptionist = new User({
      name: "Mary Reception",
      email: "receptionist@test.com",
      password: "password123",
      role: "receptionist", 
      contact: "+4444444444",
      hospitalId: hospital._id,
      mustChangePassword: false
    });
    await receptionist.save();
    
    // Create Patient
    console.log('🧑‍🤝‍🧑 Creating Patient...');
    const patient = new User({
      name: "John Patient",
      email: "patient@test.com",
      password: "password123",
      role: "patient",
      contact: "+5555555555",
      mustChangePassword: false
    });
    await patient.save();
    
    // Create Patient profile
    const patientProfile = new Patient({
      user: patient._id,
      age: 35,
      gender: "Male",
      bloodGroup: "O+",
      address: "456 Patient St, Test City, TC 12345",
      emergencyContact: "+5555555556",
      healthSummary: {
        allergies: ["Penicillin"],
        chronicConditions: [],
        currentMedications: []
      }
    });
    await patientProfile.save();
    
    // Create Additional Test Users for Demo
    console.log('👥 Creating Additional Demo Users...');
    
    // Another Doctor
    const doctor2 = new User({
      name: "Dr. Emily Johnson",
      email: "doctor2@test.com",
      password: "password123",
      role: "doctor",
      contact: "+6666666666",
      hospitalId: hospital._id,
      mustChangePassword: false
    });
    await doctor2.save();
    
    const doctor2Profile = new Doctor({
      user: doctor2._id,
      specialty: "Pediatrics",
      department: "Pediatrics Department"
    });
    await doctor2Profile.save();
    
    // Another Patient
    const patient2 = new User({
      name: "Jane Doe",
      email: "patient2@test.com",
      password: "password123",
      role: "patient",
      contact: "+7777777777",
      mustChangePassword: false
    });
    await patient2.save();
    
    const patient2Profile = new Patient({
      user: patient2._id,
      age: 28,
      gender: "Female",
      bloodGroup: "A+",
      address: "789 Demo Ave, Test City, TC 12345",
      emergencyContact: "+7777777778",
      healthSummary: {
        allergies: [],
        chronicConditions: ["Diabetes Type 2"],
        currentMedications: ["Metformin"]
      }
    });
    await patient2Profile.save();
    
    console.log("✅ Test data seeded successfully!");
    console.log("🔑 Test Credentials:");
    console.log("=====================================");
    console.log("🚀 SUPER ADMIN:");
    console.log("   Email: superadmin@test.com");
    console.log("   Password: password123");
    console.log("   Access: Full system control");
    console.log("");
    console.log("🏥 HOSPITAL ADMIN:");
    console.log("   Email: admin@test.com");
    console.log("   Password: password123");
    console.log("   Access: Hospital management");
    console.log("");
    console.log("👨‍⚕️ DOCTOR:");
    console.log("   Email: doctor@test.com");
    console.log("   Password: password123");
    console.log("   Specialty: Cardiology");
    console.log("");
    console.log("👩‍⚕️ DOCTOR 2:");
    console.log("   Email: doctor2@test.com");
    console.log("   Password: password123");
    console.log("   Specialty: Pediatrics");
    console.log("");
    console.log("💊 PHARMACIST:");
    console.log("   Email: pharmacist@test.com");
    console.log("   Password: password123");
    console.log("   Access: Inventory & prescriptions");
    console.log("");
    console.log("📋 RECEPTIONIST:");
    console.log("   Email: receptionist@test.com");
    console.log("   Password: password123");
    console.log("   Access: Patient registration & appointments");
    console.log("");
    console.log("🧑‍🤝‍🧑 PATIENT:");
    console.log("   Email: patient@test.com");
    console.log("   Password: password123");
    console.log("   Profile: John Patient (35, Male, O+)");
    console.log("");
    console.log("👩‍🤝‍👩 PATIENT 2:");
    console.log("   Email: patient2@test.com");
    console.log("   Password: password123");
    console.log("   Profile: Jane Doe (28, Female, A+)");
    console.log("");
    console.log("🌐 LOGIN URL: http://localhost:5173/login");
    console.log("📱 All dashboards are mobile responsive!");
    console.log("🤖 AI Assistant available on all dashboards!");
    console.log("=====================================");
    
    await mongoose.disconnect();
    console.log('📡 Disconnected from MongoDB');
    process.exit(0);
    
  } catch (error) {
    console.error("❌ Error seeding data:", error);
    process.exit(1);
  }
}

// Check if script is run directly
if (require.main === module) {
  seedTestData();
}

module.exports = seedTestData;
