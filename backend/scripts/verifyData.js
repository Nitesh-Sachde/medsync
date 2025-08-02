const mongoose = require('mongoose');
const User = require('../models/User');
const Hospital = require('../models/Hospital');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const Appointment = require('../models/Appointment');
const Prescription = require('../models/Prescription');

async function verifyIndianData() {
  try {
    console.log('🔍 Verifying Indian Healthcare Data\n');
    
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/medsync');
    
    // Count all data
    const hospitalCount = await Hospital.countDocuments();
    const doctorCount = await Doctor.countDocuments();
    const patientCount = await Patient.countDocuments();
    const appointmentCount = await Appointment.countDocuments();
    const prescriptionCount = await Prescription.countDocuments();
    const userCount = await User.countDocuments();
    
    console.log('📊 Data Summary:');
    console.log(`🏥 Hospitals: ${hospitalCount}`);
    console.log(`👨‍⚕️ Doctors: ${doctorCount}`);
    console.log(`👥 Patients: ${patientCount}`);
    console.log(`📅 Appointments: ${appointmentCount}`);
    console.log(`💊 Prescriptions: ${prescriptionCount}`);
    console.log(`👤 Total Users: ${userCount}`);
    
    // Sample hospital data
    console.log('\n🏥 Sample Hospitals:');
    const sampleHospitals = await Hospital.find().limit(3);
    sampleHospitals.forEach(hospital => {
      console.log(`   • ${hospital.name} - ${hospital.address.split(',')[0]}`);
    });
    
    // Sample doctor data
    console.log('\n👨‍⚕️ Sample Doctors:');
    const sampleDoctors = await Doctor.find().populate('user').limit(5);
    sampleDoctors.forEach(doctor => {
      console.log(`   • ${doctor.user.name} - ${doctor.specialty} (${doctor.experience} years exp)`);
    });
    
    // Sample patient data
    console.log('\n👥 Sample Patients:');
    const samplePatients = await Patient.find().populate('user').limit(5);
    samplePatients.forEach(patient => {
      console.log(`   • ${patient.user.name} - ${patient.age} years, ${patient.gender}, ${patient.bloodType}`);
    });
    
    // Recent appointments
    console.log('\n📅 Recent Appointments:');
    const recentAppointments = await Appointment.find()
      .populate('patient', 'user')
      .populate('doctor', 'user specialty')
      .populate({
        path: 'patient',
        populate: { path: 'user', select: 'name' }
      })
      .populate({
        path: 'doctor', 
        populate: { path: 'user', select: 'name' }
      })
      .sort({ date: -1 })
      .limit(3);
      
    recentAppointments.forEach(apt => {
      console.log(`   • ${apt.patient.user.name} → ${apt.doctor.user.name} (${apt.doctor.specialty}) - ${apt.date.toDateString()}`);
    });
    
    // Sample prescriptions
    console.log('\n💊 Sample Prescriptions:');
    const samplePrescriptions = await Prescription.find()
      .populate('patient', 'user')
      .populate('doctor', 'user')
      .populate({
        path: 'patient',
        populate: { path: 'user', select: 'name' }
      })
      .populate({
        path: 'doctor',
        populate: { path: 'user', select: 'name' }
      })
      .limit(3);
      
    samplePrescriptions.forEach(prescription => {
      console.log(`   • Patient: ${prescription.patient.user.name}`);
      console.log(`     Doctor: ${prescription.doctor.user.name}`);
      console.log(`     Diagnosis: ${prescription.diagnosis}`);
      console.log(`     Medicines: ${prescription.medications.length} items`);
      console.log('');
    });
    
    console.log('✅ Data verification complete! Your system is ready for screenshots.');
    
  } catch (error) {
    console.error('❌ Error verifying data:', error);
  } finally {
    await mongoose.disconnect();
  }
}

verifyIndianData().catch(console.error);
