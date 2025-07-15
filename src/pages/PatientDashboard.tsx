
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, User, FileText, Pill, Activity, Phone, Bell } from 'lucide-react';
import { request } from '../lib/api';
import { useAuth } from '../lib/authContext';
import { useNavigate } from 'react-router-dom';

const PatientDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [patient, setPatient] = useState<any>(null);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [labResults, setLabResults] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        // Fetch patient info by user ID
        const patientRes = await request(`/patients/by-user/${user?.id}`);
        setPatient(patientRes.patient);
        // Fetch appointments for this patient
        const apptRes = await request('/appointments');
        setAppointments(apptRes.appointments.filter((a: any) => a.patient.user === user?.id));
        // Fetch prescriptions for this patient
        const presRes = await request('/prescriptions');
        setPrescriptions(presRes.prescriptions.filter((p: any) => p.patient.user === user?.id));
        // Fetch lab results for this patient
        const labRes = await request('/labreports');
        setLabResults(labRes.labReports.filter((l: any) => l.patient.user === user?.id));
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    if (user?.id) fetchData();
  }, [user]);

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
  if (!patient) return <div className="p-8 text-center">No patient data found.</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Patient Dashboard</h1>
              <p className="text-gray-600">Welcome back, {patient.user?.name}</p>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm">
                <Bell className="h-4 w-4 mr-2" />
                Notifications
              </Button>
              <Button variant="outline" size="sm">
                <Phone className="h-4 w-4 mr-2" />
                Emergency
              </Button>
              <Button className="bg-red-500 hover:bg-red-600 text-white font-semibold px-4 py-2 rounded" onClick={() => { logout(); setTimeout(() => navigate('/'), 100); }}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Button className="h-20 medical-gradient text-white flex flex-col items-center justify-center">
            <Calendar className="h-6 w-6 mb-2" />
            Book Appointment
          </Button>
          <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
            <FileText className="h-6 w-6 mb-2" />
            View Records
          </Button>
          <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
            <Pill className="h-6 w-6 mb-2" />
            Prescriptions
          </Button>
          <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
            <Activity className="h-6 w-6 mb-2" />
            Lab Results
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upcoming Appointments */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Upcoming Appointments
              </CardTitle>
              <CardDescription>Your scheduled medical appointments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {appointments.map((appointment) => (
                  <div key={appointment.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{appointment.doctor.name}</h4>
                      <p className="text-sm text-gray-600">{appointment.specialty}</p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {appointment.date}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {appointment.time}
                        </span>
                      </div>
                    </div>
                    <Badge variant={appointment.status === 'confirmed' ? 'default' : 'secondary'}>
                      {appointment.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Prescriptions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Pill className="h-5 w-5" />
                Recent Prescriptions
              </CardTitle>
              <CardDescription>Your current and past medications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {prescriptions.map((prescription) => (
                  <div key={prescription.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{prescription.medication}</h4>
                      <p className="text-sm text-gray-600">Prescribed by {prescription.doctor.name}</p>
                      <p className="text-sm text-gray-500">{prescription.date}</p>
                    </div>
                    <Badge variant={prescription.status === 'active' ? 'default' : 'secondary'}>
                      {prescription.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Lab Results */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Lab Results
              </CardTitle>
              <CardDescription>Your recent test results</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {labResults.map((result) => (
                  <div key={result.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{result.test}</h4>
                      <p className="text-sm text-gray-500">{result.date}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={result.status === 'ready' ? 'default' : 'secondary'}>
                        {result.status}
                      </Badge>
                      {result.status === 'ready' && (
                        <Button size="sm" variant="outline">View</Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Health Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Health Summary
              </CardTitle>
              <CardDescription>Your current health information</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-blue-900">Blood Pressure</h4>
                    <p className="text-blue-700">120/80 mmHg</p>
                    <p className="text-xs text-blue-600">Normal</p>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg">
                    <h4 className="font-medium text-green-900">Weight</h4>
                    <p className="text-green-700">70 kg</p>
                    <p className="text-xs text-green-600">Healthy</p>
                  </div>
                  <div className="p-3 bg-yellow-50 rounded-lg">
                    <h4 className="font-medium text-yellow-900">Glucose</h4>
                    <p className="text-yellow-700">95 mg/dL</p>
                    <p className="text-xs text-yellow-600">Normal</p>
                  </div>
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <h4 className="font-medium text-purple-900">Heart Rate</h4>
                    <p className="text-purple-700">72 bpm</p>
                    <p className="text-xs text-purple-600">Normal</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;
