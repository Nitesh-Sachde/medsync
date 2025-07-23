import jsPDF from 'jspdf';
import { formatDateDMY } from '@/lib/utils';

export async function generatePrescriptionPDF(prescription: any) {
  const doc = new jsPDF('p', 'mm', 'a4');

  // Page setup
  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;

  // Enhanced theme colors
  const primaryColor: [number, number, number] = [41, 128, 185]; // Professional blue
  const accentColor: [number, number, number] = [52, 152, 219]; // Lighter blue
  const successColor: [number, number, number] = [39, 174, 96]; // Green for status
  const warningColor: [number, number, number] = [243, 156, 18]; // Orange for warnings
  const textColor: [number, number, number] = [52, 73, 94]; // Dark gray
  const lightGray: [number, number, number] = [248, 249, 250]; // Very light gray
  const borderColor: [number, number, number] = [189, 195, 199]; // Medium gray

  // Helper functions for better layout
  const addRoundedRect = (x: number, y: number, width: number, height: number, radius: number = 2) => {
    doc.roundedRect(x, y, width, height, radius, radius, 'S');
  };

  const addSectionHeader = (title: string, y: number, bgColor: [number, number, number] = primaryColor) => {
    doc.setFillColor(...bgColor);
    doc.roundedRect(margin, y - 4, contentWidth, 12, 2, 2, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(title, margin + 8, y + 4);
    return y + 12;
  };

  const addInfoBox = (title: string, value: string, x: number, y: number, width: number) => {
    doc.setFillColor(...lightGray);
    doc.roundedRect(x, y - 2, width, 10, 1, 1, 'F');
    doc.setDrawColor(...borderColor);
    doc.setLineWidth(0.3);
    doc.roundedRect(x, y - 2, width, 10, 1, 1, 'S');
    
    doc.setTextColor(...textColor);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text(title.toUpperCase(), x + 3, y + 1);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(value, x + 3, y + 5.5);
  };

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

  // Enhanced logo and header section
  let logoBase64 = '';
  try {
    logoBase64 = await getImageBase64(logoUrl);

    // Modern header background
    doc.setFillColor(...primaryColor);
    doc.roundedRect(0, 0, pageWidth, 45, 0, 0, 'F');

    // Add logo with better positioning
    const logoWidth = 35;
    const logoHeight = 14;
    doc.addImage(logoBase64, 'PNG', margin, 12, logoWidth, logoHeight);

    // Subtle watermark in center
    const watermarkWidth = 120;
    const watermarkHeight = 50;
    const centerX = (pageWidth - watermarkWidth) / 2;
    const centerY = 120;
    doc.addImage(logoBase64, 'PNG', centerX, centerY, watermarkWidth, watermarkHeight, undefined, 'FAST', 0.08);
  } catch (error) {
    console.warn('Logo not loaded. Proceeding without logo.');
    // Fallback header without logo
    doc.setFillColor(...primaryColor);
    doc.roundedRect(0, 0, pageWidth, 45, 0, 0, 'F');
  }

  // Hospital information in header
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('MEDSYNC HOSPITAL', pageWidth - margin, 18, { align: 'right' });

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Advanced Healthcare Solutions', pageWidth - margin, 25, { align: 'right' });
  doc.text('📍 123, MedSync Center, Healthcare City, State 123456', pageWidth - margin, 30, { align: 'right' });
  doc.text('📞 +91-1234567890 | 📧 info@medsync.com', pageWidth - margin, 35, { align: 'right' });

  // Prescription title with enhanced styling
  let y = 55;
  doc.setFillColor(...accentColor);
  doc.roundedRect(margin, y, contentWidth, 16, 3, 3, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('MEDICAL PRESCRIPTION', pageWidth / 2, y + 10, { align: 'center' });

  y += 25;

  // Enhanced Patient Information Section
  y = addSectionHeader('👤 PATIENT INFORMATION', y, primaryColor);
  
  // Patient info in organized boxes
  const boxWidth = (contentWidth - 10) / 3;
  const boxY = y + 5;
  
  addInfoBox('Patient Name', prescription.patient?.user?.name || prescription.patient?.name || 'Unknown', margin, boxY, boxWidth);
  addInfoBox('Date', formatDateDMY(prescription.date), margin + boxWidth + 5, boxY, boxWidth);
  addInfoBox('Prescription ID', `#${(prescription._id || prescription.id || '').slice(-8).toUpperCase()}`, margin + (boxWidth + 5) * 2, boxY, boxWidth);

  y += 18;
  
  addInfoBox('Attending Doctor', prescription.doctor?.user?.name || prescription.doctor?.name || 'Unknown', margin, y, boxWidth);
  addInfoBox('Status', prescription.status || 'Pending', margin + boxWidth + 5, y, boxWidth);
  addInfoBox('Hospital', prescription.hospitalId?.name || 'MedSync Hospital', margin + (boxWidth + 5) * 2, y, boxWidth);

  y += 25;

  // Enhanced Diagnosis Section
  if (prescription.diagnosis) {
    y = addSectionHeader('🩺 DIAGNOSIS', y, successColor);
    
    // Diagnosis in a bordered box
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(margin, y, contentWidth, 20, 2, 2, 'F');
    doc.setDrawColor(...borderColor);
    doc.setLineWidth(0.5);
    doc.roundedRect(margin, y, contentWidth, 20, 2, 2, 'S');

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...textColor);
    const diagnosisLines = doc.splitTextToSize(prescription.diagnosis, contentWidth - 16);
    doc.text(diagnosisLines, margin + 8, y + 8);
    
    const diagnosisHeight = Math.max(20, diagnosisLines.length * 5 + 10);
    y += diagnosisHeight + 10;
  }

  // Enhanced Medications Section
  y = addSectionHeader('💊 PRESCRIBED MEDICATIONS', y, warningColor);

  // Professional medication table
  const tableStartY = y;
  const rowHeight = 12;
  const headerHeight = 15;

  // Table structure
  const colWidths = [50, 30, 35, 25, 30];
  const colHeaders = ['MEDICATION NAME', 'DOSAGE', 'FREQUENCY', 'DURATION', 'INSTRUCTIONS'];
  let colX = margin;

  // Table header with gradient background
  doc.setFillColor(...accentColor);
  doc.roundedRect(margin, y, contentWidth, headerHeight, 2, 2, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');

  for (let i = 0; i < colHeaders.length; i++) {
    doc.text(colHeaders[i], colX + 3, y + 9);
    colX += colWidths[i];
  }

  y += headerHeight + 3;

  // Medication rows with alternating colors
  if (Array.isArray(prescription.medications) && prescription.medications.length > 0) {
    for (let idx = 0; idx < prescription.medications.length; idx++) {
      const med = prescription.medications[idx];
      
      // Alternating row colors
      if (idx % 2 === 0) {
        doc.setFillColor(252, 252, 252);
        doc.roundedRect(margin, y - 2, contentWidth, rowHeight, 1, 1, 'F');
      }

      // Row border
      doc.setDrawColor(...borderColor);
      doc.setLineWidth(0.3);
      doc.roundedRect(margin, y - 2, contentWidth, rowHeight, 1, 1, 'S');

      // Cell content
      doc.setTextColor(...textColor);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');

      colX = margin;
      const cellPadding = 3;

      // Medicine name (bold)
      doc.setFont('helvetica', 'bold');
      const nameLines = doc.splitTextToSize(med.name || 'Not specified', colWidths[0] - 6);
      doc.text(nameLines, colX + cellPadding, y + 4);
      colX += colWidths[0];

      doc.setFont('helvetica', 'normal');

      // Dosage
      const dosageLines = doc.splitTextToSize(med.dosage || '-', colWidths[1] - 6);
      doc.text(dosageLines, colX + cellPadding, y + 4);
      colX += colWidths[1];

      // Frequency
      const frequencyText = Array.isArray(med.frequency) ? med.frequency.join(', ') : med.frequency;
      const frequencyLines = doc.splitTextToSize(frequencyText || '-', colWidths[2] - 6);
      doc.text(frequencyLines, colX + cellPadding, y + 4);
      colX += colWidths[2];

      // Duration
      const durationLines = doc.splitTextToSize(med.duration || '-', colWidths[3] - 6);
      doc.text(durationLines, colX + cellPadding, y + 4);
      colX += colWidths[3];

      // Instructions
      const instructionsLines = doc.splitTextToSize(med.instructions || '-', colWidths[4] - 6);
      doc.text(instructionsLines, colX + cellPadding, y + 4);

      y += rowHeight + 1;

      // Page break check
      if (y > 240) {
        doc.addPage();
        y = 30;
        try {
          if (logoBase64) {
            const centerX = (pageWidth - 120) / 2;
            doc.addImage(logoBase64, 'PNG', centerX, 120, 120, 50, undefined, 'FAST', 0.08);
          }
        } catch {}
      }
    }
  } else {
    // No medications message
    doc.setFillColor(255, 249, 235);
    doc.roundedRect(margin, y, contentWidth, 20, 2, 2, 'F');
    doc.setDrawColor(...borderColor);
    doc.roundedRect(margin, y, contentWidth, 20, 2, 2, 'S');
    
    doc.setTextColor(...textColor);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'italic');
    doc.text('No medications prescribed at this time.', pageWidth / 2, y + 12, { align: 'center' });
    y += 25;
  }

  y += 10;

  // Enhanced Notes Section
  if (prescription.notes) {
    y = addSectionHeader('📝 ADDITIONAL NOTES', y, accentColor);
    
    // Notes in a styled box
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(margin, y, contentWidth, 25, 2, 2, 'F');
    doc.setDrawColor(...borderColor);
    doc.setLineWidth(0.5);
    doc.roundedRect(margin, y, contentWidth, 25, 2, 2, 'S');

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...textColor);
    const notesLines = doc.splitTextToSize(prescription.notes, contentWidth - 16);
    doc.text(notesLines, margin + 8, y + 8);
    
    const notesHeight = Math.max(25, notesLines.length * 5 + 10);
    y += notesHeight + 15;
  }

  // Important medical disclaimers
  y = addSectionHeader('⚠️ IMPORTANT INSTRUCTIONS', y, warningColor);
  
  const disclaimers = [
    '• Take medications exactly as prescribed by your doctor',
    '• Complete the full course of treatment even if you feel better',
    '• Do not share medications with others',
    '• Store medications in a cool, dry place away from children',
    '• Contact your doctor immediately if you experience adverse reactions',
    '• Bring this prescription for follow-up appointments'
  ];

  doc.setFillColor(255, 252, 240);
  doc.roundedRect(margin, y, contentWidth, disclaimers.length * 6 + 8, 2, 2, 'F');
  doc.setDrawColor(...borderColor);
  doc.setLineWidth(0.5);
  doc.roundedRect(margin, y, contentWidth, disclaimers.length * 6 + 8, 2, 2, 'S');

  doc.setTextColor(...textColor);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  
  disclaimers.forEach((disclaimer, index) => {
    doc.text(disclaimer, margin + 8, y + 8 + (index * 6));
  });

  y += disclaimers.length * 6 + 20;

  // Enhanced Footer Section
  const footerY = pageHeight - 35;
  
  // Footer background
  doc.setFillColor(...lightGray);
  doc.roundedRect(0, footerY - 5, pageWidth, 40, 0, 0, 'F');
  
  // Decorative line
  doc.setDrawColor(...primaryColor);
  doc.setLineWidth(1.5);
  doc.line(margin, footerY - 3, pageWidth - margin, footerY - 3);

  // Footer content in three columns
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...textColor);
  doc.text(`📋 Prescription ID: ${(prescription._id || prescription.id || '').slice(-12).toUpperCase()}`, margin, footerY + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(`📅 Generated: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, margin, footerY + 12);

  // Center - Digital signature info
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(9);
  doc.setTextColor(...primaryColor);
  doc.text('✓ Digitally Verified Prescription', pageWidth / 2, footerY + 5, { align: 'center' });
  doc.text('This prescription is electronically generated and verified', pageWidth / 2, footerY + 12, { align: 'center' });

  // Right - MedSync branding
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...primaryColor);
  doc.text('Powered by MedSync', pageWidth - margin, footerY + 5, { align: 'right' });
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text('Advanced Healthcare Solutions', pageWidth - margin, footerY + 12, { align: 'right' });

  // QR Code placeholder (visual representation)
  doc.setDrawColor(...borderColor);
  doc.setLineWidth(0.5);
  doc.rect(pageWidth - margin - 15, footerY + 15, 12, 12, 'S');
  doc.setFontSize(6);
  doc.text('QR', pageWidth - margin - 9, footerY + 22, { align: 'center' });

  // Save with enhanced filename
  const patientName = (prescription.patient?.user?.name || prescription.patient?.name || 'Patient').replace(/[^a-zA-Z0-9]/g, '_');
  const prescriptionDate = formatDateDMY(prescription.date).replace(/[^a-zA-Z0-9]/g, '_');
  const filename = `MedSync_Prescription_${patientName}_${prescriptionDate}.pdf`;
  
  doc.save(filename);
}
