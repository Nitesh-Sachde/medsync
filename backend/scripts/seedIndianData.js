const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Import models
const User = require('../models/User');
const Hospital = require('../models/Hospital');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const Appointment = require('../models/Appointment');
const Prescription = require('../models/Prescription');
const Activity = require('../models/Activity');

class IndianHealthcareSeeder {
  constructor() {
    this.createdData = {
      hospitals: [],
      users: [],
      doctors: [],
      patients: [],
      appointments: [],
      prescriptions: []
    };
  }

  async connect() {
    try {
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/medsync');
      console.log('📡 Connected to MongoDB');
    } catch (error) {
      console.error('❌ MongoDB connection failed:', error);
      throw error;
    }
  }

  async clearAllData() {
    console.log('🧹 Clearing all existing data...');
    
    try {
      await Activity.deleteMany({});
      await Prescription.deleteMany({});
      await Appointment.deleteMany({});
      await Doctor.deleteMany({});
      await Patient.deleteMany({});
      await User.deleteMany({ role: { $ne: 'super-admin' } }); // Keep only super admin
      await Hospital.deleteMany({});
      
      console.log('✅ All data cleared (except Super Admin)');
    } catch (error) {
      console.error('❌ Error clearing data:', error);
    }
  }

  async createIndianHospitals() {
    console.log('🏥 Creating realistic Indian hospitals...');
    
    const hospitals = [
      {
        name: "Apollo Hospital Chennai",
        address: "21, Greams Lane, Off Greams Road, Chennai, Tamil Nadu 600006",
        contact: "+91-44-2829-3333",
        email: "info@apollohospital.com",
        departments: ["Cardiology", "Neurology", "Orthopedics", "Oncology", "Pediatrics", "Gastroenterology"]
      },
      {
        name: "Fortis Hospital Mumbai",
        address: "Mulund Goregaon Link Road, Mulund West, Mumbai, Maharashtra 400078",
        contact: "+91-22-6754-4444",
        email: "info@fortishealthcare.com",
        departments: ["Cardiology", "Nephrology", "Pulmonology", "Emergency Medicine", "Dermatology", "ENT"]
      },
      {
        name: "AIIMS New Delhi",
        address: "Sri Aurobindo Marg, Ansari Nagar, New Delhi 110029",
        contact: "+91-11-2658-8500",
        email: "info@aiims.edu",
        departments: ["Cardiothoracic Surgery", "Neurosurgery", "Trauma Surgery", "Internal Medicine", "Pediatrics", "Psychiatry"]
      },
      {
        name: "Manipal Hospital Bangalore",
        address: "98, Hal Airport Road, Old Airport Road, Bangalore, Karnataka 560017",
        contact: "+91-80-2502-4444",
        email: "info@manipalhospitals.com",
        departments: ["Oncology", "Cardiology", "Nephrology", "Orthopedics", "Neurology", "Gastroenterology"]
      },
      {
        name: "Max Super Speciality Hospital Saket",
        address: "1, 2, Press Enclave Road, Saket, New Delhi 110017",
        contact: "+91-11-2651-5050",
        email: "info@maxhealthcare.com",
        departments: ["Cardiac Surgery", "Neurology", "Orthopedics", "Oncology", "Emergency", "Radiology"]
      },
      {
        name: "Kokilaben Dhirubhai Ambani Hospital",
        address: "Rao Saheb Achutrao Patwardhan Marg, Four Bunglows, Andheri West, Mumbai 400053",
        contact: "+91-22-4269-6969",
        email: "info@kokilabenhospital.com",
        departments: ["Robotic Surgery", "Transplant", "Cancer Care", "Heart Institute", "Neurosciences", "Pediatrics"]
      },
      {
        name: "Christian Medical College Vellore",
        address: "Ida Scudder Road, Vellore, Tamil Nadu 632004",
        contact: "+91-416-228-1000",
        email: "info@cmcvellore.ac.in",
        departments: ["Internal Medicine", "Surgery", "Pediatrics", "Obstetrics", "Psychiatry", "Community Health"]
      },
      {
        name: "Medanta The Medicity Gurgaon",
        address: "Sector 38, Gurgaon, Haryana 122001",
        contact: "+91-124-4141-414",
        email: "info@medanta.org",
        departments: ["Heart Institute", "Neurosciences", "Cancer Institute", "Kidney Institute", "Bone & Joint", "Digestive"]
      },
      {
        name: "Narayana Health Bangalore",
        address: "258/A, Bommasandra Industrial Area, Bangalore, Karnataka 560099",
        contact: "+91-80-7122-2200",
        email: "info@narayanahealth.org",
        departments: ["Cardiac Sciences", "Neurosciences", "Oncology", "Orthopedics", "Nephrology", "Gastroenterology"]
      },
      {
        name: "Ruby Hall Clinic Pune",
        address: "40, Sassoon Road, Pune, Maharashtra 411001",
        contact: "+91-20-2611-2211",
        email: "info@rubyhall.com",
        departments: ["Cardiology", "Neurology", "Oncology", "Orthopedics", "Emergency", "Pediatrics"]
      },
      {
        name: "Sankara Nethralaya Chennai",
        address: "18, College Road, Chennai, Tamil Nadu 600006",
        contact: "+91-44-2827-1616",
        email: "info@sankara-nethralaya.org",
        departments: ["Ophthalmology", "Retina", "Cornea", "Glaucoma", "Pediatric Ophthalmology", "Oculoplasty"]
      },
      {
        name: "Breach Candy Hospital Mumbai",
        address: "60A, Bhulabhai Desai Road, Breach Candy, Mumbai, Maharashtra 400026",
        contact: "+91-22-2367-7888",
        email: "info@breachcandyhospital.org",
        departments: ["Cardiology", "Neurology", "Orthopedics", "General Surgery", "Internal Medicine", "Pediatrics"]
      }
    ];

    for (const hospitalData of hospitals) {
      const hospital = new Hospital(hospitalData);
      await hospital.save();
      this.createdData.hospitals.push(hospital);
    }

    console.log(`✅ Created ${this.createdData.hospitals.length} Indian hospitals`);
  }

