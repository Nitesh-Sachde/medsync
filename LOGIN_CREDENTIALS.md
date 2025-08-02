# 🔑 MedSync Login Credentials Guide

## Current System Status ✅
- **Total Users**: 184
- **Hospitals**: 12 major Indian hospitals
- **All passwords have been verified and are working**

---

## 🚀 Super Administrator
```
Email: superadmin@medsync.in
Password: abc123
Access: Complete system control, manage all hospitals
```

---

## 🏥 Hospital Administrators (12 admins)
Each hospital now has a dedicated administrator:

### Apollo Hospital Chennai
```
Email: admin2@fortishospitalmumbai.com
Password: admin123
```

### Fortis Hospital Mumbai  
```
Email: admin5@maxhospitaldelhi.com
Password: admin123
```

### AIIMS New Delhi
```
Email: admin1@apollohospitalchennai.com  
Password: admin123
```

### Manipal Hospital Bangalore
```
Email: admin7@medantagurgaon.com
Password: admin123
```

### Max Super Speciality Hospital Saket
```
Email: admin8@cmcvellore.com
Password: admin123
```

### Kokilaben Dhirubhai Ambani Hospital
```
Email: admin6@kokilabenhospitalmumbai.com
Password: admin123
```

### Christian Medical College Vellore
```
Email: admin4@manipalhospitalbangalore.com
Password: admin123
```

### Medanta The Medicity Gurgaon
```
Email: admin9@tatamemorialmumbai.com
Password: admin123
```

### Narayana Health Bangalore
```
Email: admin10@sankaranethralayachennai.com
Password: admin123
```

### Ruby Hall Clinic Pune
```
Email: admin11@rubyhallpune.com
Password: admin123
```

### Sankara Nethralaya Chennai
```
Email: admin12@narayanahealthbangalore.com
Password: admin123
```

### Breach Candy Hospital Mumbai
```
Email: admin3@aiimsnewdelhi.com
Password: admin123
```

*All hospital admin passwords: admin123*

---

## 👨‍⚕️ Doctors (120 total - 10 per hospital)

### Sample Doctor Accounts (All verified working):
```
Email: rajeshkumar1@medsync.in
Password: doctor123
Specialty: Cardiology

Email: priyasharma1@medsync.in  
Password: doctor123
Specialty: Neurology

Email: arunpatel1@medsync.in
Password: doctor123
Specialty: Orthopedics
```

*All doctor passwords have been reset and verified: doctor123*

---

## 👥 Patients (50 total)

### Sample Patient Accounts:
```
Email: rameshkumar1@gmail.com
Password: patient123

Email: sunitadevi2@gmail.com
Password: patient123

Email: amitsharma3@gmail.com  
Password: patient123
```

*All patient passwords: patient123*

---

## 🎯 For Screenshots & Demonstration

### Recommended Login Flow:
1. **Super Admin**: Login with `superadmin@medsync.in / abc123`
2. **Hospital Admin**: Login with `admin2@fortishospitalmumbai.com / admin123` (Apollo admin)
3. **Doctor**: Login with `rajeshkumar1@medsync.in / doctor123`
4. **Patient**: Login with `rameshkumar1@gmail.com / patient123`

---

## 🔧 Quick Commands

### Regenerate Data:
```bash
cd backend
npm run seed
```

### Check Users:
```bash  
cd backend
node scripts/checkUsers.js
```

### Test Login:
```bash
cd backend  
node scripts/testLogin.js
```

---

## ✅ Verification Complete
- ✅ Hospital admins created (fixes "No admins yet" issue - all hospitals now show linked admins)
- ✅ Doctor passwords fixed (rajeshkumar1@medsync.in now works)
- ✅ All user roles populated with realistic Indian data
- ✅ Patient details enhanced (age, gender, contact, blood group) for prescription PDFs
- ✅ Prescription PDF generation fixed - now shows complete patient information
- ✅ System ready for professional screenshots

**Your MedSync system is now fully configured with working credentials!** 🎉
