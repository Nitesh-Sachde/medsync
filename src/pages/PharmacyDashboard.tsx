
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Pill, Package, AlertTriangle, Clock, Search, Truck, CheckCircle, BarChart, Plus, Edit, Filter, RefreshCw, X } from 'lucide-react';
import { request } from '../lib/api';
import { useAuth } from '../lib/authContext';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const PharmacyDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [lowStock, setLowStock] = useState<any[]>([]);
  const [expiringSoon, setExpiringSoon] = useState<any[]>([]);
  const [inventoryAlerts, setInventoryAlerts] = useState<any>({});
  const [stats, setStats] = useState<any>({});
  const [showAddInventory, setShowAddInventory] = useState(false);
  const [showRestockModal, setShowRestockModal] = useState(false);
  const [selectedInventoryItem, setSelectedInventoryItem] = useState<any>(null);
  const [inventory, setInventory] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  // Computed values
  const filteredInventory = inventory.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        // Fetch all prescriptions
        const presRes = await request('/prescriptions');
        setPrescriptions(presRes.prescriptions);
        
        // Fetch inventory with enhanced filtering
        const invRes = await request('/inventory');
        const allInventory = invRes.inventories;
        setInventory(allInventory);
        
        // Get inventory alerts
        const alertsRes = await request('/inventory/alerts');
        setInventoryAlerts(alertsRes.alerts);
        setLowStock(alertsRes.alerts.lowStock || []);
        setExpiringSoon(alertsRes.alerts.expiringSoon || []);
        
        // Enhanced stats
        setStats({
          prescriptionsDispensed: presRes.prescriptions.filter((p: any) => p.status === 'completed').length,
          pendingPrescriptions: presRes.prescriptions.filter((p: any) => p.status === 'pending').length,
          lowStockItems: (alertsRes.alerts.lowStock || []).length,
          outOfStockItems: (alertsRes.alerts.outOfStock || []).length,
          expiringSoonItems: (alertsRes.alerts.expiringSoon || []).length,
          expiredItems: (alertsRes.alerts.expired || []).length,
          totalInventoryValue: allInventory.reduce((sum: number, item: any) => 
            sum + (item.currentStock * (item.unitPrice || 0)), 0
          )
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
        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="hover:shadow-lg transition-shadow">
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
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending Orders</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.pendingPrescriptions}</p>
                </div>
                <Clock className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
          <Card className="hover:shadow-lg transition-shadow">
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
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Expiring Soon</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.expiringSoonItems}</p>
                </div>
                <Package className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Additional Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Out of Stock</p>
                  <p className="text-2xl font-bold text-red-800">{stats.outOfStockItems}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-800" />
              </div>
            </CardContent>
          </Card>
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Expired Items</p>
                  <p className="text-2xl font-bold text-red-900">{stats.expiredItems}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-900" />
              </div>
            </CardContent>
          </Card>
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Inventory Value</p>
                  <p className="text-2xl font-bold text-blue-600">${(stats.totalInventoryValue || 0).toLocaleString()}</p>
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

          {/* Enhanced Inventory Alerts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Inventory Alerts
              </CardTitle>
              <CardDescription>Critical inventory notifications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-80 overflow-y-auto">
                {/* Low Stock Items */}
                {lowStock.length > 0 && (
                  <div>
                    <h5 className="font-medium text-red-700 mb-2">Low Stock ({lowStock.length})</h5>
                    {lowStock.map((item) => (
                      <div key={item._id} className="flex items-center justify-between p-3 border rounded-lg bg-red-50 mb-2">
                        <div>
                          <h4 className="font-medium text-red-900">{item.name}</h4>
                          <p className="text-sm text-red-700">
                            Current: {item.currentStock} | Min: {item.minStock}
                            {item.location && ` | Location: ${item.location}`}
                          </p>
                          <p className="text-sm text-red-600">{item.supplier}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="destructive">
                            {Math.round((item.currentStock / item.minStock) * 100)}% left
                          </Badge>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                              setSelectedInventoryItem(item);
                              setShowRestockModal(true);
                            }}
                          >
                            Restock
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Expiring Soon Items */}
                {expiringSoon.length > 0 && (
                  <div>
                    <h5 className="font-medium text-yellow-700 mb-2">Expiring Soon ({expiringSoon.length})</h5>
                    {expiringSoon.map((item) => (
                      <div key={item._id} className="flex items-center justify-between p-3 border rounded-lg bg-yellow-50 mb-2">
                        <div>
                          <h4 className="font-medium text-yellow-900">{item.name}</h4>
                          <p className="text-sm text-yellow-700">
                            Expires: {new Date(item.expirationDate).toLocaleDateString()}
                            {item.batchNumber && ` | Batch: ${item.batchNumber}`}
                          </p>
                          <p className="text-sm text-yellow-600">Stock: {item.currentStock}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="bg-yellow-200 text-yellow-800">
                            {Math.ceil((new Date(item.expirationDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days
                          </Badge>
                          <Button size="sm" variant="outline">Mark Priority</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {lowStock.length === 0 && expiringSoon.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <CheckCircle className="h-12 w-12 mx-auto mb-2 text-green-500" />
                    <p>All inventory levels are normal!</p>
                  </div>
                )}
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

          {/* Enhanced Inventory Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Inventory Management
              </CardTitle>
              <CardDescription>Manage your medication inventory</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Search medications..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-64"
                  />
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                </div>
                <Button onClick={() => setShowAddModal(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Medication
                </Button>
              </div>

              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Current Stock</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Expiry Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredInventory.map((item) => (
                      <TableRow key={item._id} className="hover:bg-gray-50">
                        <TableCell>
                          <div>
                            <div className="font-medium">{item.name}</div>
                            {item.batchNumber && (
                              <div className="text-sm text-gray-500">Batch: {item.batchNumber}</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{item.category}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span>{item.currentStock}</span>
                            {item.currentStock <= item.minStock && (
                              <AlertTriangle className="h-4 w-4 text-red-500" />
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={
                              item.currentStock === 0 ? "destructive" :
                              item.currentStock <= item.minStock ? "secondary" :
                              new Date(item.expirationDate) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) ? "outline" :
                              "default"
                            }
                          >
                            {item.currentStock === 0 ? "Out of Stock" :
                             item.currentStock <= item.minStock ? "Low Stock" :
                             new Date(item.expirationDate) <= new Date() ? "Expired" :
                             new Date(item.expirationDate) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) ? "Expiring Soon" :
                             "In Stock"}
                          </Badge>
                        </TableCell>
                        <TableCell>₹{item.price?.toFixed(2) || 'N/A'}</TableCell>
                        <TableCell>
                          <div className={
                            new Date(item.expirationDate) <= new Date() ? "text-red-600" :
                            new Date(item.expirationDate) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) ? "text-yellow-600" :
                            ""
                          }>
                            {new Date(item.expirationDate).toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => {
                                setSelectedInventoryItem(item);
                                setShowRestockModal(true);
                              }}
                            >
                              <RefreshCw className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => {
                                setEditingItem(item);
                                setShowEditModal(true);
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {filteredInventory.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  {searchTerm ? `No medications found matching "${searchTerm}"` : "No inventory items found"}
                </div>
              )}
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

      {/* Add Medication Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Add New Medication</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAddModal(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Medication Name *</label>
                <Input placeholder="Enter medication name" />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Category</label>
                <Input placeholder="e.g., Antibiotics, Pain Relief" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Current Stock *</label>
                  <Input type="number" placeholder="0" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Min Stock *</label>
                  <Input type="number" placeholder="10" />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Unit Price</label>
                <Input type="number" placeholder="0.00" />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Batch Number</label>
                <Input placeholder="Enter batch number" />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Expiration Date</label>
                <Input type="date" />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Supplier</label>
                <Input placeholder="Supplier name" />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Location</label>
                <Input placeholder="e.g., A1-B2, Shelf 1" />
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button className="flex-1 medical-gradient text-white">
                  Add Medication
                </Button>
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Restock Modal */}
      {showRestockModal && selectedInventoryItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-lg w-full max-w-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Restock {selectedInventoryItem.name}</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowRestockModal(false);
                  setSelectedInventoryItem(null);
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Current Stock</label>
                <Input value={selectedInventoryItem.currentStock} disabled />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Add Quantity</label>
                <Input type="number" placeholder="Enter quantity to add" />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Batch Number</label>
                <Input placeholder="Enter batch number" />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Expiration Date</label>
                <Input type="date" />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Unit Price</label>
                <Input type="number" placeholder="Enter unit price" />
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button className="flex-1 medical-gradient text-white">
                  Confirm Restock
                </Button>
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => {
                    setShowRestockModal(false);
                    setSelectedInventoryItem(null);
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Edit Inventory Modal */}
      {showEditModal && editingItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">Edit Inventory Item</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <Input
                  value={editingItem.name}
                  onChange={(e) => setEditingItem({...editingItem, name: e.target.value})}
                  placeholder="Medicine name"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Current Stock</label>
                  <Input
                    type="number"
                    value={editingItem.currentStock}
                    onChange={(e) => setEditingItem({...editingItem, currentStock: parseInt(e.target.value) || 0})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Minimum Stock</label>
                  <Input
                    type="number"
                    value={editingItem.minimumStock}
                    onChange={(e) => setEditingItem({...editingItem, minimumStock: parseInt(e.target.value) || 0})}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Expiration Date</label>
                <Input
                  type="date"
                  value={editingItem.expirationDate ? new Date(editingItem.expirationDate).toISOString().split('T')[0] : ''}
                  onChange={(e) => setEditingItem({...editingItem, expirationDate: e.target.value})}
                />
              </div>
            </div>
            <div className="flex space-x-4 mt-6">
              <Button 
                className="medical-gradient text-white flex-1"
                onClick={async () => {
                  try {
                    await request(`/inventory/${editingItem._id}`, {
                      method: 'PUT',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(editingItem)
                    });
                    setShowEditModal(false);
                    setEditingItem(null);
                    // Refresh inventory
                    const invRes = await request('/inventory');
                    setInventory(invRes.inventories);
                  } catch (error) {
                    console.error('Failed to update inventory:', error);
                  }
                }}
              >
                Update Item
              </Button>
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => {
                  setShowEditModal(false);
                  setEditingItem(null);
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PharmacyDashboard;