  async createIndianDoctors() {
    console.log('👨‍⚕️ Creating realistic Indian doctors...');
    
    const indianDoctorNames = [
      { first: "Dr. Rajesh", last: "Kumar", specialty: "Cardiology", qualification: "MD, DM Cardiology", experience: 15 },
      { first: "Dr. Priya", last: "Sharma", specialty: "Pediatrics", qualification: "MD Pediatrics", experience: 12 },
      { first: "Dr. Arun", last: "Patel", specialty: "Neurology", qualification: "MD, DM Neurology", experience: 18 },
      { first: "Dr. Sunita", last: "Singh", specialty: "Gynecology", qualification: "MD Gynecology", experience: 14 },
      { first: "Dr. Vikram", last: "Gupta", specialty: "Orthopedics", qualification: "MS Orthopedics", experience: 16 },
      { first: "Dr. Kavita", last: "Reddy", specialty: "Dermatology", qualification: "MD Dermatology", experience: 10 },
      { first: "Dr. Suresh", last: "Nair", specialty: "Gastroenterology", qualification: "MD, DM Gastroenterology", experience: 20 },
      { first: "Dr. Meera", last: "Joshi", specialty: "Psychiatry", qualification: "MD Psychiatry", experience: 13 },
      { first: "Dr. Ravi", last: "Chandra", specialty: "Pulmonology", qualification: "MD, DM Pulmonology", experience: 17 },
      { first: "Dr. Anjali", last: "Verma", specialty: "Ophthalmology", qualification: "MS Ophthalmology", experience: 11 }
    ];

    const specialties = ["Cardiology", "Neurology", "Orthopedics", "Pediatrics", "Oncology", "Gastroenterology", "Nephrology", "Pulmonology", "Dermatology", "ENT"];

    for (let hospitalIndex = 0; hospitalIndex < this.createdData.hospitals.length; hospitalIndex++) {
      const hospital = this.createdData.hospitals[hospitalIndex];
      
      for (let i = 0; i < 10; i++) {
        const doctorTemplate = indianDoctorNames[i % indianDoctorNames.length];
        const specialty = specialties[i % specialties.length];
        
        // Create user account for doctor
        const email = `${doctorTemplate.first.toLowerCase().replace('dr. ', '')}${doctorTemplate.last.toLowerCase()}${hospitalIndex + 1}@medsync.in`;
        const hashedPassword = await bcrypt.hash('doctor123', 10);
        
        const doctorUser = new User({
          name: `${doctorTemplate.first} ${doctorTemplate.last}`,
          email: email,
          password: hashedPassword,
          role: 'doctor',
          contact: `+91-${Math.floor(Math.random() * 9000000000) + 1000000000}`,
          hospitalId: hospital._id,
          isVerified: true,
          mustChangePassword: false
        });
        
        await doctorUser.save();
        this.createdData.users.push(doctorUser);

        // Create doctor profile
        const doctor = new Doctor({
          user: doctorUser._id,
          specialty: specialty,
          department: hospital.departments[Math.floor(Math.random() * hospital.departments.length)]
        });
        
        await doctor.save();
        this.createdData.doctors.push(doctor);
      }
    }

    console.log(`✅ Created ${this.createdData.doctors.length} Indian doctors`);
  }

