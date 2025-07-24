# MedSync Authentication & Testing Guide

## 🔐 Authentication System Overview

### User Hierarchy & Access Control

The MedSync system implements a multi-tier authentication system with role-based access control:

```
Super Admin (System Level)
    ↓
Hospital Admin (Hospital Level)
    ↓
Staff Users (Department Level)
    ├── Doctors
    ├── Pharmacists
    ├── Receptionists
    └── Patients
```

## 👥 User Roles & Permissions

### 1. **Super Admin** (`super-admin`)
- **Who creates them**: Manually seeded in database
- **Access**: Full system access across all hospitals
- **Responsibilities**:
  - Create and manage hospitals
  - Create hospital administrators
  - System-wide monitoring and control
- **Dashboard**: SuperAdminDashboard.tsx

### 2. **Hospital Admin** (`admin`)
- **Who creates them**: Super Admin
- **Access**: Full hospital management within their assigned hospital
- **Responsibilities**:
  - Create and manage all hospital staff (doctors, pharmacists, receptionists)
  - Manage hospital settings and configurations
  - Monitor hospital operations
- **Dashboard**: AdminDashboard.tsx

### 3. **Doctor** (`doctor`)
- **Who creates them**: Hospital Admin
- **Access**: Patient management, prescriptions, appointments
- **Responsibilities**:
  - View and manage assigned patients
  - Create prescriptions
  - Manage appointments
  - Access medical records
- **Dashboard**: DoctorDashboard.tsx

### 4. **Pharmacist** (`pharmacist`)
- **Who creates them**: Hospital Admin
- **Access**: Inventory management, prescription dispensing
- **Responsibilities**:
  - Manage medication inventory
  - Dispense prescriptions
  - Monitor stock levels and expiration dates
- **Dashboard**: PharmacyDashboard.tsx

### 5. **Receptionist** (`receptionist`)
- **Who creates them**: Hospital Admin
- **Access**: Patient registration, appointment scheduling
- **Responsibilities**:
  - Register new patients
  - Schedule appointments
  - Manage patient check-ins
- **Dashboard**: ReceptionistDashboard.tsx

### 6. **Patient** (`patient`)
- **Who creates them**: 
  - Self-registration through public signup
  - Receptionist during hospital visit
- **Access**: Personal medical records, appointments, prescriptions
- **Responsibilities**:
  - View medical history
  - Book appointments
  - View prescriptions
- **Dashboard**: PatientDashboard.tsx

## 🔑 Password Management & Security

### Password Generation
- **Auto-generated passwords**: 12-character random secure passwords
- **Initial setup**: `mustChangePassword: true` flag forces password change on first login
- **Hashing**: bcrypt with 10 salt rounds
- **JWT**: 7-day expiration tokens

### Password Requirements
- Minimum 6 characters for user-set passwords
- Auto-generated passwords are 12 characters (base64 encoded)

## 📧 Credential Distribution

### Current Implementation (Development)
```javascript
// Credentials are logged to console (for development)
console.log(email, password);
```

### Production Implementation (Commented Out)
```javascript
// Email notification system using nodemailer
const transporter = nodemailer.createTransporter({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});
```

## 🧪 Testing Guide - How to Access All Modules

### Step 1: Create Super Admin (Manual Database Entry)

Create a MongoDB document directly:

```javascript
// Connect to MongoDB and insert super admin
db.users.insertOne({
  name: "Super Administrator",
  email: "superadmin@medsync.com",
  password: "$2a$10$hashedPasswordHere", // bcrypt hash of "password123"
  role: "super-admin",
  contact: "+1234567890",
  mustChangePassword: false,
  active: true,
  createdAt: new Date(),
  updatedAt: new Date()
});
```

**OR use this quick script:**

```javascript
// Add to backend/scripts/createSuperAdmin.js
const mongoose = require('mongoose');
const User = require('../models/User');

async function createSuperAdmin() {
  await mongoose.connect('your_mongodb_connection_string');
  
  const superAdmin = new User({
    name: "Super Administrator",
    email: "superadmin@medsync.com",
    password: "password123", // Will be hashed automatically
    role: "super-admin",
    contact: "+1234567890",
    mustChangePassword: false
  });
  
  await superAdmin.save();
  console.log("Super Admin created:", superAdmin.email);
  process.exit(0);
}

createSuperAdmin();
```

### Step 2: Testing Flow

#### 🔹 **1. Test Super Admin Dashboard**
```
Login: superadmin@medsync.com
Password: password123
URL: /dashboard (will redirect to SuperAdminDashboard)
```

**Actions to test:**
- Create a hospital (e.g., "City General Hospital")
- This automatically creates a hospital admin
- Check console logs for admin credentials

#### 🔹 **2. Test Hospital Admin Dashboard**
```
Login: [admin email from console logs]
Password: [admin password from console logs]
URL: /dashboard (will redirect to AdminDashboard)
```

**Actions to test:**
- Create doctors, pharmacists, receptionists
- Check console logs for their credentials
- Manage hospital settings

#### 🔹 **3. Test Doctor Dashboard**
```
Login: [doctor email from console logs]
Password: [doctor password from console logs]
URL: /dashboard (will redirect to DoctorDashboard)
```

**Actions to test:**
- View appointments
- Create prescriptions
- Manage patients
- Use AI Assistant

