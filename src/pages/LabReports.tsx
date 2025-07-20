
import React from 'react';
import { useEffect, useState } from 'react';
import { request } from '../lib/api';
import { useAuth } from '../lib/authContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import jsPDF from 'jspdf';
import { formatDateDMY } from '@/lib/utils';

const LabReports = () => {
  const { user } = useAuth();
  const [labReports, setLabReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchLabReports = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await request('/labreports');
        setLabReports(res.labReports);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchLabReports();
  }, [user]);

  const handleDownloadPDF = (report: any) => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Lab Report', 10, 15);
    doc.setFontSize(12);
    doc.text(`Patient: ${report.patient?.user?.name || 'Unknown'}`, 10, 30);
    doc.text(`Test: ${report.test}`, 10, 40);
    doc.text(`Date: ${formatDateDMY(report.date)}`, 10, 50);
    doc.text(`Status: ${report.status}`, 10, 60);
    doc.text(`Result: ${report.result || 'N/A'}`, 10, 70);
    doc.text(`Issued by: ${report.doctor?.user?.name || 'N/A'}`, 10, 80);
    doc.text(`Hospital: ${report.hospitalId?.name || 'N/A'}`, 10, 90);
    doc.save(`LabReport-${report._id}.pdf`);
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  return (
    <div className="max-w-3xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Lab Reports</h1>
      {labReports.length === 0 && <div>No lab reports found.</div>}
      <div className="space-y-4">
        {labReports.map((report) => (
          <Card key={report._id}>
            <CardHeader>
              <CardTitle>{report.test}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-2 text-sm text-gray-600">Date: {formatDateDMY(report.date)}</div>
              <div className="mb-2 text-sm text-gray-600">Status: {report.status}</div>
              <div className="mb-2 text-sm text-gray-600">Result: {report.result || 'N/A'}</div>
              <div className="mb-2 text-sm text-gray-600">Issued by: {report.doctor?.user?.name || 'N/A'}</div>
              <div className="mb-2 text-sm text-gray-600">Hospital: {report.hospitalId?.name || 'N/A'}</div>
              <Button onClick={() => handleDownloadPDF(report)} className="mt-2">Download as PDF</Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default LabReports;
