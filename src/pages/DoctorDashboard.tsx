
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Users, FileText, Pill, Activity, Phone, Bell, Stethoscope } from 'lucide-react';
import { request } from '../lib/api';
import { useAuth } from '../lib/authContext';

const DoctorDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [doctor, setDoctor] = useState<any>(null);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({});

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        // Fetch doctor info
        const doctorRes = await request(`/doctors/${user?.id}`);
        setDoctor(doctorRes.doctor);
        // Fetch all appointments and filter for this doctor
        const apptRes = await request('/appointments');
        const myAppointments = apptRes.appointments.filter((a: any) => a.doctor.user === user?.id);
        setAppointments(myAppointments);
        // Fetch all patients and filter for this doctor
        const patientRes = await request('/patients');
        const myPatients = patientRes.patients.filter((p: any) => myAppointments.some((a: any) => a.patient.user === p.user));
        setPatients(myPatients);
        // Stats
        setStats({
          todayAppointments: myAppointments.filter((a: any) => a.date === new Date().toISOString().slice(0, 10)).length,
          pendingReports: 0, // Placeholder, implement if you have report data
          totalPatients: myPatients.length,
          emergencies: myAppointments.filter((a: any) => a.type === 'Emergency').length
        });
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    if (user?.role === 'doctor') fetchData();
  }, [user]);

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Doctor Dashboard</h1>
              <p className="text-gray-600">Dr. Sarah Johnson - Cardiology</p>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm">
                <Bell className="h-4 w-4 mr-2" />
                Alerts ({stats.emergencies})
              </Button>
              <Button variant="outline" size="sm">
                <Phone className="h-4 w-4 mr-2" />
                Emergency
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Today's Appointments</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.todayAppointments}</p>
                </div>
                <Calendar className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending Reports</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.pendingReports}</p>
                </div>
                <FileText className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Patients</p>
                  <p className="text-2xl font-bold text-green-600">{stats.totalPatients}</p>
                </div>
                <Users className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Emergencies</p>
                  <p className="text-2xl font-bold text-red-600">{stats.emergencies}</p>
                </div>
                <Activity className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <Button className="h-16 medical-gradient text-white flex flex-col items-center justify-center">
            <Stethoscope className="h-5 w-5 mb-1" />
            New Consultation
          </Button>
          <Button variant="outline" className="h-16 flex flex-col items-center justify-center">
            <Pill className="h-5 w-5 mb-1" />
            Prescriptions
          </Button>
          <Button variant="outline" className="h-16 flex flex-col items-center justify-center">
            <FileText className="h-5 w-5 mb-1" />
            Medical Records
          </Button>
          <Button variant="outline" className="h-16 flex flex-col items-center justify-center">
            <Activity className="h-5 w-5 mb-1" />
            Lab Reports
          </Button>
          <Button variant="outline" className="h-16 flex flex-col items-center justify-center">
            <Calendar className="h-5 w-5 mb-1" />
            Schedule
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Today's Appointments */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Today's Appointments
              </CardTitle>
              <CardDescription>Your scheduled appointments for today</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {appointments.map((appointment) => (
                  <div key={appointment.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{appointment.patient.name}</h4>
                      <p className="text-sm text-gray-600">{appointment.type}</p>
                      <div className="flex items-center gap-1 mt-1 text-sm text-gray-500">
                        <Clock className="h-4 w-4" />
                        {appointment.time}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={
                        appointment.status === 'urgent' ? 'destructive' :
                        appointment.status === 'confirmed' ? 'default' : 'secondary'
                      }>
                        {appointment.status}
                      </Badge>
                      <Button size="sm" variant="outline">View</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Patients */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Recent Patients
              </CardTitle>
              <CardDescription>Recently treated patients</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {patients.map((patient) => (
                  <div key={patient.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{patient.name}</h4>
                      <p className="text-sm text-gray-600">{patient.condition}</p>
                      <p className="text-sm text-gray-500">Last visit: {patient.lastVisit}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={
                        patient.status === 'healthy' ? 'default' :
                        patient.status === 'stable' ? 'secondary' : 'outline'
                      }>
                        {patient.status}
                      </Badge>
                      <Button size="sm" variant="outline">View</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Pending Tasks */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Pending Tasks
              </CardTitle>
              <CardDescription>Items requiring your attention</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                  <div>
                    <p className="font-medium">Lab Report Review</p>
                    <p className="text-sm text-gray-600">5 reports pending</p>
                  </div>
                  <Button size="sm">Review</Button>
                </div>
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div>
                    <p className="font-medium">Prescription Renewals</p>
                    <p className="text-sm text-gray-600">3 renewals due</p>
                  </div>
                  <Button size="sm">Process</Button>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div>
                    <p className="font-medium">Patient Follow-ups</p>
                    <p className="text-sm text-gray-600">2 follow-ups needed</p>
                  </div>
                  <Button size="sm">Contact</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Weekly Overview
              </CardTitle>
              <CardDescription>Your weekly performance metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Patients Seen</span>
                  <span className="font-medium">47</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Prescriptions Written</span>
                  <span className="font-medium">32</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Lab Orders</span>
                  <span className="font-medium">15</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Average Consultation Time</span>
                  <span className="font-medium">18 min</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;
