
import React, { useEffect, useState } from 'react';
import { request } from '../lib/api';
import { useAuth } from '../lib/authContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import jsPDF from 'jspdf';
import { formatDateDMY } from '@/lib/utils';

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
        // Sort by date descending (most recent first)
        const sorted = res.prescriptions.sort((a: any, b: any) => {
          // Parse DD-MM-YYYY or YYYY-MM-DD
          const parseDate = (d: string) => {
            if (!d) return 0;
            if (d.includes('-')) {
              const parts = d.split('-');
              if (parts[2]?.length === 4) return new Date(parts[2] + '-' + parts[1] + '-' + parts[0]).getTime(); // DD-MM-YYYY
              return new Date(d).getTime(); // fallback
            }
            return new Date(d).getTime();
          };
          return parseDate(b.date) - parseDate(a.date);
        });
        setPrescriptions(sorted);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchPrescriptions();
  }, [user]);

  const handleDownloadPDF = async (prescription: any) => {
    const doc = new jsPDF();
    // Load MedSync logo as base64
    const logoUrl = '/medsync_logo.png';
    const getImageBase64 = (url: string) => new Promise<string>((resolve) => {
      const img = new window.Image();
      img.crossOrigin = 'Anonymous';
      img.onload = function () {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx!.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      };
      img.src = url;
    });
    const logoBase64 = await getImageBase64(logoUrl);

    // Add large logo at the top
    doc.addImage(logoBase64, 'PNG', 60, 10, 90, 30);

    // Add watermark logo in the center (faint)
    doc.setTextColor(200, 200, 200);
    doc.setFontSize(60);
    doc.text(' ', 105, 105, { align: 'center' });
    doc.addImage(logoBase64, 'PNG', 40, 70, 130, 60, undefined, 'FAST', 0.08);
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);

    let y = 50;
    // Header
    doc.setFontSize(18);
    doc.text('E-Prescription', 105, y, { align: 'center' });
    y += 10;
    doc.setFontSize(12);

    // Patient & Doctor Info
    doc.setFont(undefined, 'bold');
    doc.text('Patient:', 15, y);
    doc.setFont(undefined, 'normal');
    doc.text(`${prescription.patient?.user?.name || 'Unknown'}`, 40, y);
    y += 7;
    if (prescription.patient?.user?.age) {
      doc.text('Age:', 15, y);
      doc.text(String(prescription.patient.user.age), 40, y);
      y += 7;
    }
    if (prescription.patient?.user?.gender) {
      doc.text('Gender:', 15, y);
      doc.text(prescription.patient.user.gender, 40, y);
      y += 7;
    }
    if (prescription.patient?.user?.contact) {
      doc.text('Contact:', 15, y);
      doc.text(prescription.patient.user.contact, 40, y);
      y += 7;
    }
    doc.setFont(undefined, 'bold');
    doc.text('Doctor:', 110, y - 21);
    doc.setFont(undefined, 'normal');
    doc.text(`${prescription.doctor?.user?.name || 'Unknown'}`, 140, y - 21);
    if (prescription.doctor?.specialty) {
      doc.text('Specialty:', 110, y - 14);
      doc.text(prescription.doctor.specialty, 140, y - 14);
    }
    if (prescription.doctor?.user?.contact) {
      doc.text('Contact:', 110, y - 7);
      doc.text(prescription.doctor.user.contact, 140, y - 7);
    }
    y += 5;
    doc.setFont(undefined, 'bold');
    doc.text('Hospital:', 15, y);
    doc.setFont(undefined, 'normal');
    doc.text(`${prescription.hospitalId?.name || 'Unknown'}`, 40, y);
    y += 7;
    doc.setFont(undefined, 'bold');
    doc.text('Date:', 110, y - 7);
    doc.setFont(undefined, 'normal');
    doc.text(formatDateDMY(prescription.date), 140, y - 7);
    y += 8;

    // Medicines Table Header
    doc.setFont(undefined, 'bold');
    doc.text('Medicines:', 15, y);
    y += 6;
    doc.setFontSize(11);
    doc.setFont(undefined, 'bold');
    doc.text('Name', 15, y);
    doc.text('Timing', 60, y);
    doc.text('Duration', 90, y);
    doc.text('Food', 120, y);
    doc.text('Other', 150, y);
    y += 5;
    doc.setFont(undefined, 'normal');

    // Medicines Table Rows
    let meds = prescription.medications || [];
    if (typeof meds === 'string') {
      // If medications is a string, split by comma
      meds = meds.split(',').map((m: string) => m.trim());
    }
    if (Array.isArray(meds) && meds.length > 0) {
      meds.forEach((med: any, idx: number) => {
        let name = med.name || '';
        let timing = med.timing ? med.timing.join('/') : '';
        let duration = med.duration || '';
        let food = med.food === 'Custom' ? med.customFood : med.food || '';
        let other = med.instructions || '';
        // If med is a string, try to parse
        if (typeof med === 'string') {
          const parts = med.split(/\[|\]|\(|\)|-/).map((p: string) => p.trim()).filter(Boolean);
          name = parts[0] || '';
          timing = parts[1] || '';
          duration = parts[2] || '';
          food = parts[3] || '';
          other = parts[4] || '';
        }
        doc.text(name, 15, y);
        doc.text(timing, 60, y);
        doc.text(duration, 90, y);
        doc.text(food, 120, y);
        doc.text(other, 150, y);
        y += 7;
        if (y > 260 && idx < meds.length - 1) {
          doc.addPage();
          y = 20;
        }
      });
    } else {
      doc.text('No medicines found.', 15, y);
      y += 7;
    }
    y += 5;

    // Notes/Diagnosis (if available)
    if (prescription.notes) {
      doc.setFont(undefined, 'bold');
      doc.text('Notes:', 15, y);
      doc.setFont(undefined, 'normal');
      doc.text(prescription.notes, 35, y);
      y += 7;
    }
    if (prescription.diagnosis) {
      doc.setFont(undefined, 'bold');
      doc.text('Diagnosis:', 15, y);
      doc.setFont(undefined, 'normal');
      doc.text(prescription.diagnosis, 40, y);
      y += 7;
    }

    // Footer
    y = 285;
    doc.setLineWidth(0.2);
    doc.line(12, y - 10, 198, y - 10);
    doc.setFontSize(10);
    doc.text('Doctor Signature:', 15, y);
    doc.text('This is a computer-generated prescription. Signature not required.', 105, y + 8, { align: 'center' });
    doc.setFontSize(11);
    doc.setTextColor(0, 102, 204);
    doc.text('Powered by MedSync', 170, y + 8, { align: 'right' });

    doc.save(`Prescription-${prescription._id}.pdf`);
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  return (
    <div className="max-w-3xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Prescriptions</h1>
      {prescriptions.length === 0 && <div>No prescriptions found.</div>}
      <div className="space-y-4">
        {prescriptions.map((prescription) => {
          // Determine medicines to display
          let meds = prescription.medications;
          if (!meds && prescription.medication) {
            meds = [{ name: prescription.medication, quantity: prescription.quantity }];
          } else if (typeof meds === 'string') {
            meds = meds.split(',').map((m: string) => ({ name: m.trim() }));
          }
          const patient = prescription.patient?.user || {};
          const doctor = prescription.doctor?.user || {};
          const doctorSpecialty = prescription.doctor?.specialty;
          const hospital = prescription.hospitalId || {};
          return (
            <Card key={prescription._id} className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="inline-block bg-blue-100 text-blue-700 rounded-full px-2 py-0.5 text-xs font-semibold mr-2">Patient</span>
                  {patient.name || 'Prescription'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2 text-sm text-gray-700">
                  <div>
                    <div><span className="font-semibold">Age:</span> {patient.age || 'N/A'}</div>
                    <div><span className="font-semibold">Gender:</span> {patient.gender || 'N/A'}</div>
                    <div><span className="font-semibold">Contact:</span> {patient.contact || 'N/A'}</div>
                  </div>
                  <div>
                    <div><span className="font-semibold">Doctor:</span> {doctor.name || 'N/A'}</div>
                    <div><span className="font-semibold">Specialty:</span> {doctorSpecialty || 'N/A'}</div>
                    <div><span className="font-semibold">Contact:</span> {doctor.contact || 'N/A'}</div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2 text-sm text-gray-700">
                  <div><span className="font-semibold">Hospital:</span> {hospital.name || 'N/A'}</div>
                  <div><span className="font-semibold">Date:</span> {formatDateDMY(prescription.date)}</div>
                </div>
                <div className="mb-2 text-sm">
                  <span className="font-semibold">Status:</span> <span className={`px-2 py-0.5 rounded text-xs font-semibold ${prescription.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>{prescription.status}</span>
                </div>
                <div className="mb-2 text-sm font-semibold">Medicines:</div>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-xs border rounded">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="px-2 py-1 border">Name</th>
                        <th className="px-2 py-1 border">Qty</th>
                        <th className="px-2 py-1 border">Dosage</th>
                        <th className="px-2 py-1 border">Frequency</th>
                        <th className="px-2 py-1 border">Timing</th>
                        <th className="px-2 py-1 border">Duration</th>
                        <th className="px-2 py-1 border">Food</th>
                        <th className="px-2 py-1 border">Instructions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Array.isArray(meds) && meds.length > 0 ? (
                        meds.map((med: any, idx: number) => (
                          <tr key={idx} className="border-t">
                            <td className="px-2 py-1 border">{med.name || 'N/A'}</td>
                            <td className="px-2 py-1 border">{med.quantity || 'N/A'}</td>
                            <td className="px-2 py-1 border">{med.dosage || 'N/A'}</td>
                            <td className="px-2 py-1 border">{med.frequency || 'N/A'}</td>
                            <td className="px-2 py-1 border">{Array.isArray(med.timing) ? med.timing.join(', ') : med.timing || 'N/A'}</td>
                            <td className="px-2 py-1 border">{med.duration || 'N/A'}</td>
                            <td className="px-2 py-1 border">{med.food || 'N/A'}</td>
                            <td className="px-2 py-1 border">{med.instructions || 'N/A'}</td>
                          </tr>
                        ))
                      ) : (
                        <tr><td colSpan={8} className="px-2 py-1 text-center">N/A</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
                {prescription.diagnosis && (
                  <div className="mt-2 text-sm"><span className="font-semibold">Diagnosis:</span> {prescription.diagnosis}</div>
                )}
                {prescription.notes && (
                  <div className="mt-1 text-sm"><span className="font-semibold">Notes:</span> {prescription.notes}</div>
                )}
                <Button onClick={() => handleDownloadPDF(prescription)} className="mt-4">Download as PDF</Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default Prescriptions;
