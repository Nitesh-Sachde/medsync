const mongoose = require('mongoose');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const Prescription = require('../models/Prescription');
const User = require('../models/User');

async function createTestPrescription() {
  try {
    await mongoose.connect('mongodb://localhost:27017/medsync', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('💉 Creating test prescription...\n');

    // Get a patient and doctor
    const patient = await Patient.findOne().populate('user');
    const doctor = await Doctor.findOne().populate('user');

    if (!patient || !doctor) {
      console.log('❌ Could not find patient or doctor');
      return;
    }

    console.log('📋 Patient Details:');
    console.log(`Name: ${patient.user.name}`);
    console.log(`Age: ${patient.user.age}`);
    console.log(`Gender: ${patient.user.gender}`);
    console.log(`Contact: ${patient.user.contact}`);
    console.log(`Blood Group: ${patient.bloodGroup}`);

    console.log('\n👨‍⚕️ Doctor Details:');
    console.log(`Name: ${doctor.user.name}`);

    // Create a test prescription
    const prescription = new Prescription({
      patient: patient._id,
      doctor: doctor._id,
      medications: [
        {
          name: 'Paracetamol',
          dosage: '500mg',
          frequency: 'Twice daily',
          duration: '5 days',
          instructions: 'Take after meals'
        },
        {
          name: 'Vitamin D3',
          dosage: '1000 IU',
          frequency: 'Once daily',
          duration: '30 days',
          instructions: 'Take with breakfast'
        }
      ],
      status: 'active',
      date: new Date(),
      diagnosis: 'Common cold and vitamin deficiency',
      hospitalId: doctor.user.hospitalId
    });

    await prescription.save();
    console.log('\n✅ Test prescription created successfully!');
    console.log(`Prescription ID: ${prescription._id}`);

    // Fetch the prescription with populated data (as the API would)
    const populatedPrescription = await Prescription.findById(prescription._id)
      .populate({
        path: 'patient',
        populate: { path: 'user' }
      })
      .populate({ path: 'doctor', populate: { path: 'user' } })
      .populate('hospitalId');

    console.log('\n📄 Populated prescription data structure:');
    console.log('Patient name:', populatedPrescription.patient.user.name);
    console.log('Patient age:', populatedPrescription.patient.user.age);
    console.log('Patient gender:', populatedPrescription.patient.user.gender);
    console.log('Patient contact:', populatedPrescription.patient.user.contact);
    console.log('Patient blood group:', populatedPrescription.patient.bloodGroup);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

createTestPrescription();