#### 🔹 **4. Test Pharmacist Dashboard**
```
Login: [pharmacist email from console logs]  
Password: [pharmacist password from console logs]
URL: /dashboard (will redirect to PharmacyDashboard)
```

**Actions to test:**
- Manage inventory
- View low stock alerts
- Dispense prescriptions
- Add medications

#### 🔹 **5. Test Receptionist Dashboard**
```
Login: [receptionist email from console logs]
Password: [receptionist password from console logs]  
URL: /dashboard (will redirect to ReceptionistDashboard)
```

**Actions to test:**
- Register new patients
- Schedule appointments
- Manage patient check-ins

#### 🔹 **6. Test Patient Dashboard**
```
Option A: Self-register at /register
Option B: Have receptionist create patient account
URL: /dashboard (will redirect to PatientDashboard)
```

**Actions to test:**
- View medical history
- Book appointments
- View prescriptions
- Use AI Health Assistant

## 🚀 Quick Testing Setup Script

Create `backend/scripts/seedTestData.js`:

```javascript
const mongoose = require('mongoose');
const User = require('../models/User');
const Hospital = require('../models/Hospital');

async function seedTestData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/medsync');
    
    // Create Super Admin
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
    const hospital = new Hospital({
      name: "Test General Hospital",
      address: "123 Medical Ave, Test City",
      contact: "+1987654321"
    });
    await hospital.save();
    
    // Create Hospital Admin
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
    
    // Create Test Staff
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
    
    const patient = new User({
      name: "John Patient",
      email: "patient@test.com",
      password: "password123",
      role: "patient",
      contact: "+5555555555",
      mustChangePassword: false
    });
    await patient.save();
    
    console.log("✅ Test data seeded successfully!");
    console.log("🔑 Test Credentials:");
    console.log("Super Admin: superadmin@test.com / password123");
    console.log("Hospital Admin: admin@test.com / password123");
    console.log("Doctor: doctor@test.com / password123");
    console.log("Pharmacist: pharmacist@test.com / password123");
    console.log("Receptionist: receptionist@test.com / password123");
    console.log("Patient: patient@test.com / password123");
    
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding data:", error);
    process.exit(1);
  }
}

seedTestData();
```

### Run the seed script:
```bash
cd backend
node scripts/seedTestData.js
```

## 📋 Test Credentials Summary

After running the seed script, use these credentials:

| Role | Email | Password | Dashboard Access |
|------|-------|----------|------------------|
| Super Admin | superadmin@test.com | password123 | SuperAdminDashboard |
| Hospital Admin | admin@test.com | password123 | AdminDashboard |
| Doctor | doctor@test.com | password123 | DoctorDashboard |
| Pharmacist | pharmacist@test.com | password123 | PharmacyDashboard |
| Receptionist | receptionist@test.com | password123 | ReceptionistDashboard |
| Patient | patient@test.com | password123 | PatientDashboard |

## 🔒 Security Features

### Authentication Middleware
- **JWT Token Validation**: All protected routes require valid JWT
- **Role-based Access Control**: Routes protected by role middleware
- **Automatic Token Refresh**: 7-day token expiration
- **Password Hashing**: bcrypt with salt rounds

### Route Protection Examples
```javascript
// Admin only routes
router.post('/users', auth, role(['admin']), userController.createUser);

// Super admin only routes  
router.post('/hospitals', auth, role(['super-admin']), superAdminController.createHospitalAndAdmin);

// Multi-role access
router.get('/appointments', auth, role(['doctor', 'patient', 'receptionist']), appointmentController.getAppointments);
```

### Password Change Flow
1. User logs in with temporary password
2. `mustChangePassword: true` flag detected
3. Frontend redirects to password change page
4. User sets new password
5. `mustChangePassword` flag set to `false`

## 🌐 Frontend Authentication Integration

### AuthContext Usage
```typescript
const { user, login, logout } = useAuth();

// Redirect based on role
useEffect(() => {
  if (user) {
    switch (user.role) {
      case 'super-admin': navigate('/dashboard');
      case 'admin': navigate('/dashboard'); 
      case 'doctor': navigate('/dashboard');
      // ... etc
    }
  }
}, [user]);
```

### Protected Route Component
```typescript
<ProtectedRoute>
  <DoctorDashboard />
</ProtectedRoute>
```

## 🔧 Environment Variables

Required for production email sending:
```env
JWT_SECRET=your_super_secret_jwt_key
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
MONGODB_URI=mongodb://localhost:27017/medsync
```

## 📱 Testing Mobile Responsive Design

All dashboards are responsive. Test on:
- Desktop (1920x1080)
- Tablet (768x1024) 
- Mobile (375x667)

## 🎯 Key Testing Scenarios

### 1. **User Creation Flow**
- Super admin creates hospital + admin
- Admin creates staff users
- Check console logs for credentials
- Test login with generated credentials

### 2. **Role-based Access**
- Try accessing unauthorized routes
- Verify proper dashboard redirects
- Test role-specific features

### 3. **Password Management**
- Test forced password change
- Verify password hashing
- Test login with new passwords

### 4. **Multi-hospital Support**
- Create multiple hospitals
- Verify user isolation between hospitals
- Test admin access restrictions

### 5. **AI Assistant Integration**
- Test AI chatbot on each dashboard
- Verify role-specific responses
- Test conversation history

This comprehensive guide provides everything needed to test and understand the MedSync authentication system! 🚀
