import React, { useEffect, useState } from 'react';
import { request } from '../lib/api';
import { useAuth } from '../lib/authContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const BookAppointment = () => {
  const { user } = useAuth();
  const [hospitals, setHospitals] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [hospitalId, setHospitalId] = useState('');
  const [doctorId, setDoctorId] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchHospitals = async () => {
      try {
        const res = await request('/hospitals');
        setHospitals(res.hospitals);
      } catch (err: any) {
        setError(err.message);
      }
    };
    fetchHospitals();
  }, []);

  useEffect(() => {
    if (!hospitalId) return setDoctors([]);
    const fetchDoctors = async () => {
      try {
       
        const res = await request(`/doctors/by-hospital?hospitalId=${hospitalId}`);
        setDoctors(res.doctors);
      } catch (err: any) {
        setError(err.message);
      }
    };
    fetchDoctors();
  }, [hospitalId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await request('/appointments', {
        method: 'POST',
        body: JSON.stringify({ doctor: doctorId, hospitalId, date, time }),
      });
      setSuccess('Appointment booked successfully!');
      setDoctorId('');
      setHospitalId('');
      setDate('');
      setTime('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Book Appointment</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block mb-1 font-medium">Select Hospital</label>
              <Select value={hospitalId} onValueChange={setHospitalId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a hospital" />
                </SelectTrigger>
                <SelectContent>
                  {hospitals.map((h) => (
                    <SelectItem key={h._id} value={h._id}>{h.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block mb-1 font-medium">Select Doctor</label>
              <Select value={doctorId} onValueChange={setDoctorId} disabled={!hospitalId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a doctor" />
                </SelectTrigger>
                <SelectContent>
                  {doctors.map((d) => (
                    <SelectItem key={d._id} value={d._id}>{d.user?.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block mb-1 font-medium">Date</label>
              <Input type="date" value={date} onChange={e => setDate(e.target.value)} required />
            </div>
            <div>
              <label className="block mb-1 font-medium">Time</label>
              <Input type="time" value={time} onChange={e => setTime(e.target.value)} required />
            </div>
            {error && <div className="text-red-500 text-sm">{error}</div>}
            {success && <div className="text-green-600 text-sm">{success}</div>}
            <Button type="submit" className="w-full medical-gradient text-white" disabled={loading}>
              {loading ? 'Booking...' : 'Book Appointment'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default BookAppointment; 