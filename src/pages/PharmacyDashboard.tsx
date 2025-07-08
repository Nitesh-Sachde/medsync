
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Pill, Package, AlertTriangle, Clock, Search, Truck, CheckCircle, BarChart } from 'lucide-react';
import { request } from '../lib/api';
import { useAuth } from '../lib/authContext';

const PharmacyDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [lowStock, setLowStock] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({});

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        // Fetch all prescriptions
        const presRes = await request('/prescriptions');
        setPrescriptions(presRes.prescriptions);
        // Fetch inventory
        const invRes = await request('/inventory');
        const lowStockItems = invRes.inventories.filter((item: any) => item.currentStock < item.minStock);
        setLowStock(lowStockItems);
        // Stats
        setStats({
          prescriptionsDispensed: presRes.prescriptions.filter((p: any) => p.status === 'completed').length,
          pendingPrescriptions: presRes.prescriptions.filter((p: any) => p.status === 'pending').length,
          lowStockItems: lowStockItems.length,
          revenue: 0 // Placeholder, implement if you have revenue data
        });
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    if (user?.role === 'pharmacist') fetchData();
  }, [user]);

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  // Mock data - replace with API calls
  // const pendingPrescriptions = [
  //   { id: 1, patient: 'John Doe', doctor: 'Dr. Smith', medication: 'Lisinopril 10mg', quantity: 30, status: 'pending', priority: 'normal' },
  //   { id: 2, patient: 'Jane Smith', doctor: 'Dr. Johnson', medication: 'Metformin 500mg', quantity: 60, status: 'ready', priority: 'normal' },
  //   { id: 3, patient: 'Mike Johnson', doctor: 'Dr. Chen', medication: 'Albuterol Inhaler', quantity: 1, status: 'dispensing', priority: 'urgent' },
  //   { id: 4, patient: 'Sarah Wilson', doctor: 'Dr. Wilson', medication: 'Antibiotics', quantity: 14, status: 'pending', priority: 'high' }
  // ];

  // const lowStockMedications = [
  //   { id: 1, name: 'Paracetamol 500mg', currentStock: 25, minStock: 100, supplier: 'MedSupply Co.' },
  //   { id: 2, name: 'Insulin Pen', currentStock: 8, minStock: 20, supplier: 'DiabetesCare Ltd.' },
  //   { id: 3, name: 'Blood Pressure Monitor', currentStock: 3, minStock: 10, supplier: 'MedDevice Inc.' }
  // ];

  // const todayStats = {
  //   prescriptionsDispensed: 45,
  //   pendingPrescriptions: 12,
  //   lowStockItems: 8,
  //   revenue: 2450
  // };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Pharmacy Dashboard</h1>
              <p className="text-gray-600">Medication Management & Dispensing</p>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm">
                <Truck className="h-4 w-4 mr-2" />
                New Order
              </Button>
              <Button className="medical-gradient text-white" size="sm">
                <Package className="h-4 w-4 mr-2" />
                Inventory
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
                  <p className="text-sm font-medium text-gray-600">Dispensed Today</p>
                  <p className="text-2xl font-bold text-green-600">{stats.prescriptionsDispensed}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.pendingPrescriptions}</p>
                </div>
                <Clock className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Low Stock Items</p>
                  <p className="text-2xl font-bold text-red-600">{stats.lowStockItems}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Today's Revenue</p>
                  <p className="text-2xl font-bold text-blue-600">${stats.revenue}</p>
                </div>
                <BarChart className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <Button className="h-16 medical-gradient text-white flex flex-col items-center justify-center">
            <Pill className="h-5 w-5 mb-1" />
            Dispense Rx
          </Button>
          <Button variant="outline" className="h-16 flex flex-col items-center justify-center">
            <Package className="h-5 w-5 mb-1" />
            Check Inventory
          </Button>
          <Button variant="outline" className="h-16 flex flex-col items-center justify-center">
            <Truck className="h-5 w-5 mb-1" />
            Place Order
          </Button>
          <Button variant="outline" className="h-16 flex flex-col items-center justify-center">
            <AlertTriangle className="h-5 w-5 mb-1" />
            Low Stock Alert
          </Button>
          <Button variant="outline" className="h-16 flex flex-col items-center justify-center">
            <BarChart className="h-5 w-5 mb-1" />
            Sales Report
          </Button>
        </div>

        {/* Search Bar */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search prescriptions, medications, or patients..."
                  className="pl-10"
                />
              </div>
              <Button>Search</Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Pending Prescriptions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Pending Prescriptions
              </CardTitle>
              <CardDescription>Prescriptions awaiting processing</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {prescriptions.map((prescription) => (
                  <div key={prescription.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{prescription.patient}</h4>
                      <p className="text-sm text-gray-600">{prescription.medication}</p>
                      <p className="text-sm text-gray-500">Qty: {prescription.quantity} - {prescription.doctor}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={
                        prescription.priority === 'urgent' ? 'destructive' :
                        prescription.priority === 'high' ? 'default' : 'secondary'
                      }>
                        {prescription.priority}
                      </Badge>
                      <Badge variant={
                        prescription.status === 'ready' ? 'default' :
                        prescription.status === 'dispensing' ? 'secondary' : 'outline'
                      }>
                        {prescription.status}
                      </Badge>
                      <Button size="sm" variant="outline">
                        {prescription.status === 'ready' ? 'Dispense' : 'Process'}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Low Stock Alerts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Low Stock Alerts
              </CardTitle>
              <CardDescription>Medications running low on inventory</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {lowStock.map((medication) => (
                  <div key={medication.id} className="flex items-center justify-between p-4 border rounded-lg bg-red-50">
                    <div>
                      <h4 className="font-medium text-red-900">{medication.name}</h4>
                      <p className="text-sm text-red-700">Current: {medication.currentStock} | Min: {medication.minStock}</p>
                      <p className="text-sm text-red-600">{medication.supplier}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="destructive">
                        {Math.round((medication.currentStock / medication.minStock) * 100)}% left
                      </Badge>
                      <Button size="sm" variant="outline">Reorder</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Dispense */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Pill className="h-5 w-5" />
                Quick Dispense
              </CardTitle>
              <CardDescription>Fast prescription dispensing</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Input placeholder="Prescription ID or Patient Name" />
                <Input placeholder="Medication Name" />
                <div className="grid grid-cols-2 gap-4">
                  <Input placeholder="Quantity" type="number" />
                  <Input placeholder="Days Supply" type="number" />
                </div>
                <Input placeholder="Instructions" />
                <div className="flex gap-2">
                  <Button className="flex-1 medical-gradient text-white">
                    <Pill className="h-4 w-4 mr-2" />
                    Dispense
                  </Button>
                  <Button variant="outline" className="flex-1">
                    Save Draft
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Recent Activity
              </CardTitle>
              <CardDescription>Latest pharmacy operations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <div>
                    <p className="font-medium text-green-900">Dispensed: Lisinopril</p>
                    <p className="text-sm text-green-700">Patient: John Doe - 2:30 PM</p>
                  </div>
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                  <div>
                    <p className="font-medium text-blue-900">Stock Added: Insulin</p>
                    <p className="text-sm text-blue-700">Quantity: 50 units - 1:45 PM</p>
                  </div>
                  <Package className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                  <div>
                    <p className="font-medium text-orange-900">Order Placed: Antibiotics</p>
                    <p className="text-sm text-orange-700">Supplier: MedSupply - 12:15 PM</p>
                  </div>
                  <Truck className="h-5 w-5 text-orange-600" />
                </div>
                <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                  <div>
                    <p className="font-medium text-yellow-900">Low Stock Alert</p>
                    <p className="text-sm text-yellow-700">Paracetamol - 11:30 AM</p>  
                  </div>
                  <AlertTriangle className="h-5 w-5 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PharmacyDashboard;