  async createIndianPatients() {
    console.log('👥 Creating realistic Indian patients...');
    
    const indianNames = [
      { first: "Ramesh", last: "Kumar", gender: "male", age: 45 },
      { first: "Sunita", last: "Devi", gender: "female", age: 38 },
      { first: "Amit", last: "Sharma", gender: "male", age: 32 },
      { first: "Priya", last: "Singh", gender: "female", age: 29 },
      { first: "Vijay", last: "Patel", gender: "male", age: 52 },
      { first: "Rekha", last: "Gupta", gender: "female", age: 41 },
      { first: "Suresh", last: "Reddy", gender: "male", age: 48 },
      { first: "Kavita", last: "Joshi", gender: "female", age: 35 },
      { first: "Ravi", last: "Nair", gender: "male", age: 39 },
      { first: "Meera", last: "Verma", gender: "female", age: 33 },
      { first: "Ajay", last: "Agarwal", gender: "male", age: 44 },
      { first: "Pooja", last: "Malhotra", gender: "female", age: 31 },
      { first: "Deepak", last: "Yadav", gender: "male", age: 50 },
      { first: "Sushma", last: "Tiwari", gender: "female", age: 42 },
      { first: "Manoj", last: "Chopra", gender: "male", age: 36 }
    ];

    const indianCities = ["Mumbai", "Delhi", "Bangalore", "Chennai", "Hyderabad", "Pune", "Kolkata", "Ahmedabad"];
    const bloodTypes = ["A+", "B+", "O+", "AB+", "A-", "B-", "O-", "AB-"];
    const commonAllergies = ["Penicillin", "Sulfa drugs", "Dust", "Pollen", "Seafood", "None"];
    const chronicConditions = ["Diabetes", "Hypertension", "Asthma", "Arthritis", "None", "Thyroid"];

    for (let i = 0; i < 80; i++) { // Create 80 patients
      const nameTemplate = indianNames[i % indianNames.length];
      const city = indianCities[i % indianCities.length];
      
      // Create user account for patient
      const email = `${nameTemplate.first.toLowerCase()}${nameTemplate.last.toLowerCase()}${i + 1}@gmail.com`;
      const hashedPassword = await bcrypt.hash('patient123', 10);
      
      const patientUser = new User({
        name: `${nameTemplate.first} ${nameTemplate.last}`,
        email: email,
        password: hashedPassword,
        role: 'patient',
        contact: `+91-${Math.floor(Math.random() * 9000000000) + 1000000000}`,
        isVerified: true,
        mustChangePassword: false
      });
      
      await patientUser.save();
      this.createdData.users.push(patientUser);

      // Create patient profile
      const patient = new Patient({
        user: patientUser._id,
        healthSummary: {
          bloodPressure: `${Math.floor(Math.random() * 40) + 110}/${Math.floor(Math.random() * 20) + 70}`,
          weight: `${Math.floor(Math.random() * 30) + 50}kg`,
          glucose: `${Math.floor(Math.random() * 50) + 80}mg/dL`,
          heartRate: `${Math.floor(Math.random() * 20) + 70}bpm`
        }
      });
      
      await patient.save();
      this.createdData.patients.push(patient);
    }

    console.log(`✅ Created ${this.createdData.patients.length} Indian patients`);
  }

