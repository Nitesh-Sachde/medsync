require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Import models to register schemas
require('./models/User');
require('./models/Patient');
require('./models/Doctor');
require('./models/Appointment');
require('./models/Prescription');
require('./models/LabReport');
require('./models/Department');
require('./models/Activity');
require('./models/Inventory');
require('./models/WalkIn');
require('./models/Approval');
require('./models/Hospital');

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Auth routes
app.use('/api/auth', require('./routes/auth'));

// Patient routes
app.use('/api/patients', require('./routes/patient'));

// Doctor routes
app.use('/api/doctors', require('./routes/doctor'));

// Appointment routes
app.use('/api/appointments', require('./routes/appointment'));

// Prescription routes
app.use('/api/prescriptions', require('./routes/prescription'));

// LabReport routes
app.use('/api/labreports', require('./routes/labReport'));

// Inventory routes
app.use('/api/inventory', require('./routes/inventory'));

// WalkIn routes
app.use('/api/walkins', require('./routes/walkIn'));

// Approval routes
app.use('/api/approvals', require('./routes/approval'));

// Activity routes
app.use('/api/activities', require('./routes/activity'));

// Department routes
app.use('/api/departments', require('./routes/department'));

// Hospital routes
app.use('/api/hospitals', require('./routes/hospital'));

// Super-admin routes
app.use('/api/superadmin', require('./routes/superAdmin'));

// User routes
app.use('/api/users', require('./routes/user'));

// MongoDB connection
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/medsync';

mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {
    console.log('MongoDB connected');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
  });
