
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Users, 
  Calendar, 
  MessageSquare, 
  Stethoscope, 
  Pill, 
  FileText,
  Shield,
  Activity,
  Clock
} from 'lucide-react';

const ServiceCards = () => {
  const services = [
    {
      icon: Users,
      title: 'Patient Portal',
      description: 'Self-registration, appointment booking, and secure access to health records',
      color: 'bg-blue-50 text-blue-600',
      features: ['Online Registration', 'Appointment Booking', 'Medical History']
    },
    {
      icon: Stethoscope,
      title: 'Doctor Dashboard',
      description: 'Complete patient management with e-prescriptions and scheduling tools',
      color: 'bg-green-50 text-green-600',
      features: ['Patient Management', 'E-Prescriptions', 'Schedule Management']
    },
    {
      icon: MessageSquare,
      title: 'AI Health Assistant',
      description: '24/7 intelligent chatbot for instant health queries and guidance',
      color: 'bg-purple-50 text-purple-600',
      features: ['24/7 Availability', 'Health FAQs', 'Symptom Checker']
    },
    {
      icon: Calendar,
      title: 'Smart Scheduling',
      description: 'Automated appointment management with conflict resolution',
      color: 'bg-orange-50 text-orange-600',
      features: ['Auto Scheduling', 'Conflict Detection', 'Reminders']
    },
    {
      icon: Pill,
      title: 'Pharmacy Module',
      description: 'Medicine dispensing and inventory management system',
      color: 'bg-red-50 text-red-600',
      features: ['Stock Management', 'Prescription Tracking', 'Dispensing Log']
    }
  ];

  return (
    <section id="services" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center space-x-2 text-primary font-medium mb-4">
            <Activity className="h-5 w-5" />
            <span>Our Services</span>
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Comprehensive Healthcare Solutions
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            From patient management to AI-powered assistance, MedSync provides everything your healthcare facility needs to operate efficiently and deliver exceptional patient care.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => {
            const IconComponent = service.icon;
            return (
              <Card key={index} className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg hover:-translate-y-2">
                <CardHeader className="pb-4">
                  <div className={`w-12 h-12 rounded-lg ${service.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <IconComponent className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-xl font-semibold text-gray-900 group-hover:text-primary transition-colors">
                    {service.title}
                  </CardTitle>
                  <CardDescription className="text-gray-600">
                    {service.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {service.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center space-x-2 text-sm text-gray-600">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Emergency Notice */}
        <div className="mt-16 bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-2xl p-6">
          <div className="flex items-start space-x-4">
            <div className="bg-red-100 p-2 rounded-lg">
              <Shield className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-red-900 mb-2">Emergency Support</h3>
              <p className="text-red-800 mb-4">
                Special workflow for patients unable to self-register during emergencies. Our receptionist portal enables quick patient onboarding with data synchronization once the patient is stable.
              </p>
              <div className="flex items-center space-x-2 text-sm text-red-700">
                <Clock className="h-4 w-4" />
                <span>Available 24/7 for emergency situations</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ServiceCards;
