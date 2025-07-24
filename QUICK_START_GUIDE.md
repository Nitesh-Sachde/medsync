# 🚀 Quick Start Testing Guide

## Prerequisites
- MongoDB running locally or connection string in .env
- Node.js installed
- Both backend and frontend dependencies installed

## 🔧 Setup Instructions

### 1. Install Dependencies
```bash
# Backend
cd backend
npm install

# Frontend  
cd ..
npm install
```

### 2. Environment Setup
Create `backend/.env` file:
```env
MONGODB_URI=mongodb://localhost:27017/medsync
JWT_SECRET=your_super_secret_jwt_key_here
GEMINI_API_KEY=your_google_gemini_api_key_here
```

### 3. Seed Test Data
```bash
cd backend
npm run seed
```

This creates test accounts for all roles with password: `password123`

### 4. Start Services
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd ..
npm run dev
```

### 5. Access Application
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000

## 🧪 Test Credentials

| Role | Email | Password | Dashboard |
|------|-------|----------|-----------|
| Super Admin | superadmin@test.com | password123 | System Management |
| Hospital Admin | admin@test.com | password123 | Hospital Management |
| Doctor | doctor@test.com | password123 | Patient Care |
| Doctor 2 | doctor2@test.com | password123 | Pediatrics |
| Pharmacist | pharmacist@test.com | password123 | Inventory & Prescriptions |
| Receptionist | receptionist@test.com | password123 | Registration & Appointments |
| Patient | patient@test.com | password123 | Personal Health |
| Patient 2 | patient2@test.com | password123 | Personal Health |

## 🎯 Testing Flow

### 1. Super Admin Testing
- Login with superadmin@test.com
- Create new hospitals
- View system-wide statistics
- Manage hospital administrators

### 2. Hospital Admin Testing  
- Login with admin@test.com
- Create staff users (doctors, pharmacists, receptionists)
- Monitor hospital operations
- View staff management

### 3. Doctor Testing
- Login with doctor@test.com
- View assigned patients
- Create prescriptions
- Schedule appointments
- Use AI Health Assistant

### 4. Pharmacist Testing
- Login with pharmacist@test.com
- Manage medication inventory
- View low stock alerts
- Dispense prescriptions
- Add new medications

### 5. Receptionist Testing
- Login with receptionist@test.com  
- Register new patients
- Schedule appointments
- Manage patient check-ins

### 6. Patient Testing
- Login with patient@test.com
- View medical history
- Book appointments
- View prescriptions
- Use AI Health Assistant

## 🛠️ Useful Commands

```bash
# Seed fresh test data
npm run seed

# Clear all test data
npm run clear

# Reset (clear + seed)
npm run reset

# Start backend in development mode
npm run dev

# Start backend in production mode
npm start
```

## 🔍 Debugging Tips

### Check Database Connection
```bash
# MongoDB shell
mongosh
use medsync
db.users.find({}, {name: 1, email: 1, role: 1})
```

### Check Console Logs
- Backend: Watch for user creation logs
- Frontend: Check browser console for errors
- Network: Check API calls in browser dev tools

### Common Issues
1. **MongoDB not running**: Start MongoDB service
2. **Port conflicts**: Change ports in config files
3. **Missing environment variables**: Check .env file
4. **CORS errors**: Verify frontend/backend URLs

## 📱 Mobile Testing
All dashboards are responsive. Test on:
- Desktop: 1920x1080
- Tablet: 768x1024  
- Mobile: 375x667

## 🤖 AI Features Testing
- Each role has customized AI assistant responses
- Test different medical queries
- Verify role-specific context in responses

## 📋 Feature Testing Checklist

### ✅ Authentication
- [ ] Login/logout functionality
- [ ] Role-based dashboard redirects
- [ ] Protected route access
- [ ] Password change flow

### ✅ Super Admin Features
- [ ] Hospital creation
- [ ] Admin user management
- [ ] System statistics

### ✅ Hospital Admin Features  
- [ ] Staff user creation
- [ ] Hospital settings
- [ ] User management

### ✅ Doctor Features
- [ ] Patient list view
- [ ] Prescription creation
- [ ] Appointment management
- [ ] AI assistant usage

### ✅ Pharmacist Features
- [ ] Inventory management
- [ ] Stock alerts
- [ ] Prescription dispensing
- [ ] Medication addition

### ✅ Receptionist Features
- [ ] Patient registration
- [ ] Appointment scheduling
- [ ] Check-in management

### ✅ Patient Features
- [ ] Profile viewing
- [ ] Appointment booking
- [ ] Prescription viewing
- [ ] AI health queries

Happy Testing! 🎉
