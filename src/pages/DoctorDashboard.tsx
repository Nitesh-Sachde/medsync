import React, { useEffect, useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Users, FileText, Pill, Activity, Phone, Bell, Stethoscope, LogOut, RotateCcw } from 'lucide-react';
import { request } from '../lib/api';
import { useAuth } from '../lib/authContext';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Form, FormItem, FormLabel, FormControl, FormField, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useNavigate } from 'react-router-dom';

const DoctorDashboard = () => {
  // All hooks at the top
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [doctor, setDoctor] = useState<any>(null);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({});
  const [showConsultModal, setShowConsultModal] = useState(false);
  const [showPrescriptionsModal, setShowPrescriptionsModal] = useState(false);
  const [consultForm, setConsultForm] = useState({
    patient: '',
    date: '',
    time: '',
    type: 'Consultation',
    notes: '',
  });
  const [consultStep, setConsultStep] = useState(1);
  const [selectedPendingAppointment, setSelectedPendingAppointment] = useState<any>(null);
  const [newPatientForm, setNewPatientForm] = useState({ name: '', contact: '', email: '' });
  const [consultPatientType, setConsultPatientType] = useState<'pending' | 'existing' | 'new'>('pending');
  const [consultDetails, setConsultDetails] = useState({ diagnosis: '', notes: '', medicines: [{ name: '', dosage: '', duration: '' }] });
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
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [appointmentUpdateLoading, setAppointmentUpdateLoading] = useState(false);
  const [appointmentUpdateError, setAppointmentUpdateError] = useState('');
  const [appointmentUpdateSuccess, setAppointmentUpdateSuccess] = useState('');
  const [appointmentForm, setAppointmentForm] = useState({
    status: '',
    notes: '',
    diagnosis: '',
    treatmentProgress: {
      status: 'not-started',
      progressNotes: '',
      followUpDate: ''
    }
  });
  const [appointmentFilter, setAppointmentFilter] = useState('upcoming');
  const [appointmentSearch, setAppointmentSearch] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [showPatientHistoryModal, setShowPatientHistoryModal] = useState(false);
  const [patientHistory, setPatientHistory] = useState<any[]>([]);
  const [patientHistoryLoading, setPatientHistoryLoading] = useState(false);

  // Add state for multi-step modal
  const [selectedExistingPatient, setSelectedExistingPatient] = useState<any>(null);

  // Add state for consultation details in Step 2
  const [consultLoading, setConsultLoading] = useState(false);
  const [consultError, setConsultError] = useState('');
  const [consultSuccess, setConsultSuccess] = useState('');

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
      const today = new Date().toISOString().slice(0, 10);
      const todayAppointments = apptRes.appointments.filter((a: any) => a.date === today);
      const upcomingAppointments = apptRes.appointments.filter((a: any) => {
        const appointmentDate = new Date(`${a.date}T${a.time}`);
        return appointmentDate >= new Date() && a.status !== 'completed' && a.status !== 'cancelled';
      });
      const completedAppointments = apptRes.appointments.filter((a: any) => a.status === 'completed');
      const cancelledAppointments = apptRes.appointments.filter((a: any) => a.status === 'cancelled');
      setStats({
        todayAppointments: todayAppointments.length,
        pendingReports: 0,
        totalPatients: myPatients.length,
        emergencies: apptRes.appointments.filter((a: any) => a.type === 'Emergency').length,
        // Additional analytics
        upcomingAppointments: upcomingAppointments.length,
        completedAppointments: completedAppointments.length,
        cancelledAppointments: cancelledAppointments.length,
        appointmentCompletionRate: apptRes.appointments.length > 0 ? 
          Math.round((completedAppointments.length / apptRes.appointments.length) * 100) : 0,
        totalAppointments: apptRes.appointments.length
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // All useMemo, useCallback, useRef, useEffect hooks here
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

  const filteredAppointments = useMemo(() => {
    let filtered = appointments;
    if (appointmentFilter === 'upcoming') {
      filtered = filtered.filter(apt => {
        const appointmentDate = new Date(`${apt.date}T${apt.time}`);
        return appointmentDate >= new Date() && apt.status !== 'completed' && apt.status !== 'cancelled';
      });
    } else if (appointmentFilter === 'completed') {
      filtered = filtered.filter(apt => apt.status === 'completed');
    } else if (appointmentFilter === 'today') {
      const today = new Date().toISOString().slice(0, 10);
      filtered = filtered.filter(apt => apt.date === today);
    }
    if (appointmentSearch) {
      filtered = filtered.filter(apt => {
        const patientName = apt.patient?.user?.name || '';
        const appointmentType = apt.type || '';
        const searchTerm = appointmentSearch.toLowerCase();
        return (
          patientName.toLowerCase().includes(searchTerm) ||
          appointmentType.toLowerCase().includes(searchTerm)
        );
      });
    }
    return filtered.sort((a, b) => {
      const aDateTime = new Date(`${a.date}T${a.time}`);
      const bDateTime = new Date(`${b.date}T${b.time}`);
      return aDateTime.getTime() - bDateTime.getTime();
    });
  }, [appointments, appointmentFilter, appointmentSearch]);

  useEffect(() => {
    if (user?.role === 'doctor') refreshAppointments();
  }, [user]);

  useEffect(() => {
    if (!showPrescriptionsModal || !doctor) return;
    const fetchPrescriptions = async () => {
      setPrescriptionsLoading(true);
      setPrescriptionsError('');
      try {
        const res = await request('/prescriptions');
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

  // Place loading and error returns AFTER all hooks
  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading doctor dashboard...</p>
      </div>
    </div>
  );
  if (error) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="text-red-500 text-lg mb-4">Error loading dashboard</div>
        <p className="text-gray-600 mb-4">{error}</p>
        <Button onClick={refreshAppointments} variant="outline">
          Try Again
        </Button>
      </div>
    </div>
  );

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

  // Handle appointment update
  const handleAppointmentUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setAppointmentUpdateLoading(true);
    setAppointmentUpdateError('');
    setAppointmentUpdateSuccess('');
    
    try {
      const response = await request(`/appointments/doctor/${selectedAppointment._id}`, {
        method: 'PUT',
        body: JSON.stringify(appointmentForm)
      });
      
      setAppointmentUpdateSuccess('Appointment updated successfully!');
      setShowAppointmentModal(false);
      
      // Update the appointment in local state
      setAppointments(appointments.map(apt => 
        apt._id === selectedAppointment._id ? response.appointment : apt
      ));
      
      // Reset form
      setAppointmentForm({
        status: '',
        notes: '',
        diagnosis: '',
        treatmentProgress: {
          status: 'not-started',
          progressNotes: '',
          followUpDate: ''
        }
      });
      
    } catch (err: any) {
      setAppointmentUpdateError(err.message || 'Failed to update appointment');
    } finally {
      setAppointmentUpdateLoading(false);
    }
  };

  // Handle appointment selection
  const handleAppointmentSelect = (appointment: any) => {
    setSelectedAppointment(appointment);
    setAppointmentForm({
      status: appointment.status || '',
      notes: appointment.notes || '',
      diagnosis: appointment.diagnosis || '',
      treatmentProgress: {
        status: appointment.treatmentProgress?.status || 'not-started',
        progressNotes: appointment.treatmentProgress?.progressNotes || '',
        followUpDate: appointment.treatmentProgress?.followUpDate || ''
      }
    });
    setShowAppointmentModal(true);
  };

  // Handle patient history view
  const handlePatientHistoryView = async (patient: any) => {
    setSelectedPatient(patient);
    setShowPatientHistoryModal(true);
    setPatientHistoryLoading(true);
    
    try {
      const response = await request(`/appointments/patient/${patient._id}/history`);
      setPatientHistory(response.appointments);
    } catch (err: any) {
      console.error('Failed to fetch patient history:', err);
      setPatientHistory([]);
    } finally {
      setPatientHistoryLoading(false);
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

  // Fetch patient history
  const fetchPatientHistory = async (patientId: string) => {
    setPatientHistoryLoading(true);
    setPatientHistory([]);
    try {
      const res = await request(`/patients/${patientId}/history`);
      setPatientHistory(res.history);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch patient history.');
    } finally {
      setPatientHistoryLoading(false);
    }
  };

  // Helper to update medicines array
  const handleMedicineChange = (idx: number, field: string, value: string) => {
    setConsultDetails(prev => {
      const meds = [...prev.medicines];
      meds[idx] = { ...meds[idx], [field]: value };
      return { ...prev, medicines: meds };
    });
  };
  const addMedicine = () => setConsultDetails(prev => ({ ...prev, medicines: [...prev.medicines, { name: '', dosage: '', duration: '' }] }));
  const removeMedicine = (idx: number) => setConsultDetails(prev => ({ ...prev, medicines: prev.medicines.filter((_, i) => i !== idx) }));

  // The rest of the component logic and JSX
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
              <Button variant="outline" size="sm" onClick={refreshAppointments}>
                <RotateCcw className="h-4 w-4 mr-2 text-blue-600" />
                Refresh
              </Button>
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
        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Today's Appointments</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.todayAppointments || 0}</p>
                </div>
                <Calendar className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Upcoming</p>
                  <p className="text-2xl font-bold text-purple-600">{stats.upcomingAppointments || 0}</p>
                </div>
                <Clock className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-green-600">{stats.completedAppointments || 0}</p>
                </div>
                <Activity className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Patients</p>
                  <p className="text-2xl font-bold text-indigo-600">{stats.totalPatients || 0}</p>
                </div>
                <Users className="h-8 w-8 text-indigo-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Completion Rate</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.appointmentCompletionRate || 0}%</p>
                </div>
                <FileText className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <Button 
            variant={appointmentFilter === 'today' ? 'default' : 'outline'}
            className={`h-16 flex flex-col items-center justify-center ${appointmentFilter === 'today' ? 'medical-gradient text-white' : ''}`}
            onClick={() => setAppointmentFilter('today')}
          >
            <Clock className="h-5 w-5 mb-1" />
            Today's Schedule
          </Button>
          <Dialog open={showConsultModal} onOpenChange={setShowConsultModal}>
            <DialogTrigger asChild>
              <Button
                className={`h-16 medical-gradient text-white flex flex-col items-center justify-center ${showConsultModal ? 'ring-2 ring-blue-400' : ''}`}
                onClick={() => setShowConsultModal(true)}
              >
                <Stethoscope className="h-5 w-5 mb-1" />
                New Consultation
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-full md:max-w-2xl w-full p-4 md:p-8 overflow-y-auto max-h-[90vh]">
              <DialogHeader>
                <DialogTitle>New Consultation</DialogTitle>
              </DialogHeader>
              {consultStep === 1 && (
                <div className="space-y-6">
                  <div className="flex flex-col md:flex-row gap-4 mb-4">
                    <button className={`px-4 py-2 rounded ${consultPatientType === 'pending' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`} onClick={() => setConsultPatientType('pending')}>Select Pending Appointment</button>
                    <button className={`px-4 py-2 rounded ${consultPatientType === 'existing' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`} onClick={() => setConsultPatientType('existing')}>Select Existing Patient</button>
                    <button className={`px-4 py-2 rounded ${consultPatientType === 'new' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`} onClick={() => setConsultPatientType('new')}>Create New Patient</button>
                  </div>
                  {consultPatientType === 'pending' && (
                    <div>
                      <label className="block font-semibold mb-2">Pending Appointments</label>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {appointments.filter(a => a.status === 'pending').length === 0 && <div className="text-gray-500">No pending appointments.</div>}
                        {appointments.filter(a => a.status === 'pending').map(a => (
                          <div key={a._id} className={`p-3 rounded border flex items-center justify-between ${selectedPendingAppointment?._id === a._id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}> 
                            <div>
                              <div className="font-medium">{a.patient?.user?.name || a.patient?.name || 'Unknown'}</div>
                              <div className="text-sm text-gray-500">{a.date} {a.time}</div>
                            </div>
                            <button className="px-3 py-1 rounded bg-blue-500 text-white" onClick={() => setSelectedPendingAppointment(a)}>Select</button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {consultPatientType === 'existing' && (
                    <div>
                      <label className="block font-semibold mb-2">Search Patient</label>
                      <input type="text" className="w-full rounded border px-3 py-2 mb-2" placeholder="Search by name or email..." onChange={e => {
                        const val = e.target.value.toLowerCase();
                        setSelectedExistingPatient(patients.find(p => (p.name || p.user?.name || '').toLowerCase().includes(val) || (p.user?.email || '').toLowerCase().includes(val)) || null);
                      }} />
                      {selectedExistingPatient && (
                        <div className="p-3 rounded border border-blue-500 bg-blue-50 mt-2">
                          <div className="font-medium">{selectedExistingPatient.name || selectedExistingPatient.user?.name}</div>
                          <div className="text-sm text-gray-500">{selectedExistingPatient.user?.email}</div>
                        </div>
                      )}
                    </div>
                  )}
                  {consultPatientType === 'new' && (
                    <div className="space-y-2">
                      <label className="block font-semibold mb-2">New Patient Details</label>
                      <input type="text" className="w-full rounded border px-3 py-2" placeholder="Name" value={newPatientForm.name} onChange={e => setNewPatientForm(f => ({ ...f, name: e.target.value }))} />
                      <input type="email" className="w-full rounded border px-3 py-2" placeholder="Email" value={newPatientForm.email} onChange={e => setNewPatientForm(f => ({ ...f, email: e.target.value }))} />
                      <input type="text" className="w-full rounded border px-3 py-2" placeholder="Contact" value={newPatientForm.contact} onChange={e => setNewPatientForm(f => ({ ...f, contact: e.target.value }))} />
                    </div>
                  )}
                  <div className="flex justify-end gap-2 mt-6">
                    <button className="px-4 py-2 rounded bg-gray-200" onClick={() => setShowConsultModal(false)}>Cancel</button>
                    <button className="px-4 py-2 rounded bg-blue-600 text-white" onClick={() => setConsultStep(2)} disabled={
                      (consultPatientType === 'pending' && !selectedPendingAppointment) ||
                      (consultPatientType === 'existing' && !selectedExistingPatient) ||
                      (consultPatientType === 'new' && (!newPatientForm.name || !newPatientForm.email || !newPatientForm.contact))
                    }>Next</button>
                  </div>
                </div>
              )}
              {consultStep === 2 && (
                <div>
                  <form
                    className="space-y-4"
                    onSubmit={async e => {
                      e.preventDefault();
                      setConsultLoading(true);
                      setConsultError('');
                      setConsultSuccess('');
                      try {
                        let patientId = '';
                        // Create new patient if needed
                        if (consultPatientType === 'new') {
                          const res = await request('/patients', {
                            method: 'POST',
                            body: JSON.stringify(newPatientForm)
                          });
                          patientId = res.patient._id || res.patient.id;
                        } else if (consultPatientType === 'pending') {
                          patientId = selectedPendingAppointment.patient._id || selectedPendingAppointment.patient.id;
                        } else if (consultPatientType === 'existing') {
                          patientId = selectedExistingPatient._id || selectedExistingPatient.id;
                        }
                        // Create appointment
                        let appointmentId = '';
                        let appointmentDate = '';
                        let appointmentTime = '';
                        if (consultPatientType === 'pending') {
                          appointmentId = selectedPendingAppointment._id;
                          appointmentDate = selectedPendingAppointment.date;
                          appointmentTime = selectedPendingAppointment.time;
                        } else {
                          const apptRes = await request('/appointments', {
                            method: 'POST',
                            body: JSON.stringify({
                              patient: patientId,
                              doctor: doctor._id || doctor.id,
                              hospitalId: doctor.user?.hospitalId,
                              date: new Date().toISOString().slice(0, 10),
                              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                              status: 'confirmed',
                              type: 'Consultation',
                              notes: consultDetails.notes
                            })
                          });
                          appointmentId = apptRes.appointment._id || apptRes.appointment.id;
                          appointmentDate = apptRes.appointment.date;
                          appointmentTime = apptRes.appointment.time;
                        }
                        // Create prescription
                        await request('/prescriptions', {
                          method: 'POST',
                          body: JSON.stringify({
                            patient: patientId,
                            doctor: doctor._id || doctor.id,
                            hospitalId: doctor.user?.hospitalId,
                            medication: consultDetails.medicines.map(m => `${m.name} (${m.dosage}, ${m.duration})`).join(', '),
                            quantity: consultDetails.medicines.length,
                            date: appointmentDate,
                            status: 'active'
                          })
                        });
                        setConsultSuccess('Consultation and prescription created successfully!');
                        setShowConsultModal(false);
                        setConsultStep(1);
                        setConsultDetails({ diagnosis: '', notes: '', medicines: [{ name: '', dosage: '', duration: '' }] });
                        setNewPatientForm({ name: '', contact: '', email: '' });
                        setSelectedPendingAppointment(null);
                        setSelectedExistingPatient(null);
                        await refreshAppointments();
                      } catch (err: any) {
                        setConsultError(err.message || 'Failed to create consultation.');
                      } finally {
                        setConsultLoading(false);
                      }
                    }}
                  >
                    <div className="mb-4 w-full">
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Diagnosis</label>
                      <textarea
                        className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                        value={consultDetails.diagnosis}
                        onChange={e => setConsultDetails(prev => ({ ...prev, diagnosis: e.target.value }))}
                        placeholder="Enter diagnosis..."
                        rows={2}
                      />
                    </div>
                    <div className="mb-4 w-full">
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Medicines</label>
                      <div className="space-y-2">
                        {consultDetails.medicines.map((med, idx) => (
                          <div key={idx} className="flex flex-col md:flex-row gap-2 items-center">
                            <input
                              className="w-full md:w-1/3 rounded-md border border-gray-300 px-3 py-2"
                              placeholder="Medicine Name"
                              value={med.name}
                              onChange={e => handleMedicineChange(idx, 'name', e.target.value)}
                            />
                            <input
                              className="w-full md:w-1/3 rounded-md border border-gray-300 px-3 py-2"
                              placeholder="Dosage"
                              value={med.dosage}
                              onChange={e => handleMedicineChange(idx, 'dosage', e.target.value)}
                            />
                            <input
                              className="w-full md:w-1/3 rounded-md border border-gray-300 px-3 py-2"
                              placeholder="Duration"
                              value={med.duration}
                              onChange={e => handleMedicineChange(idx, 'duration', e.target.value)}
                            />
                            {consultDetails.medicines.length > 1 && (
                              <button type="button" className="text-red-500 ml-2" onClick={() => removeMedicine(idx)}>Remove</button>
                            )}
                          </div>
                        ))}
                        <button type="button" className="mt-2 px-3 py-1 rounded bg-green-500 text-white" onClick={addMedicine}>Add Medicine</button>
                      </div>
                    </div>
                    <div className="mb-4 w-full">
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Notes</label>
                      <textarea
                        className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                        value={consultDetails.notes}
                        onChange={e => setConsultDetails(prev => ({ ...prev, notes: e.target.value }))}
                        placeholder="Enter notes..."
                        rows={2}
                      />
                    </div>
                    {consultError && <div className="text-red-500 text-sm mb-2">{consultError}</div>}
                    {consultSuccess && <div className="text-green-600 text-sm mb-2">{consultSuccess}</div>}
                    <div className="flex justify-between mt-6">
                      <button type="button" className="px-4 py-2 rounded bg-gray-200" onClick={() => setConsultStep(1)}>Back</button>
                      <button type="submit" className="px-4 py-2 rounded bg-blue-600 text-white" disabled={consultLoading}>{consultLoading ? 'Creating...' : 'Submit'}</button>
                    </div>
                  </form>
                </div>
              )}
            </DialogContent>
          </Dialog>
          <Dialog open={showPrescriptionsModal} onOpenChange={setShowPrescriptionsModal}>
            <DialogTrigger asChild>
              <Button
                variant={showPrescriptionsModal ? 'default' : 'outline'}
                className={`h-16 flex flex-col items-center justify-center ${showPrescriptionsModal ? 'medical-gradient text-white' : ''}`}
                onClick={() => setShowPrescriptionsModal(true)}
              >
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
                Appointments Management
              </CardTitle>
              <CardDescription>Manage your appointments</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Filters and Search */}
              <div className="mb-4 space-y-3">
                <div className="flex gap-2">
                  <Select value={appointmentFilter} onValueChange={setAppointmentFilter}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Filter appointments" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="upcoming">Upcoming</SelectItem>
                      <SelectItem value="today">Today</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="all">All</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    placeholder="Search by patient name or type..."
                    value={appointmentSearch}
                    onChange={(e) => setAppointmentSearch(e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>
              
              {/* Appointments List */}
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {filteredAppointments.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No appointments found
                  </div>
                ) : (
                  filteredAppointments.map((appointment) => (
                    <div key={appointment._id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                      <div className="flex-1">
                        <h4 className="font-medium">
                          {appointment.patient?.user?.name || 'Unknown Patient'}
                        </h4>
                        <p className="text-sm text-gray-600">{appointment.type}</p>
                        <div className="flex items-center gap-1 mt-1 text-sm text-gray-500">
                          <Clock className="h-4 w-4" />
                          {appointment.date} at {appointment.time}
                        </div>
                        {appointment.notes && (
                          <p className="text-sm text-gray-600 mt-1">
                            Notes: {appointment.notes}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant={
                            appointment.status === 'completed' ? 'default' :
                            appointment.status === 'in-progress' ? 'secondary' :
                            appointment.status === 'cancelled' ? 'destructive' : 
                            'outline'
                          }
                        >
                          {appointment.status}
                        </Badge>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleAppointmentSelect(appointment)}
                          disabled={appointmentUpdateLoading}
                        >
                          View/Edit
                        </Button>
                      </div>
                    </div>
                  ))
                )}
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
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {patients.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No patients found
                  </div>
                ) : (
                  patients.map((patient) => (
                    <div key={patient._id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                      <div className="flex-1">
                        <h4 className="font-medium">{patient.user?.name || patient.name || 'Unknown Patient'}</h4>
                        <p className="text-sm text-gray-600">{patient.user?.contact || 'No contact info'}</p>
                        <p className="text-sm text-gray-500">
                          Health Summary: {patient.healthSummary || 'No health summary available'}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handlePatientHistoryView(patient)}
                        >
                          View History
                        </Button>
                      </div>
                    </div>
                  ))
                )}
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
      
      {/* Appointment Management Modal */}
      <Dialog open={showAppointmentModal} onOpenChange={setShowAppointmentModal}>
        <DialogContent className="max-w-full md:max-w-2xl w-full p-4 md:p-8 overflow-y-auto max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Manage Appointment</DialogTitle>
          </DialogHeader>
          {selectedAppointment && (
            <div className="space-y-4">
              {/* Patient Information */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium mb-2">Patient Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Name: </span>
                    {selectedAppointment.patient?.user?.name || 'Unknown'}
                  </div>
                  <div>
                    <span className="font-medium">Contact: </span>
                    {selectedAppointment.patient?.user?.contact || 'N/A'}
                  </div>
                  <div>
                    <span className="font-medium">Date: </span>
                    {selectedAppointment.date}
                  </div>
                  <div>
                    <span className="font-medium">Time: </span>
                    {selectedAppointment.time}
                  </div>
                </div>
              </div>
              
              {/* Update Form */}
              <form onSubmit={handleAppointmentUpdate} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                  <div className="mb-4 w-full">
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Status</label>
                    <select value={appointmentForm.status} onChange={e => setAppointmentForm({ ...appointmentForm, status: e.target.value })} className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900">
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="checked-in">Checked In</option>
                      <option value="in-progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                      <option value="no-show">No Show</option>
                    </select>
                  </div>
                  
                  <div className="mb-4 w-full">
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Treatment Progress</label>
                    <select value={appointmentForm.treatmentProgress.status} onChange={e => setAppointmentForm({
                      ...appointmentForm, 
                      treatmentProgress: {...appointmentForm.treatmentProgress, status: e.target.value}
                    })} className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900">
                      <option value="not-started">Not Started</option>
                      <option value="in-progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="follow-up-required">Follow-up Required</option>
                    </select>
                  </div>
                </div>
                
                <div className="mb-4 w-full">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Diagnosis</label>
                  <textarea 
                    value={appointmentForm.diagnosis} 
                    onChange={(e) => setAppointmentForm({...appointmentForm, diagnosis: e.target.value})}
                    placeholder="Enter diagnosis..."
                    rows={3}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                  />
                </div>
                
                <div className="mb-4 w-full">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Doctor Notes</label>
                  <textarea 
                    value={appointmentForm.notes} 
                    onChange={(e) => setAppointmentForm({...appointmentForm, notes: e.target.value})}
                    placeholder="Enter notes..."
                    rows={3}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                  />
                </div>
                
                <div className="mb-4 w-full">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Progress Notes</label>
                  <textarea 
                    value={appointmentForm.treatmentProgress.progressNotes} 
                    onChange={(e) => setAppointmentForm({
                      ...appointmentForm, 
                      treatmentProgress: {...appointmentForm.treatmentProgress, progressNotes: e.target.value}
                    })}
                    placeholder="Enter progress notes..."
                    rows={3}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                  />
                </div>
                
                <div className="mb-4 w-full">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Follow-up Date</label>
                  <input 
                    type="date" 
                    value={appointmentForm.treatmentProgress.followUpDate} 
                    onChange={(e) => setAppointmentForm({
                      ...appointmentForm, 
                      treatmentProgress: {...appointmentForm.treatmentProgress, followUpDate: e.target.value}
                    })}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                  />
                </div>
                
                {appointmentUpdateError && (
                  <div className="text-red-500 text-sm">{appointmentUpdateError}</div>
                )}
                
                {appointmentUpdateSuccess && (
                  <div className="text-green-600 text-sm">{appointmentUpdateSuccess}</div>
                )}
                
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setShowAppointmentModal(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="medical-gradient text-white" disabled={appointmentUpdateLoading}>
                    {appointmentUpdateLoading ? 'Updating...' : 'Update Appointment'}
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={async () => {
                      setAppointmentUpdateLoading(true);
                      setAppointmentUpdateError('');
                      try {
                        await request(`/appointments/doctor/${selectedAppointment._id}`, {
                          method: 'PUT',
                          body: JSON.stringify({ ...appointmentForm, status: 'cancelled' })
                        });
                        setShowAppointmentModal(false);
                        await refreshAppointments();
                      } catch (err: any) {
                        setAppointmentUpdateError(err.message || 'Failed to cancel appointment');
                      } finally {
                        setAppointmentUpdateLoading(false);
                      }
                    }}
                  >
                    Cancel Appointment
                  </Button>
                </DialogFooter>
              </form>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Patient History Modal */}
      <Dialog open={showPatientHistoryModal} onOpenChange={setShowPatientHistoryModal}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Patient History - {selectedPatient?.user?.name || 'Unknown Patient'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Patient Info */}
            {selectedPatient && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium mb-2">Patient Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Name: </span>
                    {selectedPatient.user?.name || 'Unknown'}
                  </div>
                  <div>
                    <span className="font-medium">Contact: </span>
                    {selectedPatient.user?.contact || 'N/A'}
                  </div>
                  <div>
                    <span className="font-medium">Email: </span>
                    {selectedPatient.user?.email || 'N/A'}
                  </div>
                  <div>
                    <span className="font-medium">Health Summary: </span>
                    {selectedPatient.healthSummary || 'N/A'}
                  </div>
                </div>
              </div>
            )}
            
            {/* Appointment History */}
            <div>
              <h3 className="font-medium mb-4">Appointment History</h3>
              {patientHistoryLoading ? (
                <div className="text-center py-8">Loading history...</div>
              ) : patientHistory.length === 0 ? (
                <div className="text-center py-8 text-gray-500">No appointment history found</div>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {patientHistory.map((appointment) => (
                    <div key={appointment._id} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant={
                              appointment.status === 'completed' ? 'default' :
                              appointment.status === 'in-progress' ? 'secondary' :
                              appointment.status === 'cancelled' ? 'destructive' : 'outline'
                            }>
                              {appointment.status}
                            </Badge>
                            <span className="text-sm text-gray-600">{appointment.type}</span>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-500 mb-2">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {appointment.date}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {appointment.time}
                            </span>
                          </div>
                          {appointment.diagnosis && (
                            <div className="mt-2">
                              <span className="font-medium text-sm">Diagnosis: </span>
                              <span className="text-sm">{appointment.diagnosis}</span>
                            </div>
                          )}
                          {appointment.notes && (
                            <div className="mt-2">
                              <span className="font-medium text-sm">Notes: </span>
                              <span className="text-sm">{appointment.notes}</span>
                            </div>
                          )}
                          {appointment.treatmentProgress?.progressNotes && (
                            <div className="mt-2">
                              <span className="font-medium text-sm">Treatment Progress: </span>
                              <span className="text-sm">{appointment.treatmentProgress.progressNotes}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DoctorDashboard;
