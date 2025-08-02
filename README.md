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

3. **Environment Setup**
   ```bash
   cd backend
   cp .env.example .env
   # Edit .env with your MongoDB URI and other configurations
   ```

4. **Start the application**
   ```bash
   # Frontend (from root directory)
   npm run dev
   
   # Backend (in another terminal)
   cd backend
   npm start
   ```

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

### Frontend
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

### Backend
- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon

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
