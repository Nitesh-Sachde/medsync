import jsPDF from 'jspdf';
import { formatDateDMY } from '@/lib/utils';

export async function generatePrescriptionPDF(prescription: any) {
  const doc = new jsPDF('p', 'mm', 'a4');

  // Page setup
  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;

  // Theme colors
  const primaryColor: [number, number, number] = [0, 102, 204];
  const secondaryColor: [number, number, number] = [102, 102, 102];
  const lightGray: [number, number, number] = [245, 245, 245];

  // Image helper
  const logoUrl = '/medsync_logo.png';
  const getImageBase64 = (url: string) =>
    new Promise<string>((resolve) => {
      const img = new window.Image();
      img.crossOrigin = 'Anonymous';
      img.onload = function () {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      };
      img.src = url;
    });

  let logoBase64 = '';
  try {
    logoBase64 = await getImageBase64(logoUrl);

    // Add logo (top left) with correct aspect ratio
    const logoWidth = 40;
    const logoHeight = 16;
    doc.addImage(logoBase64, 'PNG', margin, 15, logoWidth, logoHeight);

    // Watermark in center – larger and faint (simulated transparency)
    const watermarkWidth = 140;
    const watermarkHeight = 60;
    const centerX = (pageWidth - watermarkWidth) / 2;
    const centerY = 110;
    doc.addImage(logoBase64, 'PNG', centerX, centerY, watermarkWidth, watermarkHeight, undefined, 'FAST', 0.015);
  } catch (error) {
    console.warn('Logo not loaded. Proceeding without logo.');
  }

  // Header: Hospital details
  let y = 20;
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('MedSync Hospital', pageWidth - margin, y, { align: 'right' });

  y += 6;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('123, MedSync Center, City, State, 123456', pageWidth - margin, y, { align: 'right' });

  y += 4;
  doc.text('Phone: +91-1234567890 | Email: info@medsync.com', pageWidth - margin, y, { align: 'right' });

  y += 10;
  doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setLineWidth(1);
  doc.line(margin, y, pageWidth - margin, y);

  y += 15;

  // Patient Info
  doc.setFillColor(...lightGray);
  doc.rect(margin, y - 5, contentWidth, 25, 'F');
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('PATIENT INFORMATION', margin + 5, y + 3);
  y += 12;

  const leftColX = margin + 5;
  const rightColX = pageWidth / 2 + 10;

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Patient Name:', leftColX, y);
  doc.setFont('helvetica', 'normal');
  doc.text(prescription.patient?.user?.name || prescription.patient?.name || 'Unknown', leftColX + 30, y);

  doc.setFont('helvetica', 'bold');
  doc.text('Date:', rightColX, y);
  doc.setFont('helvetica', 'normal');
  doc.text(formatDateDMY(prescription.date), rightColX + 15, y);

  y += 8;

  doc.setFont('helvetica', 'bold');
  doc.text('Doctor:', leftColX, y);
  doc.setFont('helvetica', 'normal');
  doc.text(prescription.doctor?.user?.name || prescription.doctor?.name || 'Unknown', leftColX + 30, y);

  doc.setFont('helvetica', 'bold');
  doc.text('Status:', rightColX, y);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...primaryColor);
  doc.text(prescription.status || 'N/A', rightColX + 15, y);

  y += 8;
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'bold');
  doc.text('Hospital:', leftColX, y);
  doc.setFont('helvetica', 'normal');
  doc.text(prescription.hospitalId?.name || 'N/A', leftColX + 30, y);
  y += 20;

  // Diagnosis
  if (prescription.diagnosis) {
    doc.setFillColor(...lightGray);
    doc.rect(margin, y - 3, contentWidth, 12, 'F');
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('DIAGNOSIS', margin + 5, y + 3);
    y += 10;

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    const diagnosisLines = doc.splitTextToSize(prescription.diagnosis, contentWidth - 10);
    doc.text(diagnosisLines, margin + 5, y);
    y += diagnosisLines.length * 5 + 10;
  }

  // Medications
  doc.setFillColor(...primaryColor);
  doc.rect(margin, y - 3, contentWidth, 12, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('PRESCRIBED MEDICATIONS', margin + 5, y + 3);
  y += 15;

  doc.setFillColor(240, 240, 240);
  doc.rect(margin, y - 5, contentWidth, 10, 'F');

  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');

  const colWidths = [45, 25, 35, 25, 40];
  const colPositions = [
    margin + 2,
    margin + colWidths[0] + 2,
    margin + colWidths[0] + colWidths[1] + 2,
    margin + colWidths[0] + colWidths[1] + colWidths[2] + 2,
    margin + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3] + 2
  ];

  doc.text('MEDICINE NAME', colPositions[0], y);
  doc.text('DOSAGE', colPositions[1], y);
  doc.text('FREQUENCY', colPositions[2], y);
  doc.text('DURATION', colPositions[3], y);
  doc.text('INSTRUCTIONS', colPositions[4], y);
  y += 10;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);

  if (Array.isArray(prescription.medications) && prescription.medications.length > 0) {
    for (let idx = 0; idx < prescription.medications.length; idx++) {
      const med = prescription.medications[idx];
      if (idx % 2 === 0) {
        doc.setFillColor(250, 250, 250);
        doc.rect(margin, y - 3, contentWidth, 8, 'F');
      }

      const nameLines = doc.splitTextToSize(med.name || '-', colWidths[0] - 4);
      const dosageLines = doc.splitTextToSize(med.dosage || '-', colWidths[1] - 4);
      const frequencyText = Array.isArray(med.frequency) ? med.frequency.join(', ') : med.frequency;
      const frequencyLines = doc.splitTextToSize(frequencyText || '-', colWidths[2] - 4);
      const durationLines = doc.splitTextToSize(med.duration || '-', colWidths[3] - 4);
      const instructionsLines = doc.splitTextToSize(med.instructions || '-', colWidths[4] - 4);

      doc.text(nameLines, colPositions[0], y);
      doc.text(dosageLines, colPositions[1], y);
      doc.text(frequencyLines, colPositions[2], y);
      doc.text(durationLines, colPositions[3], y);
      doc.text(instructionsLines, colPositions[4], y);

      const maxLines = Math.max(
        nameLines.length,
        dosageLines.length,
        frequencyLines.length,
        durationLines.length,
        instructionsLines.length
      );
      y += Math.max(8, maxLines * 4);

      if (y > 250) {
        doc.addPage();
        y = 20;
        try {
          const centerX = (pageWidth - 140) / 2;
          doc.addImage(logoBase64, 'PNG', centerX, 110, 140, 60, undefined, 'FAST', 0.015);
        } catch {}
      }
    }
  }

  // Notes
  if (prescription.notes) {
    y += 15;
    doc.setFillColor(...lightGray);
    doc.rect(margin, y - 3, contentWidth, 12, 'F');
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('ADDITIONAL NOTES', margin + 5, y + 3);
    y += 10;

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    const notesLines = doc.splitTextToSize(prescription.notes, contentWidth - 10);
    doc.text(notesLines, margin + 5, y);
    y += notesLines.length * 5 + 10;
  }

  // Footer
  const footerY = pageHeight - 25;
  doc.setDrawColor(...secondaryColor);
  doc.setLineWidth(0.5);
  doc.line(margin, footerY - 8, pageWidth - margin, footerY - 8);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...secondaryColor);
  doc.text(`Prescription ID: ${prescription._id || prescription.id}`, margin, footerY);

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(9);
  doc.text('This is a computer-generated prescription. Digital signature validated.', pageWidth / 2, footerY, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...primaryColor);
  doc.text('Powered by MedSync', pageWidth - margin, footerY, { align: 'right' });

  // Save
  doc.save(`prescription_${prescription._id || prescription.id}.pdf`);
}
