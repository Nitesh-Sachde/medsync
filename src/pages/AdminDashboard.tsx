
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, Users, Calendar, DollarSign, Activity, Settings, Database, AlertTriangle, TrendingUp, Building } from 'lucide-react';
import { request } from '../lib/api';
import { useAuth } from '../lib/authContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState<any>({});
  const [activities, setActivities] = useState<any[]>([]);
  const [approvals, setApprovals] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [showAddUser, setShowAddUser] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'doctor', contact: '', specialty: '', department: '' });
  const [addUserLoading, setAddUserLoading] = useState(false);
  const [addUserError, setAddUserError] = useState('');
  const [addUserSuccess, setAddUserSuccess] = useState('');

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddUserLoading(true);
    setAddUserError('');
    setAddUserSuccess('');
    try {
      await request('/users', {
        method: 'POST',
        body: JSON.stringify(form),
      });
      setAddUserSuccess('User added successfully!');
      setForm({ name: '', email: '', password: '', role: 'doctor', contact: '', specialty: '', department: '' });
      // Optionally refresh user list here
    } catch (err: any) {
      setAddUserError(err.message);
    } finally {
      setAddUserLoading(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        // Fetch stats
        const patientsRes = await request('/patients');
        const doctorsRes = await request('/doctors');
        const staffRes = await request('/users'); // You may need a /users endpoint for all staff
        const appointmentsRes = await request('/appointments');
        const approvalsRes = await request('/approvals');
        const departmentsRes = await request('/departments');
        const activitiesRes = await request('/activities');
        setStats({
          totalPatients: patientsRes.patients.length,
          totalDoctors: doctorsRes.doctors.length,
          totalStaff: staffRes?.users?.length || 0,
          monthlyRevenue: 0, // Placeholder, implement if you have revenue data
          todayAppointments: appointmentsRes.appointments.filter((a: any) => a.date === new Date().toISOString().slice(0, 10)).length,
          systemUptime: '99.9%', // Placeholder
          activeUsers: staffRes?.users?.length || 0, // Placeholder
          pendingApprovals: approvalsRes.approvals.length
        });
        setActivities(activitiesRes.activities);
        setApprovals(approvalsRes.approvals);
        setDepartments(departmentsRes.departments);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    if (user?.role === 'admin') fetchData();
  }, [user]);

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  // Mock data - replace with API calls
  // const systemStats = {
  //   totalPatients: 1247,
  //   totalDoctors: 12,
  //   totalStaff: 35,
  //   monthlyRevenue: 125000,
  //   todayAppointments: 89,
  //   systemUptime: '99.9%',
  //   activeUsers: 156,
  //   pendingApprovals: 7
  // };

  // const recentActivities = [
  //   { id: 1, type: 'user_registration', message: 'New doctor registered: Dr. John Smith', time: '2 hours ago', priority: 'normal' },
  //   { id: 2, type: 'system_alert', message: 'Database backup completed successfully', time: '4 hours ago', priority: 'low' },
  //   { id: 3, type: 'security', message: 'Failed login attempts detected', time: '6 hours ago', priority: 'high' },
  //   { id: 4, type: 'maintenance', message: 'System maintenance scheduled for tonight', time: '8 hours ago', priority: 'medium' }
  // ];

  // const pendingApprovals = [
  //   { id: 1, type: 'Doctor Registration', name: 'Dr. Sarah Wilson', department: 'Cardiology', date: '2024-01-15' },
  //   { id: 2, type: 'Staff Leave Request', name: 'Nurse Johnson', department: 'Emergency', date: '2024-01-14' },
  //   { id: 3, type: 'Equipment Purchase', name: 'MRI Machine Upgrade', department: 'Radiology', date: '2024-01-13' }
  // ];

  // const departmentStats = [
  //   { name: 'Emergency', patients: 45, staff: 8, utilization: '85%', status: 'high' },
  //   { name: 'Cardiology', patients: 32, staff: 5, utilization: '70%', status: 'normal' },
  //   { name: 'Pediatrics', patients: 28, staff: 6, utilization: '60%', status: 'normal' },
  //   { name: 'Orthopedics', patients: 22, staff: 4, utilization: '55%', status: 'low' }
  // ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600">Hospital Management & Administration</p>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm">
                <Database className="h-4 w-4 mr-2" />
                Backup System
              </Button>
              <Button className="medical-gradient text-white" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                System Settings
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Main Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Patients</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.totalPatients.toLocaleString()}</p>
                  <p className="text-xs text-green-600">+12% from last month</p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
                  <p className="text-2xl font-bold text-green-600">${stats.monthlyRevenue.toLocaleString()}</p>
                  <p className="text-xs text-green-600">+8% from last month</p>
                </div>
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Today's Appointments</p>
                  <p className="text-2xl font-bold text-purple-600">{stats.todayAppointments}</p>
                  <p className="text-xs text-purple-600">Peak at 2-4 PM</p>
                </div>
                <Calendar className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">System Uptime</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.systemUptime}</p>
                  <p className="text-xs text-green-600">Excellent performance</p>
                </div>
                <Activity className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Secondary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active Users</p>
                  <p className="text-lg font-bold">{stats.activeUsers}</p>
                </div>
                <Users className="h-6 w-6 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Doctors</p>
                  <p className="text-lg font-bold">{stats.totalDoctors}</p>
                </div>
                <Shield className="h-6 w-6 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Staff</p>
                  <p className="text-lg font-bold">{stats.totalStaff}</p>
                </div>
                <Building className="h-6 w-6 text-purple-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pending Approvals</p>
                  <p className="text-lg font-bold">{stats.pendingApprovals}</p>
                </div>
                <AlertTriangle className="h-6 w-6 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-8">
          <Button className="h-16 medical-gradient text-white flex flex-col items-center justify-center">
            <Users className="h-5 w-5 mb-1" />
            User Management
          </Button>
          <Button variant="outline" className="h-16 flex flex-col items-center justify-center">
            <Settings className="h-5 w-5 mb-1" />
            System Config
          </Button>
          <Button variant="outline" className="h-16 flex flex-col items-center justify-center">
            <Database className="h-5 w-5 mb-1" />
            Database
          </Button>
          <Button variant="outline" className="h-16 flex flex-col items-center justify-center">
            <TrendingUp className="h-5 w-5 mb-1" />
            Reports
          </Button>
          <Button variant="outline" className="h-16 flex flex-col items-center justify-center">
            <Shield className="h-5 w-5 mb-1" />
            Security
          </Button>
          <Button variant="outline" className="h-16 flex flex-col items-center justify-center">
            <AlertTriangle className="h-5 w-5 mb-1" />
            Alerts
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Pending Approvals */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Pending Approvals
              </CardTitle>
              <CardDescription>Items requiring administrative approval</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {approvals.map((approval) => (
                  <div key={approval.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{approval.type}</h4>
                      <p className="text-sm text-gray-600">{approval.name}</p>
                      <p className="text-sm text-gray-500">{approval.department} - {approval.date}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="text-green-600 border-green-600">
                        Approve
                      </Button>
                      <Button size="sm" variant="outline" className="text-red-600 border-red-600">
                        Reject
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Department Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Department Overview
              </CardTitle>
              <CardDescription>Current status of all departments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {departments.map((dept) => (
                  <div key={dept.name} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{dept.name}</h4>
                      <p className="text-sm text-gray-600">{dept.patients} patients | {dept.staff} staff</p>
                      <p className="text-sm text-gray-500">Utilization: {dept.utilization}</p>
                    </div>
                    <Badge variant={
                      dept.status === 'high' ? 'destructive' :
                      dept.status === 'normal' ? 'default' : 'secondary'
                    }>
                      {dept.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent System Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Recent System Activity
              </CardTitle>
              <CardDescription>Latest system events and notifications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activities.map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">{activity.message}</p>
                      <p className="text-sm text-gray-500">{activity.time}</p>
                    </div>
                    <Badge variant={
                      activity.priority === 'high' ? 'destructive' :
                      activity.priority === 'medium' ? 'default' : 'secondary'
                    }>
                      {activity.priority}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* System Health */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                System Health
              </CardTitle>
              <CardDescription>Current system performance metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <span className="text-sm text-green-900">Database Performance</span>
                  <span className="font-medium text-green-900">Excellent</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                  <span className="text-sm text-blue-900">Server Load</span>
                  <span className="font-medium text-blue-900">45%</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                  <span className="text-sm text-yellow-900">Memory Usage</span>
                  <span className="font-medium text-yellow-900">72%</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                  <span className="text-sm text-purple-900">Active Connections</span>
                  <span className="font-medium text-purple-900">{stats.activeUsers}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <Dialog open={showAddUser} onOpenChange={setShowAddUser}>
        <DialogTrigger asChild>
          <Button className="mb-4">Add User</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader><DialogTitle>Add User</DialogTitle></DialogHeader>
          <form onSubmit={handleAddUser} className="space-y-4">
            <Input placeholder="Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
            <Input placeholder="Email" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
            <Input placeholder="Password" type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
            <Input placeholder="Contact" value={form.contact} onChange={e => setForm({ ...form, contact: e.target.value })} />
            <Select value={form.role} onValueChange={role => setForm({ ...form, role })}>
              <SelectTrigger><SelectValue placeholder="Role" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="doctor">Doctor</SelectItem>
                <SelectItem value="receptionist">Receptionist</SelectItem>
                <SelectItem value="pharmacist">Pharmacist</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
            {form.role === 'doctor' && (
              <>
                <Input placeholder="Specialty" value={form.specialty} onChange={e => setForm({ ...form, specialty: e.target.value })} />
                <Input placeholder="Department" value={form.department} onChange={e => setForm({ ...form, department: e.target.value })} />
              </>
            )}
            {addUserError && <div className="text-red-500 text-sm">{addUserError}</div>}
            {addUserSuccess && <div className="text-green-600 text-sm">{addUserSuccess}</div>}
            <Button type="submit" className="w-full medical-gradient text-white" disabled={addUserLoading}>
              {addUserLoading ? 'Adding...' : 'Add User'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;
