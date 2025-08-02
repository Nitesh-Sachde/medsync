# MedSync - Hospital Management System

A comprehensive hospital management system built with React + TypeScript frontend and Node.js + MongoDB backend.

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- MongoDB
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd medsync-ai-health-main
   ```

2. **Install dependencies**
   ```bash
   # Frontend
   npm install
   
   # Backend
   cd backend
   npm install
   ```

3. **Environment Setup (Optional)**
   ```bash
   # The application works with default settings
   # Create .env file only if you need custom configuration
   cd backend
   
   # Optional: Create .env for custom settings
   touch .env  # Linux/Mac
   # or
   echo. > .env  # Windows
   ```
   
   **Optional Environment Variables:**
   ```bash
   # Database (default: mongodb://localhost:27017/medsync)
   MONGO_URI=mongodb://localhost:27017/medsync
   
   # JWT Secret (default: supersecret)
   JWT_SECRET=your_jwt_secret_here
   
   # AI Features (optional)
   GEMINI_API_KEY=your_gemini_api_key
   
   # Email Features (required for hospital admin creation)
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your_email@gmail.com
   SMTP_PASS=your_app_password  # For Gmail, use App Password, not regular password
   ```

   **Important for Email Setup:**
   - For Gmail, you need to generate an App Password:
     1. Enable 2-Factor Authentication on your Google account
     2. Go to Google Account Settings → Security → App passwords
     3. Generate a password for "Mail" and use that as SMTP_PASS
   - The email configuration is required for:
     - Creating hospital admins (sends login credentials)
     - Password reset functionality
     - System notifications

4. **Seed the database with sample data**
   ```bash
   cd backend
   node scripts/seedData.js
   ```

5. **Start the application**
   ```bash
   # Frontend (from root directory)
   npm run dev
   
   # Backend (in another terminal)
   cd backend
   npm start
   ```

## 🔑 Default Login Credentials

After seeding the database, use these credentials:

- **Super Admin**: `superadmin@medsync.in` / `abc123`
- **Doctor**: `priyasharma1@medsync.in` / `doctor123` 
- **Patient**: `rameshkumar1@gmail.com` / `patient123`
- **Hospital Admin**: `admin2@fortishospitalmumbai.com` / `admin123`

## 📁 Project Structure

```
medsync-ai-health-main/
├── src/                    # Frontend React application
│   ├── components/         # Reusable UI components
│   ├── pages/             # Page components
│   ├── hooks/             # Custom React hooks
│   └── lib/               # Utility functions and configs
├── backend/               # Node.js API server
│   ├── controllers/       # API route handlers
│   ├── models/           # MongoDB schemas
│   ├── routes/           # API routes
│   ├── middleware/       # Express middleware
│   ├── scripts/          # Database seeding utilities
│   └── services/         # Business logic services
├── public/               # Static assets
└── unused-modules/       # Future features and components
```

## 🎯 Features

- **Multi-role Authentication** (Super Admin, Hospital Admin, Doctor, Patient, Pharmacist)
- **Patient Management** with complete medical records
- **Appointment Booking System**
- **Prescription Management** with PDF generation
- **Hospital & Staff Management**
- **AI Health Assistant Integration**
- **Mobile Responsive Design**
- **Real-time Updates**

## 🔧 Available Scripts

### Frontend (from root directory)
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run seed` - Seed database with sample data

### Backend (from backend/ directory)
- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm run seed` - Seed database with sample data

## 🌐 Access URLs

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000/api

## 📚 API Documentation

The API follows RESTful conventions with the following main endpoints:

- `/api/auth` - Authentication & user management
- `/api/patients` - Patient management
- `/api/doctors` - Doctor profiles and schedules
- `/api/appointments` - Appointment booking and management
- `/api/prescriptions` - Medical prescriptions
- `/api/hospitals` - Hospital information

## 🔮 Future Enhancements

The `unused-modules/` directory contains additional features ready for integration:

- **Extended Admin Dashboard** - Advanced administrative controls
- **Pharmacy Management** - Complete inventory and medication tracking
- **Reception Dashboard** - Front desk and visitor management
- **Department Management** - Hospital department organization
- **Advanced Inventory System** - Medical supplies and equipment tracking

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the ISC License.

---

*Built with ❤️ for better healthcare management*
