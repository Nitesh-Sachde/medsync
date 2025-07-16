
import React, { useEffect, useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Users, FileText, Pill, Activity, Phone, Bell, Stethoscope, LogOut } from 'lucide-react';
import { request } from '../lib/api';
import { useAuth } from '../lib/authContext';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Form, FormItem, FormLabel, FormControl, FormField, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useNavigate } from 'react-router-dom';

const DoctorDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [doctor, setDoctor] = useState<any>(null);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({});
  const [showConsultModal, setShowConsultModal] = useState(false);
  const [consultLoading, setConsultLoading] = useState(false);
  const [consultError, setConsultError] = useState('');
  const [consultSuccess, setConsultSuccess] = useState('');
  const [consultForm, setConsultForm] = useState({
    patient: '',
    date: '',
    time: '',
    type: 'Consultation',
    notes: '',
  });
  const [showPrescriptionsModal, setShowPrescriptionsModal] = useState(false);
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [prescriptionsLoading, setPrescriptionsLoading] = useState(false);
  const [prescriptionsError, setPrescriptionsError] = useState('');
  const [prescriptionSearch, setPrescriptionSearch] = useState('');
  const [showCreatePrescription, setShowCreatePrescription] = useState(false);
  const [createPrescriptionLoading, setCreatePrescriptionLoading] = useState(false);
  const [createPrescriptionError, setCreatePrescriptionError] = useState('');
  const [createPrescriptionSuccess, setCreatePrescriptionSuccess] = useState('');
  const [createPrescriptionForm, setCreatePrescriptionForm] = useState({
    patient: '',
    medication: '',
    quantity: '',
    date: '',
    status: 'pending',
  });

  // Add a function to refresh appointments and patients
  const refreshAppointments = async () => {
    setLoading(true);
    setError('');
    try {
      const doctorRes = await request(`/doctors/by-user/${user?.id}`);
      setDoctor(doctorRes.doctor);
      const apptRes = await request('/appointments/doctor');
      setAppointments(apptRes.appointments);
      const patientRes = await request('/patients');
      const myPatients = patientRes.patients.filter((p: any) => apptRes.appointments.some((a: any) => a.patient.user === p.user));
      setPatients(myPatients);
      setStats({
        todayAppointments: apptRes.appointments.filter((a: any) => a.date === new Date().toISOString().slice(0, 10)).length,
        pendingReports: 0,
        totalPatients: myPatients.length,
        emergencies: apptRes.appointments.filter((a: any) => a.type === 'Emergency').length
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'doctor') refreshAppointments();
  }, [user]);

  // Fetch prescriptions for this doctor
  useEffect(() => {
    if (!showPrescriptionsModal || !doctor) return;
    const fetchPrescriptions = async () => {
      setPrescriptionsLoading(true);
      setPrescriptionsError('');
      try {
        const res = await request('/prescriptions');
        // Filter prescriptions for this doctor
        const myPrescriptions = res.prescriptions.filter((p: any) => {
          return p.doctor && (p.doctor._id === doctor._id || p.doctor.id === doctor._id);
        });
        setPrescriptions(myPrescriptions);
      } catch (err: any) {
        setPrescriptionsError(err.message || 'Failed to fetch prescriptions.');
      } finally {
        setPrescriptionsLoading(false);
      }
    };
    fetchPrescriptions();
  }, [showPrescriptionsModal, doctor]);

  // Filtered prescriptions by search
  const filteredPrescriptions = useMemo(() => {
    if (!prescriptionSearch) return prescriptions;
    return prescriptions.filter((p: any) => {
      const patientName = p.patient?.user?.name || p.patient?.name || '';
      return (
        patientName.toLowerCase().includes(prescriptionSearch.toLowerCase()) ||
        p.medication.toLowerCase().includes(prescriptionSearch.toLowerCase())
      );
    });
  }, [prescriptions, prescriptionSearch]);

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  // Helper for patient options
  const patientOptions = patients.map((p: any) => ({
    value: p._id || p.id,
    label: p.name || (p.user && p.user.name) || 'Patient',
  }));

  // Handle form changes
  const handleConsultChange = (field: string, value: string) => {
    setConsultForm((prev) => ({ ...prev, [field]: value }));
  };

  // Handle form submit
  const handleConsultSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setConsultLoading(true);
    setConsultError('');
    setConsultSuccess('');
    try {
      if (!consultForm.patient || !consultForm.date || !consultForm.time) {
        setConsultError('Please fill all required fields.');
        setConsultLoading(false);
        return;
      }
      // Find patient object for hospitalId
      const patientObj = patients.find((p: any) => (p._id || p.id) === consultForm.patient);
      const hospitalId = doctor && doctor.user && doctor.user.hospitalId ? doctor.user.hospitalId : '';
      const payload = {
        patient: consultForm.patient,
        doctor: doctor._id || doctor.id,
        hospitalId,
        date: consultForm.date,
        time: consultForm.time,
        status: 'confirmed',
        type: consultForm.type,
        notes: consultForm.notes,
      };
      await request('/appointments', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      setConsultSuccess('Consultation created successfully!');
      setShowConsultModal(false);
      await refreshAppointments(); // Auto-refresh after booking
    } catch (err: any) {
      setConsultError(err.message || 'Failed to create consultation.');
    } finally {
      setConsultLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleCreatePrescriptionChange = (field: string, value: string) => {
    setCreatePrescriptionForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleCreatePrescriptionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatePrescriptionLoading(true);
    setCreatePrescriptionError('');
    setCreatePrescriptionSuccess('');
    try {
      if (!createPrescriptionForm.patient || !createPrescriptionForm.medication || !createPrescriptionForm.quantity || !createPrescriptionForm.date) {
        setCreatePrescriptionError('Please fill all required fields.');
        setCreatePrescriptionLoading(false);
        return;
      }
      const hospitalId = doctor && doctor.user && doctor.user.hospitalId ? doctor.user.hospitalId : '';
      const payload = {
        patient: createPrescriptionForm.patient,
        doctor: doctor._id || doctor.id,
        hospitalId,
        medication: createPrescriptionForm.medication,
        quantity: Number(createPrescriptionForm.quantity),
        date: createPrescriptionForm.date,
        status: createPrescriptionForm.status,
      };
      await request('/prescriptions', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      setCreatePrescriptionSuccess('Prescription created successfully!');
      setShowCreatePrescription(false);
      setCreatePrescriptionForm({ patient: '', medication: '', quantity: '', date: '', status: 'pending' });
      // Refresh prescriptions list
      const res = await request('/prescriptions');
      const myPrescriptions = res.prescriptions.filter((p: any) => {
        return p.doctor && (p.doctor._id === doctor._id || p.doctor.id === doctor._id);
      });
      setPrescriptions(myPrescriptions);
    } catch (err: any) {
      setCreatePrescriptionError(err.message || 'Failed to create prescription.');
    } finally {
      setCreatePrescriptionLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Doctor Dashboard</h1>
              <p className="text-gray-600">
                {doctor && doctor.user && doctor.user.name ? `Dr. ${doctor.user.name}${doctor.specialty ? ' - ' + doctor.specialty : ''}${doctor.department ? ' (' + doctor.department + ')' : ''}` : 'Doctor'}
              </p>
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
              <Button variant="destructive" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
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
          <Button variant="outline" className="h-16 flex flex-col items-center justify-center" onClick={refreshAppointments}>
            <Calendar className="h-5 w-5 mb-1" />
            Refresh
          </Button>
          <Dialog open={showConsultModal} onOpenChange={setShowConsultModal}>
            <DialogTrigger asChild>
              <Button className="h-16 medical-gradient text-white flex flex-col items-center justify-center" onClick={() => setShowConsultModal(true)}>
                <Stethoscope className="h-5 w-5 mb-1" />
                New Consultation
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>New Consultation</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleConsultSubmit} className="space-y-4">
                <FormItem>
                  <FormLabel>Patient</FormLabel>
                  <Select value={consultForm.patient} onValueChange={v => handleConsultChange('patient', v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select patient" />
                    </SelectTrigger>
                    <SelectContent>
                      {patientOptions.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
                <div className="flex gap-2">
                  <FormItem className="flex-1">
                    <FormLabel>Date</FormLabel>
                    <FormControl>
                      <Input type="date" value={consultForm.date} onChange={e => handleConsultChange('date', e.target.value)} required />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                  <FormItem className="flex-1">
                    <FormLabel>Time</FormLabel>
                    <FormControl>
                      <Input type="time" value={consultForm.time} onChange={e => handleConsultChange('time', e.target.value)} required />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                </div>
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <FormControl>
                    <Input value={consultForm.type} onChange={e => handleConsultChange('type', e.target.value)} placeholder="Consultation, Follow-up, Emergency..." />
                  </FormControl>
                  <FormMessage />
                </FormItem>
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea value={consultForm.notes} onChange={e => handleConsultChange('notes', e.target.value)} placeholder="Optional notes..." />
                  </FormControl>
                  <FormMessage />
                </FormItem>
                {consultError && <div className="text-red-500 text-sm">{consultError}</div>}
                {consultSuccess && <div className="text-green-600 text-sm">{consultSuccess}</div>}
                <DialogFooter>
                  <Button type="submit" className="medical-gradient text-white" disabled={consultLoading}>
                    {consultLoading ? 'Creating...' : 'Create Consultation'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
          <Dialog open={showPrescriptionsModal} onOpenChange={setShowPrescriptionsModal}>
            <DialogTrigger asChild>
              <Button variant="outline" className="h-16 flex flex-col items-center justify-center" onClick={() => setShowPrescriptionsModal(true)}>
                <Pill className="h-5 w-5 mb-1" />
                Prescriptions
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Prescriptions</DialogTitle>
              </DialogHeader>
              <div className="mb-4 flex gap-2">
                <Input
                  placeholder="Search by patient or medication..."
                  value={prescriptionSearch}
                  onChange={e => setPrescriptionSearch(e.target.value)}
                  className="flex-1"
                />
                <Button className="medical-gradient text-white" type="button" onClick={() => setShowCreatePrescription((v) => !v)}>
                  {showCreatePrescription ? 'Cancel' : 'Create Prescription'}
                </Button>
              </div>
              {showCreatePrescription && (
                <form onSubmit={handleCreatePrescriptionSubmit} className="mb-6 space-y-3 bg-gray-50 p-4 rounded-lg border">
                  <div className="flex gap-2">
                    <FormItem className="flex-1">
                      <FormLabel>Patient</FormLabel>
                      <Select value={createPrescriptionForm.patient} onValueChange={v => handleCreatePrescriptionChange('patient', v)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select patient" />
                        </SelectTrigger>
                        <SelectContent>
                          {patientOptions.map(opt => (
                            <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                    <FormItem className="flex-1">
                      <FormLabel>Date</FormLabel>
                      <FormControl>
                        <Input type="date" value={createPrescriptionForm.date} onChange={e => handleCreatePrescriptionChange('date', e.target.value)} required />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  </div>
                  <div className="flex gap-2">
                    <FormItem className="flex-1">
                      <FormLabel>Medication</FormLabel>
                      <FormControl>
                        <Input value={createPrescriptionForm.medication} onChange={e => handleCreatePrescriptionChange('medication', e.target.value)} required />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                    <FormItem className="flex-1">
                      <FormLabel>Quantity</FormLabel>
                      <FormControl>
                        <Input type="number" min="1" value={createPrescriptionForm.quantity} onChange={e => handleCreatePrescriptionChange('quantity', e.target.value)} required />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  </div>
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select value={createPrescriptionForm.status} onValueChange={v => handleCreatePrescriptionChange('status', v)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="ready">Ready</SelectItem>
                        <SelectItem value="dispensing">Dispensing</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                  {createPrescriptionError && <div className="text-red-500 text-sm">{createPrescriptionError}</div>}
                  {createPrescriptionSuccess && <div className="text-green-600 text-sm">{createPrescriptionSuccess}</div>}
                  <DialogFooter>
                    <Button type="submit" className="medical-gradient text-white" disabled={createPrescriptionLoading}>
                      {createPrescriptionLoading ? 'Creating...' : 'Create Prescription'}
                    </Button>
                  </DialogFooter>
                </form>
              )}
              {prescriptionsLoading ? (
                <div className="text-center py-8">Loading...</div>
              ) : prescriptionsError ? (
                <div className="text-red-500 text-center py-8">{prescriptionsError}</div>
              ) : filteredPrescriptions.length === 0 ? (
                <div className="text-gray-500 text-center py-8">No prescriptions found.</div>
              ) : (
                <div className="max-h-96 overflow-y-auto space-y-4">
                  {filteredPrescriptions.map((p: any) => (
                    <Card key={p._id || p.id} className="border p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-semibold text-lg">{p.medication}</div>
                          <div className="text-sm text-gray-600">Patient: {p.patient?.user?.name || p.patient?.name || 'Unknown'}</div>
                          <div className="text-sm text-gray-600">Quantity: {p.quantity}</div>
                          <div className="text-sm text-gray-600">Date: {p.date}</div>
                        </div>
                        <Badge variant={p.status === 'completed' ? 'default' : p.status === 'pending' ? 'secondary' : 'outline'}>{p.status}</Badge>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </DialogContent>
          </Dialog>
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
          {/* Upcoming Appointments */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Upcoming Appointments
              </CardTitle>
              <CardDescription>Your upcoming scheduled appointments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {appointments
                  .filter((appointment) => {
                    // Combine date and time to a Date object for comparison
                    const appointmentDateTime = new Date(`${appointment.date}T${appointment.time}`);
                    return appointmentDateTime >= new Date();
                  })
                  .sort((a, b) => {
                    const aDateTime = new Date(`${a.date}T${a.time}`);
                    const bDateTime = new Date(`${b.date}T${b.time}`);
                    return aDateTime.getTime() - bDateTime.getTime();
                  })
                  .map((appointment) => (
                    <div key={appointment.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{appointment.patient.name}</h4>
                        <p className="text-sm text-gray-600">{appointment.type}</p>
                        <div className="flex items-center gap-1 mt-1 text-sm text-gray-500">
                          <Clock className="h-4 w-4" />
                          {appointment.date} {appointment.time}
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
