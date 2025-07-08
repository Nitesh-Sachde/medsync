
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Calendar as CalendarIcon, Clock, User, Stethoscope, MapPin, Phone } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const Appointments = () => {
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [appointmentType, setAppointmentType] = useState('');

  // Mock data - replace with API calls
  const doctors = [
    { id: 1, name: 'Dr. Sarah Johnson', specialty: 'Cardiology', available: true },
    { id: 2, name: 'Dr. Mike Chen', specialty: 'General Practice', available: true },
    { id: 3, name: 'Dr. Emily Davis', specialty: 'Pediatrics', available: false },
    { id: 4, name: 'Dr. James Wilson', specialty: 'Orthopedics', available: true }
  ];

  const timeSlots = [
    '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
    '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM'
  ];

  const upcomingAppointments = [
    { id: 1, doctor: 'Dr. Sarah Johnson', specialty: 'Cardiology', date: '2024-01-20', time: '10:00 AM', status: 'confirmed', type: 'Follow-up' },
    { id: 2, doctor: 'Dr. Mike Chen', specialty: 'General Practice', date: '2024-01-22', time: '2:30 PM', status: 'pending', type: 'Consultation' },
    { id: 3, doctor: 'Dr. James Wilson', specialty: 'Orthopedics', date: '2024-01-25', time: '11:00 AM', status: 'confirmed', type: 'Check-up' }
  ];

  const handleBookAppointment = () => {
    // API integration point
    console.log('Booking appointment:', {
      date: selectedDate,
      doctor: selectedDoctor,
      time: selectedTime,
      type: appointmentType
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Appointments</h1>
              <p className="text-gray-600">Book and manage your medical appointments</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Book New Appointment */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" />
                Book New Appointment
              </CardTitle>
              <CardDescription>Schedule your next medical appointment</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Appointment Type */}
              <div className="space-y-2">
                <Label htmlFor="appointmentType">Appointment Type</Label>
                <Select onValueChange={setAppointmentType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select appointment type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="consultation">General Consultation</SelectItem>
                    <SelectItem value="followup">Follow-up</SelectItem>
                    <SelectItem value="checkup">Annual Check-up</SelectItem>
                    <SelectItem value="emergency">Emergency</SelectItem>
                    <SelectItem value="specialist">Specialist Consultation</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Doctor Selection */}
              <div className="space-y-2">
                <Label htmlFor="doctor">Select Doctor</Label>
                <Select onValueChange={setSelectedDoctor}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose your preferred doctor" />
                  </SelectTrigger>
                  <SelectContent>
                    {doctors.map((doctor) => (
                      <SelectItem 
                        key={doctor.id} 
                        value={doctor.id.toString()}
                        disabled={!doctor.available}
                      >
                        <div className="flex items-center gap-2">
                          <Stethoscope className="h-4 w-4" />
                          {doctor.name} - {doctor.specialty}
                          {!doctor.available && <Badge variant="secondary">Unavailable</Badge>}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Date Selection */}
              <div className="space-y-2">
                <Label>Select Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !selectedDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      disabled={(date) => date < new Date() || date.getDay() === 0}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Time Selection */}
              <div className="space-y-2">
                <Label>Available Time Slots</Label>
                <div className="grid grid-cols-3 gap-2">
                  {timeSlots.map((time) => (
                    <Button
                      key={time}
                      variant={selectedTime === time ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedTime(time)}
                      className="text-xs"
                    >
                      <Clock className="h-3 w-3 mr-1" />
                      {time}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Additional Information */}
              <div className="space-y-2">
                <Label htmlFor="symptoms">Reason for Visit (Optional)</Label>
                <Input 
                  id="symptoms"
                  placeholder="Brief description of your symptoms or reason for visit"
                />
              </div>

              <Button 
                onClick={handleBookAppointment}
                className="w-full medical-gradient text-white"
                disabled={!selectedDate || !selectedDoctor || !selectedTime || !appointmentType}
              >
                <CalendarIcon className="h-4 w-4 mr-2" />
                Book Appointment
              </Button>
            </CardContent>
          </Card>

          {/* Upcoming Appointments */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Upcoming Appointments
              </CardTitle>
              <CardDescription>Your scheduled appointments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingAppointments.map((appointment) => (
                  <div key={appointment.id} className="p-4 border rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-500" />
                        <span className="font-medium">{appointment.doctor}</span>
                      </div>
                      <Badge variant={appointment.status === 'confirmed' ? 'default' : 'secondary'}>
                        {appointment.status}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Stethoscope className="h-4 w-4" />
                        {appointment.specialty}
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {appointment.type}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <CalendarIcon className="h-4 w-4 text-blue-500" />
                          {appointment.date}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4 text-green-500" />
                          {appointment.time}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Phone className="h-3 w-3 mr-1" />
                          Call
                        </Button>
                        <Button size="sm" variant="outline">
                          Reschedule
                        </Button>
                        <Button size="sm" variant="outline" className="text-red-600 border-red-600">
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Quick Actions */}
              <div className="mt-6 pt-4 border-t">
                <div className="grid grid-cols-2 gap-4">
                  <Button variant="outline" className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Call Hospital
                  </Button>
                  <Button variant="outline" className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Get Directions
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Doctor Information */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Stethoscope className="h-5 w-5" />
              Available Doctors
            </CardTitle>
            <CardDescription>Meet our medical professionals</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {doctors.map((doctor) => (
                <div key={doctor.id} className="p-4 border rounded-lg text-center space-y-3">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-green-500 rounded-full mx-auto flex items-center justify-center">
                    <User className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h3 className="font-medium">{doctor.name}</h3>
                    <p className="text-sm text-gray-600">{doctor.specialty}</p>
                  </div>
                  <Badge variant={doctor.available ? 'default' : 'secondary'}>
                    {doctor.available ? 'Available' : 'Unavailable'}
                  </Badge>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="w-full"
                    disabled={!doctor.available}
                  >
                    Book with {doctor.name.split(' ')[1]}
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Appointments;