  async createIndianAppointments() {
    console.log('📅 Creating realistic Indian appointments...');
    
    const appointmentTypes = ['Consultation', 'Follow-up', 'Check-up', 'Emergency', 'Procedure'];
    const reasons = [
      'Chest pain and breathing difficulty',
      'Regular health checkup',
      'Diabetes management',
      'Blood pressure monitoring',
      'Back pain and joint stiffness',
      'Skin rash and allergic reaction',
      'Persistent headache',
      'Stomach pain and acidity',
      'Eye irritation and vision problems',
      'Fever and body ache',
      'Heart palpitations',
      'Sleep disorders',
      'Weight management consultation',
      'Vaccination',
      'Post-surgery follow-up'
    ];

    const diagnoses = [
      'Upper Respiratory Tract Infection',
      'Type 2 Diabetes Mellitus',
      'Essential Hypertension',
      'Gastroesophageal Reflux Disease',
      'Osteoarthritis',
      'Allergic Rhinitis',
      'Tension Headache',
      'Acute Gastritis',
      'Conjunctivitis',
      'Viral Fever',
      'Coronary Artery Disease',
      'Hypothyroidism',
      'Bronchial Asthma',
      'Urinary Tract Infection',
      'Migraine'
    ];

    // Create appointments for the next 30 days
    for (let i = 0; i < 150; i++) { // 150 appointments
      const patient = this.createdData.patients[Math.floor(Math.random() * this.createdData.patients.length)];
      const doctor = this.createdData.doctors[Math.floor(Math.random() * this.createdData.doctors.length)];
      
      const appointmentDate = new Date();
      appointmentDate.setDate(appointmentDate.getDate() + Math.floor(Math.random() * 30) - 10); // -10 to +20 days
      
      const timeSlots = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'];
      const status = ['scheduled', 'completed', 'cancelled'][Math.floor(Math.random() * 3)];
      
      const appointment = new Appointment({
        patient: patient._id,
        doctor: doctor._id,
        hospitalId: this.createdData.hospitals[Math.floor(Math.random() * this.createdData.hospitals.length)]._id,
        date: appointmentDate.toISOString().split('T')[0], // YYYY-MM-DD format
        time: timeSlots[Math.floor(Math.random() * timeSlots.length)],
        type: appointmentTypes[Math.floor(Math.random() * appointmentTypes.length)],
        status: status,
        notes: status === 'completed' ? 'Patient examined and advised treatment' : '',
        patientNotes: reasons[Math.floor(Math.random() * reasons.length)],
        diagnosis: status === 'completed' ? diagnoses[Math.floor(Math.random() * diagnoses.length)] : ''
      });
      
      await appointment.save();
      this.createdData.appointments.push(appointment);
    }

    console.log(`✅ Created ${this.createdData.appointments.length} appointments`);
  }

  async createIndianPrescriptions() {
    console.log('💊 Creating realistic Indian prescriptions...');
    
    const indianMedicines = [
      { name: 'Paracetamol', dosage: '650mg', frequency: ['Morning', 'Evening'], duration: '5 days', instructions: 'Take after meals' },
      { name: 'Amoxicillin', dosage: '500mg', frequency: ['Morning', 'Afternoon', 'Night'], duration: '7 days', instructions: 'Complete the course' },
      { name: 'Metformin', dosage: '500mg', frequency: ['Morning', 'Evening'], duration: '30 days', instructions: 'Take with meals' },
      { name: 'Amlodipine', dosage: '5mg', frequency: ['Morning'], duration: '30 days', instructions: 'Take on empty stomach' },
      { name: 'Omeprazole', dosage: '20mg', frequency: ['Morning'], duration: '14 days', instructions: 'Take before breakfast' },
      { name: 'Azithromycin', dosage: '250mg', frequency: ['Morning'], duration: '3 days', instructions: 'Take with water' },
      { name: 'Ibuprofen', dosage: '400mg', frequency: ['Morning', 'Evening'], duration: '7 days', instructions: 'Take after meals' },
      { name: 'Atorvastatin', dosage: '10mg', frequency: ['Night'], duration: '30 days', instructions: 'Take at bedtime' },
      { name: 'Losartan', dosage: '50mg', frequency: ['Morning'], duration: '30 days', instructions: 'Monitor blood pressure' },
      { name: 'Levothyroxine', dosage: '100mcg', frequency: ['Morning'], duration: '30 days', instructions: 'Take on empty stomach' }
    ];

    const diagnoses = [
      'Upper Respiratory Tract Infection',
      'Type 2 Diabetes Mellitus',
      'Essential Hypertension',
      'Gastroesophageal Reflux Disease',
      'Osteoarthritis',
      'Allergic Rhinitis',
      'Tension Headache',
      'Acute Gastritis',
      'Conjunctivitis',
      'Viral Fever',
      'Coronary Artery Disease',
      'Hypothyroidism',
      'Bronchial Asthma',
      'Urinary Tract Infection',
      'Migraine'
    ];

    // Create prescriptions for completed appointments
    const completedAppointments = this.createdData.appointments.filter(app => app.status === 'completed');
    
    for (let i = 0; i < Math.min(completedAppointments.length, 80); i++) {
      const appointment = completedAppointments[i];
      const doctor = this.createdData.doctors.find(d => d._id.equals(appointment.doctor));
      const patient = this.createdData.patients.find(p => p._id.equals(appointment.patient));
      
      if (!doctor || !patient) continue;

      // Select 2-4 medicines per prescription
      const numMedicines = Math.floor(Math.random() * 3) + 2;
      const selectedMedicines = [];
      
      for (let j = 0; j < numMedicines; j++) {
        const medicine = indianMedicines[Math.floor(Math.random() * indianMedicines.length)];
        selectedMedicines.push({
          name: medicine.name,
          quantity: Math.floor(Math.random() * 20) + 10,
          dosage: medicine.dosage,
          frequency: medicine.frequency.join(', '),
          timing: medicine.frequency,
          duration: medicine.duration,
          food: Math.random() > 0.5 ? 'After meals' : 'Before meals',
          instructions: medicine.instructions
        });
      }

      const prescription = new Prescription({
        patient: patient._id,
        doctor: doctor._id,
        hospitalId: this.createdData.hospitals[Math.floor(Math.random() * this.createdData.hospitals.length)]._id,
        date: appointment.date,
        medications: selectedMedicines,
        status: 'active'
      });
      
      await prescription.save();
      this.createdData.prescriptions.push(prescription);
    }

    console.log(`✅ Created ${this.createdData.prescriptions.length} prescriptions`);
  }

