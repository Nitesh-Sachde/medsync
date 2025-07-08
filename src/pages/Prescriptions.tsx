
import React, { useEffect, useState } from 'react';
import { request } from '../lib/api';
import { useAuth } from '../lib/authContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import jsPDF from 'jspdf';

const Prescriptions = () => {
  const { user } = useAuth();
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPrescriptions = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await request('/prescriptions');
        setPrescriptions(res.prescriptions);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchPrescriptions();
  }, [user]);

  const handleDownloadPDF = (prescription: any) => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('E-Prescription', 10, 15);
    doc.setFontSize(12);
    doc.text(`Patient: ${prescription.patient?.user?.name || 'Unknown'}`, 10, 30);
    doc.text(`Doctor: ${prescription.doctor?.user?.name || 'Unknown'}`, 10, 40);
    doc.text(`Hospital: ${prescription.hospitalId?.name || 'Unknown'}`, 10, 50);
    doc.text(`Date: ${prescription.date || 'N/A'}`, 10, 60);
    doc.text('Medications:', 10, 75);
    if (Array.isArray(prescription.medications)) {
      prescription.medications.forEach((med: any, idx: number) => {
        doc.text(`- ${med.name} (${med.dosage}, ${med.frequency})`, 15, 85 + idx * 10);
      });
    } else {
      doc.text('- N/A', 15, 85);
    }
    doc.text(`Prescribed by: ${prescription.doctor?.user?.name || 'N/A'}`, 10, 120);
    doc.text(`Hospital: ${prescription.hospitalId?.name || 'N/A'}`, 10, 130);
    doc.save(`Prescription-${prescription._id}.pdf`);
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  return (
    <div className="max-w-3xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Prescriptions</h1>
      {prescriptions.length === 0 && <div>No prescriptions found.</div>}
      <div className="space-y-4">
        {prescriptions.map((prescription) => (
          <Card key={prescription._id}>
            <CardHeader>
              <CardTitle>{prescription.title || 'Prescription'}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-2 text-sm text-gray-600">Date: {prescription.date}</div>
              <div className="mb-2 text-sm text-gray-600">Patient: {prescription.patient?.user?.name || 'Unknown'}</div>
              <div className="mb-2 text-sm text-gray-600">Doctor: {prescription.doctor?.user?.name || 'Unknown'}</div>
              <div className="mb-2 text-sm text-gray-600">Hospital: {prescription.hospitalId?.name || 'Unknown'}</div>
              <div className="mb-2 text-sm text-gray-600">Medications:</div>
              <ul className="mb-2 text-sm text-gray-700 list-disc ml-6">
                {Array.isArray(prescription.medications) && prescription.medications.length > 0 ? (
                  prescription.medications.map((med: any, idx: number) => (
                    <li key={idx}>{med.name} ({med.dosage}, {med.frequency})</li>
                  ))
                ) : (
                  <li>N/A</li>
                )}
              </ul>
              <div className="mb-2 text-sm text-gray-600">Prescribed by: {prescription.doctor?.user?.name || 'N/A'}</div>
              <div className="mb-2 text-sm text-gray-600">Hospital: {prescription.hospitalId?.name || 'N/A'}</div>
              <Button onClick={() => handleDownloadPDF(prescription)} className="mt-2">Download as PDF</Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Prescriptions;
