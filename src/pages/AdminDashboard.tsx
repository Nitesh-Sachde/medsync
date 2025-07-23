
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, Users, Calendar, DollarSign, Activity, Settings, Database, AlertTriangle, TrendingUp, Building, Bot } from 'lucide-react';
import { request } from '../lib/api';
import { useAuth } from '../lib/authContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { useNavigate } from 'react-router-dom';
import AIChatModal from '../components/AIChatModal';
import { logout } from '../lib/api';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
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
  const [activeSection, setActiveSection] = useState('user-management');
  const [showEditUser, setShowEditUser] = useState(false);
  const [editUser, setEditUser] = useState<any>(null);
  const [editUserLoading, setEditUserLoading] = useState(false);
  const [editUserError, setEditUserError] = useState('');
  const [editUserSuccess, setEditUserSuccess] = useState('');
  const [users, setUsers] = useState<any[]>([]);
  const [showDeleteUser, setShowDeleteUser] = useState(false);
  const [deleteUser, setDeleteUser] = useState<any>(null);
  const [deleteUserLoading, setDeleteUserLoading] = useState(false);
  const [deleteUserError, setDeleteUserError] = useState('');
  const [deleteUserSuccess, setDeleteUserSuccess] = useState('');

  const navigate = useNavigate();

  // Fetch users separately for easier refresh
  const fetchUsers = async () => {
    try {
      const staffRes = await request('/users');
      const hospitalId = user?.hospitalId;
      setUsers((staffRes.users || []).filter((u: any) => u.hospitalId === hospitalId));
    } catch (err) {
      setUsers([]);
    }
  };

  // Main dashboard data fetcher
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
      // Filter everything by hospitalId
      const hospitalId = user?.hospitalId;
      const filteredPatients = patientsRes.patients.filter((p: any) => p.user?.hospitalId === hospitalId);
      const filteredDoctors = doctorsRes.doctors.filter((d: any) => d.user?.hospitalId === hospitalId);
      const filteredStaff = staffRes?.users?.filter((u: any) => u.hospitalId === hospitalId) || [];
      const filteredAppointments = appointmentsRes.appointments.filter((a: any) => a.hospitalId === hospitalId);
      const filteredApprovals = approvalsRes.approvals.filter((a: any) => a.hospitalId === hospitalId);
      const filteredDepartments = departmentsRes.departments.filter((d: any) => d.hospitalId === hospitalId);
      const filteredActivities = activitiesRes.activities.filter((a: any) => a.hospitalId === hospitalId);
      setStats({
        totalPatients: filteredPatients.length,
        totalDoctors: filteredDoctors.length,
        totalStaff: filteredStaff.length,
        monthlyRevenue: 0, // Placeholder, implement if you have revenue data
        todayAppointments: filteredAppointments.filter((a: any) => a.date === new Date().toISOString().slice(0, 10)).length,
        systemUptime: '99.9%', // Placeholder
        activeUsers: filteredStaff.length, // Placeholder
        pendingApprovals: filteredApprovals.length
      });
      setActivities(filteredActivities);
      setApprovals(filteredApprovals);
      setDepartments(filteredDepartments);
      setUsers(filteredStaff);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'admin') fetchData();
  }, [user]);

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
      setShowAddUser(false); // Close modal
      fetchData(); // Refresh everything
    } catch (err: any) {
      setAddUserError(err.message);
    } finally {
      setAddUserLoading(false);
    }
  };

  const handleEditUser = (user: any) => {
    setEditUser(user);
    setShowEditUser(true);
    setEditUserError('');
    setEditUserSuccess('');
  };

  const handleEditUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditUserLoading(true);
    setEditUserError('');
    setEditUserSuccess('');
    try {
      await request(`/users/${editUser._id}`, {
        method: 'PUT',
        body: JSON.stringify({
          name: editUser.name,
          email: editUser.email,
          role: editUser.role,
          contact: editUser.contact,
        }),
      });
      setEditUserSuccess('User updated successfully!');
      setShowEditUser(false);
      fetchData(); // Refresh everything
    } catch (err: any) {
      setEditUserError(err.message);
    } finally {
      setEditUserLoading(false);
    }
  };

  const handleDeleteUser = (user: any) => {
    setDeleteUser(user);
    setShowDeleteUser(true);
    setDeleteUserError('');
    setDeleteUserSuccess('');
  };

  const handleDeleteUserConfirm = async () => {
    setDeleteUserLoading(true);
    setDeleteUserError('');
    setDeleteUserSuccess('');
    try {
      await request(`/users/${deleteUser._id}`, { method: 'DELETE' });
      setDeleteUserSuccess('User deleted successfully!');
      setShowDeleteUser(false);
      fetchData(); // Refresh everything
    } catch (err: any) {
      setDeleteUserError(err.message);
    } finally {
      setDeleteUserLoading(false);
    }
  };

  const handleToggleActive = async (user: any) => {
    try {
      await request(`/users/${user._id}/toggle-active`, { method: 'PATCH' });
      fetchData();
    } catch (err) {
      // Optionally show error
    }
  };

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
              <AIChatModal title="AI Administrative Assistant - Hospital Management">
                <Button variant="outline" className="flex items-center space-x-2 hover:bg-purple-50 border-purple-200 hover:border-purple-300">
                  <Bot className="h-4 w-4 text-purple-600" />
                  <span>AI Assistant</span>
                </Button>
              </AIChatModal>
              <Button
                className="bg-red-500 hover:bg-red-600 text-white font-semibold px-4 py-2 rounded"
                onClick={() => {
                  logout();
                  setTimeout(() => navigate('/'), 100);
                }}
              >
                Logout
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
                  <p className="text-2xl font-bold text-blue-600">{stats.totalPatients?.toLocaleString?.() ?? 0}</p>
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
                  <p className="text-2xl font-bold text-green-600">${stats.monthlyRevenue?.toLocaleString?.() ?? 0}</p>
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
                  <p className="text-2xl font-bold text-purple-600">{stats.todayAppointments ?? 0}</p>
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
                  <p className="text-2xl font-bold text-orange-600">{stats.systemUptime ?? '99.9%'}</p>
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
                  <p className="text-lg font-bold">{stats.activeUsers ?? 0}</p>
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
                  <p className="text-lg font-bold">{stats.totalDoctors ?? 0}</p>
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
                  <p className="text-lg font-bold">{stats.totalStaff ?? 0}</p>
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
                  <p className="text-lg font-bold">{stats.pendingApprovals ?? 0}</p>
                </div>
                <AlertTriangle className="h-6 w-6 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions as Section Tabs */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-8">
          <Button className={`h-16 flex flex-col items-center justify-center ${activeSection === 'user-management' ? 'medical-gradient text-white' : 'bg-white border text-gray-800'}`} onClick={() => setActiveSection('user-management')}>
            <Users className="h-5 w-5 mb-1" />
            User Management
          </Button>
          <Button className={`h-16 flex flex-col items-center justify-center ${activeSection === 'system-config' ? 'medical-gradient text-white' : 'bg-white border text-gray-800'}`} onClick={() => setActiveSection('system-config')}>
            <Settings className="h-5 w-5 mb-1" />
            System Config
          </Button>
          <Button className={`h-16 flex flex-col items-center justify-center ${activeSection === 'database' ? 'medical-gradient text-white' : 'bg-white border text-gray-800'}`} onClick={() => setActiveSection('database')}>
            <Database className="h-5 w-5 mb-1" />
            Database
          </Button>
          <Button className={`h-16 flex flex-col items-center justify-center ${activeSection === 'reports' ? 'medical-gradient text-white' : 'bg-white border text-gray-800'}`} onClick={() => setActiveSection('reports')}>
            <TrendingUp className="h-5 w-5 mb-1" />
            Reports
          </Button>
          <Button className={`h-16 flex flex-col items-center justify-center ${activeSection === 'security' ? 'medical-gradient text-white' : 'bg-white border text-gray-800'}`} onClick={() => setActiveSection('security')}>
            <Shield className="h-5 w-5 mb-1" />
            Security
          </Button>
          <Button className={`h-16 flex flex-col items-center justify-center ${activeSection === 'alerts' ? 'medical-gradient text-white' : 'bg-white border text-gray-800'}`} onClick={() => setActiveSection('alerts')}>
            <AlertTriangle className="h-5 w-5 mb-1" />
            Alerts
          </Button>
        </div>

        {/* Section Content Below Cards */}
        {activeSection === 'user-management' && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Users</h2>
              <Button className="medical-gradient text-white" onClick={() => setShowAddUser(true)}>
                Add User
              </Button>
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user: any) => (
                    <TableRow key={user._id}>
                      <TableCell>{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.role.charAt(0).toUpperCase() + user.role.slice(1)}</TableCell>
                      <TableCell>{user.contact || '-'}</TableCell>
                      <TableCell>
                        <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${user.active ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-600'}`}>{user.active ? 'Active' : 'Inactive'}</span>
                        <Switch checked={user.active} onCheckedChange={() => handleToggleActive(user)} className="ml-2 align-middle" />
                      </TableCell>
                      <TableCell>
                        <Button size="sm" variant="ghost" className="mr-2 text-blue-600 border border-gray-300 hover:bg-blue-100 hover:text-blue-800 transition-colors" onClick={() => handleEditUser(user)}>Edit</Button>
                        <Button size="sm" variant="ghost" className="mr-2 text-red-600 border border-gray-300 hover:bg-red-100 hover:text-red-800 transition-colors" onClick={() => handleDeleteUser(user)}>Delete</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            {/* Add User Dialog (reuse your existing code, but remove floating button) */}
            <Dialog open={showAddUser} onOpenChange={setShowAddUser}>
              <DialogContent>
                <DialogHeader><DialogTitle>Add User</DialogTitle></DialogHeader>
                <form onSubmit={handleAddUser} className="space-y-4">
                  <Input placeholder="Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
                  <Input placeholder="Email" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
                  <Input placeholder="Contact" value={form.contact} onChange={e => setForm({ ...form, contact: e.target.value })} />
                  <Select value={form.role} onValueChange={role => setForm({ ...form, role })}>
                    <SelectTrigger><SelectValue placeholder="Role" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="doctor">Doctor</SelectItem>
                      <SelectItem value="receptionist">Receptionist</SelectItem>
                      <SelectItem value="pharmacist">Pharmacist</SelectItem>
                    </SelectContent>
                  </Select>
                  {form.role === 'doctor' && (
                    <>
                      <Input placeholder="Specialty" value={form.specialty} onChange={e => setForm({ ...form, specialty: e.target.value })} />
                      <Input placeholder="Department" value={form.department} onChange={e => setForm({ ...form, department: e.target.value })} />
                    </>
                  )}
                  <div className="text-sm text-gray-600">A password will be auto-generated and sent to the user's email. They must change it before first use.</div>
                  {addUserError && <div className="text-red-500 text-sm">{addUserError}</div>}
                  {addUserSuccess && <div className="text-green-600 text-sm">{addUserSuccess}</div>}
                  <Button type="submit" className="w-full medical-gradient text-white" disabled={addUserLoading}>
                    {addUserLoading ? 'Adding...' : 'Add User'}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
            {/* Edit User Dialog */}
            <Dialog open={showEditUser} onOpenChange={setShowEditUser}>
              <DialogContent>
                <DialogHeader><DialogTitle>Edit User</DialogTitle></DialogHeader>
                {editUser && (
                  <form onSubmit={handleEditUserSubmit} className="space-y-4">
                    <Input placeholder="Name" value={editUser.name} onChange={e => setEditUser({ ...editUser, name: e.target.value })} required />
                    <Input placeholder="Email" type="email" value={editUser.email} onChange={e => setEditUser({ ...editUser, email: e.target.value })} required />
                    <Input placeholder="Contact" value={editUser.contact} onChange={e => setEditUser({ ...editUser, contact: e.target.value })} />
                    <Select value={editUser.role} onValueChange={role => setEditUser({ ...editUser, role })}>
                      <SelectTrigger><SelectValue placeholder="Role" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="doctor">Doctor</SelectItem>
                        <SelectItem value="receptionist">Receptionist</SelectItem>
                        <SelectItem value="pharmacist">Pharmacist</SelectItem>
                      </SelectContent>
                    </Select>
                    {editUserError && <div className="text-red-500 text-sm">{editUserError}</div>}
                    {editUserSuccess && <div className="text-green-600 text-sm">{editUserSuccess}</div>}
                    <Button type="submit" className="w-full medical-gradient text-white" disabled={editUserLoading}>
                      {editUserLoading ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </form>
                )}
              </DialogContent>
            </Dialog>
            {/* Delete User Dialog */}
            <Dialog open={showDeleteUser} onOpenChange={setShowDeleteUser}>
              <DialogContent>
                <DialogHeader><DialogTitle>Delete User</DialogTitle></DialogHeader>
                {deleteUser && (
                  <div className="space-y-4">
                    <div>Are you sure you want to delete <span className="font-semibold">{deleteUser.name}</span> ({deleteUser.email})?</div>
                    {deleteUserError && <div className="text-red-500 text-sm">{deleteUserError}</div>}
                    {deleteUserSuccess && <div className="text-green-600 text-sm">{deleteUserSuccess}</div>}
                    <div className="flex gap-2 justify-end">
                      <Button variant="outline" onClick={() => setShowDeleteUser(false)} disabled={deleteUserLoading}>Cancel</Button>
                      <Button variant="destructive" onClick={handleDeleteUserConfirm} disabled={deleteUserLoading}>
                        {deleteUserLoading ? 'Deleting...' : 'Delete'}
                      </Button>
                    </div>
                  </div>
                )}
              </DialogContent>
            </Dialog>
          </div>
        )}
        {activeSection === 'system-config' && (
          <div className="bg-white rounded-lg shadow p-6">System Config (Coming soon)</div>
        )}
        {activeSection === 'database' && (
          <div className="bg-white rounded-lg shadow p-6">Database (Coming soon)</div>
        )}
        {activeSection === 'reports' && (
          <div className="bg-white rounded-lg shadow p-6">Reports (Coming soon)</div>
        )}
        {activeSection === 'security' && (
          <div className="bg-white rounded-lg shadow p-6">Security (Coming soon)</div>
        )}
        {activeSection === 'alerts' && (
          <div className="bg-white rounded-lg shadow p-6">Alerts (Coming soon)</div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