  async createActivityLogs() {
    console.log('📝 Creating activity logs...');
    
    const activities = [
      'appointment_created',
      'prescription_issued',
      'patient_registered',
      'medical_record_updated',
      'lab_test_ordered',
      'medicine_prescribed'
    ];

    // Create 200 activity logs
    for (let i = 0; i < 200; i++) {
      const user = this.createdData.users[Math.floor(Math.random() * this.createdData.users.length)];
      const action = activities[Math.floor(Math.random() * activities.length)];
      
      const activity = new Activity({
        user: user._id,
        action: action,
        details: `${action.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} performed`,
        timestamp: new Date(Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000)) // Last 30 days
      });
      
      await activity.save();
    }

    console.log('✅ Created 200 activity logs');
  }

  async disconnect() {
    await mongoose.disconnect();
    console.log('📡 Disconnected from MongoDB');
  }

  async seedAllIndianData() {
    console.log('🇮🇳 MedSync Indian Healthcare Data Seeder');
    console.log('==========================================\n');

    try {
      await this.connect();
      await this.clearAllData();
      await this.createIndianHospitals();
      await this.createIndianDoctors();
      await this.createIndianPatients();
      await this.createIndianAppointments();
      await this.createIndianPrescriptions();
      await this.createActivityLogs();

      console.log('\n🎉 Indian healthcare data seeding completed successfully!');
      console.log('📊 Summary:');
      console.log(`   🏥 Hospitals: ${this.createdData.hospitals.length}`);
      console.log(`   👨‍⚕️ Doctors: ${this.createdData.doctors.length}`);
      console.log(`   👥 Patients: ${this.createdData.patients.length}`);
      console.log(`   📅 Appointments: ${this.createdData.appointments.length}`);
      console.log(`   💊 Prescriptions: ${this.createdData.prescriptions.length}`);
      console.log(`   👤 Total Users: ${this.createdData.users.length + 1} (including Super Admin)`);
      
      console.log('\n🔑 Login Credentials:');
      console.log('   🚀 Super Admin: superadmin@test.com / password123');
      console.log('   👨‍⚕️ Any Doctor: [doctorname][hospitalnum]@medsync.in / doctor123');
      console.log('   👥 Any Patient: [firstname][lastname][num]@gmail.com / patient123');
      console.log('\n🌟 Ready for screenshots and demonstration!');

    } catch (error) {
      console.error('❌ Error seeding Indian healthcare data:', error);
    } finally {
      await this.disconnect();
    }
  }
}

// Run the seeder
if (require.main === module) {
  const seeder = new IndianHealthcareSeeder();
  seeder.seedAllIndianData().catch(console.error);
}

module.exports = IndianHealthcareSeeder;
