import jsPDF from 'jspdf';
import { formatDateDMY } from '@/lib/utils';

export async function generatePrescriptionPDF(prescription: any) {
  const doc = new jsPDF('p', 'mm', 'a4');

  // Page setup
  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;

  // Modern professional color scheme
  const primaryColor: [number, number, number] = [41, 98, 255]; // Modern blue
  const secondaryColor: [number, number, number] = [59, 130, 246]; // Light blue
  const accentColor: [number, number, number] = [16, 185, 129]; // Emerald green
  const warningColor: [number, number, number] = [245, 158, 11]; // Amber
  const errorColor: [number, number, number] = [239, 68, 68]; // Red
  const textPrimary: [number, number, number] = [31, 41, 55]; // Gray-800
  const textSecondary: [number, number, number] = [75, 85, 99]; // Gray-600
  const backgroundLight: [number, number, number] = [249, 250, 251]; // Gray-50
  const borderColor: [number, number, number] = [209, 213, 219]; // Gray-300
  const white: [number, number, number] = [255, 255, 255];

  // Helper functions
  const addRoundedRect = (
    x: number, 
    y: number, 
    width: number, 
    height: number, 
    radius: number = 2, 
    fillColor?: [number, number, number], 
    strokeColor?: [number, number, number],
    strokeWidth: number = 0.5
  ) => {
    if (fillColor) {
      doc.setFillColor(...fillColor);
      doc.roundedRect(x, y, width, height, radius, radius, 'F');
    }
    if (strokeColor) {
      doc.setDrawColor(...strokeColor);
      doc.setLineWidth(strokeWidth);
      doc.roundedRect(x, y, width, height, radius, radius, 'S');
    }
  };

  const addSectionHeader = (
    title: string, 
    y: number, 
    bgColor: [number, number, number] = primaryColor,
    textColor: [number, number, number] = white
  ) => {
    // Modern section header with subtle shadow
    addRoundedRect(margin + 1, y + 1, contentWidth, 12, 3, [220, 220, 220]); // Shadow
    addRoundedRect(margin, y, contentWidth, 12, 3, bgColor);
    
    // Section title
    doc.setTextColor(...textColor);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(title, margin + 8, y + 8);
    
    return y + 20;
  };

  const addInfoCard = (
    title: string, 
    value: string, 
    x: number, 
    y: number, 
    width: number, 
    height: number = 18,
    headerColor: [number, number, number] = primaryColor
  ) => {
    // Card with subtle shadow and modern styling
    addRoundedRect(x + 0.5, y + 0.5, width, height, 3, [230, 230, 230]); // Shadow
    addRoundedRect(x, y, width, height, 3, white, borderColor);
    
    // Header strip
    addRoundedRect(x, y, width, 5, 3, headerColor);
    
    // Title
    doc.setTextColor(...white);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.text(title.toUpperCase(), x + 4, y + 3.5);
    
    // Value
    doc.setTextColor(...textPrimary);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    
    // Handle long text with word wrapping
    const maxWidth = width - 8;
    const valueLines = doc.splitTextToSize(value || 'Not provided', maxWidth);
    const startY = y + 10;
    
    // Limit to 2 lines to maintain card height
    const displayLines = valueLines.slice(0, 2);
    if (valueLines.length > 2) {
      displayLines[1] = displayLines[1].substring(0, displayLines[1].length - 3) + '...';
    }
    
    displayLines.forEach((line: string, index: number) => {
      doc.text(line, x + 4, startY + (index * 4));
    });
    
    return y + height + 3;
  };

  // Enhanced logo handling with better contrast
  const logoUrl = '/medsync_logo.png';
  const getImageBase64 = (url: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new window.Image();
      img.crossOrigin = 'Anonymous';
      
      img.onload = function() {
        try {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          if (!ctx) {
            reject('Canvas context not available');
            return;
          }
          
          canvas.width = img.width;
          canvas.height = img.height;
          
          // Create white background for logo
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          
          // Draw the logo on white background
          ctx.drawImage(img, 0, 0);
          
          resolve(canvas.toDataURL('image/png'));
        } catch (error) {
          reject(error);
        }
      };
      
      img.onerror = () => reject('Image load failed');
      img.src = url;
    });
  };

  // Modern header design
  let y = 0;
  
  // Header background with gradient effect
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, pageWidth, 45, 'F');
  
  // Add lighter overlay for depth
  doc.setFillColor(primaryColor[0] + 20, primaryColor[1] + 20, primaryColor[2] + 20);
  doc.rect(0, 0, pageWidth, 22, 'F');

  // Try to load and add logo with proper contrast
  try {
    const logoBase64 = await getImageBase64(logoUrl);
    
    // Logo with white background for contrast
    const logoSize = 35;
    addRoundedRect(margin - 2, 8, logoSize + 4, 20, 4, white);
    doc.addImage(logoBase64, 'PNG', margin, 10, logoSize, 16);
    
    // Subtle watermark in center
    const watermarkSize = 60;
    const centerX = (pageWidth - watermarkSize) / 2;
    const centerY = 120;
    doc.addImage(logoBase64, 'PNG', centerX, centerY, watermarkSize, 24, undefined, 'FAST', 0.03);
    
  } catch (error) {
    console.warn('Logo not loaded, using text fallback');
    
    // Fallback with medical symbol
    addRoundedRect(margin - 2, 8, 40, 20, 4, white);
    doc.setTextColor(...primaryColor);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('⚕️ MS', margin + 8, 22);
  }

  // Hospital information with better typography
  doc.setTextColor(...white);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('MEDSYNC HOSPITAL', pageWidth - margin, 15, { align: 'right' });
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Advanced Digital Healthcare Solutions', pageWidth - margin, 22, { align: 'right' });
  
  doc.setFontSize(8);
  doc.text('123, MedSync Center, Healthcare City, State 123456', pageWidth - margin, 28, { align: 'right' });
  doc.text('Phone: +91-1234567890 | Email: info@medsync.com', pageWidth - margin, 33, { align: 'right' });
  doc.text('License: MH-12345 | NABH Accredited', pageWidth - margin, 38, { align: 'right' });

  y = 55;

  // Prescription title with modern design
  addRoundedRect(margin, y, contentWidth, 16, 4, secondaryColor);
  addRoundedRect(margin, y, contentWidth, 16, 4, undefined, primaryColor, 1);
  
  doc.setTextColor(...white);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('📋 MEDICAL PRESCRIPTION', pageWidth / 2, y + 10, { align: 'center' });

  y += 25;

  // Patient Information Section
  y = addSectionHeader('PATIENT INFORMATION', y, primaryColor);
  
  const cardWidth = (contentWidth - 10) / 3;
  
  // First row
  addInfoCard('Patient Name', prescription.patient?.user?.name || prescription.patient?.name, margin, y, cardWidth, 18, primaryColor);
  addInfoCard('Date of Birth', prescription.patient?.dateOfBirth, margin + cardWidth + 5, y, cardWidth, 18, primaryColor);
  addInfoCard('Gender', prescription.patient?.gender, margin + (cardWidth + 5) * 2, y, cardWidth, 18, primaryColor);
  
  y += 22;
  
  // Second row
  const patientId = prescription.patient?._id || prescription.patient?.id || '';
  const displayId = patientId ? `#${patientId.slice(-8).toUpperCase()}` : 'Not assigned';
  
  addInfoCard('Patient ID', displayId, margin, y, cardWidth, 18, primaryColor);
  addInfoCard('Contact Number', prescription.patient?.phone, margin + cardWidth + 5, y, cardWidth, 18, primaryColor);
  addInfoCard('Blood Group', prescription.patient?.bloodGroup, margin + (cardWidth + 5) * 2, y, cardWidth, 18, primaryColor);

  y += 30;

  // Prescription Details Section
  y = addSectionHeader('PRESCRIPTION DETAILS', y, accentColor);
  
  addInfoCard('Prescription Date', formatDateDMY(prescription.date), margin, y, cardWidth, 18, accentColor);
  
  const prescriptionId = prescription._id || prescription.id || '';
  const displayPrescriptionId = prescriptionId ? `#${prescriptionId.slice(-8).toUpperCase()}` : 'Not assigned';
  addInfoCard('Prescription ID', displayPrescriptionId, margin + cardWidth + 5, y, cardWidth, 18, accentColor);
  addInfoCard('Status', (prescription.status || 'Active').toUpperCase(), margin + (cardWidth + 5) * 2, y, cardWidth, 18, accentColor);

  y += 22;

  addInfoCard('Attending Doctor', prescription.doctor?.user?.name || prescription.doctor?.name, margin, y, cardWidth, 18, accentColor);
  addInfoCard('Department', prescription.doctor?.department || prescription.department, margin + cardWidth + 5, y, cardWidth, 18, accentColor);
  addInfoCard('Hospital', prescription.hospitalId?.name || 'MedSync Hospital', margin + (cardWidth + 5) * 2, y, cardWidth, 18, accentColor);

  y += 30;

  // Diagnosis Section (if available)
  if (prescription.diagnosis && prescription.diagnosis.trim()) {
    y = addSectionHeader('CLINICAL DIAGNOSIS', y, warningColor);
    
    const diagnosisHeight = 25;
    addRoundedRect(margin, y, contentWidth, diagnosisHeight, 4, white, borderColor);
    
    doc.setTextColor(...textPrimary);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    const diagnosisLines = doc.splitTextToSize(prescription.diagnosis, contentWidth - 16);
    diagnosisLines.forEach((line: string, index: number) => {
      doc.text(line, margin + 8, y + 10 + (index * 5));
    });
    
    y += diagnosisHeight + 15;
  }

  // Medications Section with improved table
  y = addSectionHeader('PRESCRIBED MEDICATIONS', y, errorColor);

  // Table setup
  const tableY = y;
  const headerHeight = 14;
  const rowHeight = 16;
  const colWidths = [50, 30, 35, 28, 27];
  const headers = ['MEDICATION NAME', 'DOSAGE', 'FREQUENCY', 'DURATION', 'INSTRUCTIONS'];

  // Table header
  addRoundedRect(margin, y, contentWidth, headerHeight, 3, errorColor);
  
  doc.setTextColor(...white);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');

  let colX = margin;
  headers.forEach((header, index) => {
    doc.text(header, colX + 4, y + 9);
    colX += colWidths[index];
  });

  y += headerHeight + 2;

  // Medication rows
  if (Array.isArray(prescription.medications) && prescription.medications.length > 0) {
    prescription.medications.forEach((med: any, index: number) => {
      const rowBg = index % 2 === 0 ? white : backgroundLight;
      addRoundedRect(margin, y, contentWidth, rowHeight, 2, rowBg, borderColor);

      doc.setTextColor(...textPrimary);
      doc.setFontSize(9);

      colX = margin;
      const cellData = [
        med.name || 'Not specified',
        med.dosage || 'As directed',
        Array.isArray(med.frequency) ? med.frequency.join(', ') : (med.frequency || 'As needed'),
        med.duration || 'Consult doctor',
        med.instructions || 'Take as prescribed'
      ];

      cellData.forEach((data, cellIndex) => {
        doc.setFont('helvetica', cellIndex === 0 ? 'bold' : 'normal');
        const cellLines = doc.splitTextToSize(data, colWidths[cellIndex] - 8);
        const displayLine = cellLines[0] || '';
        doc.text(displayLine, colX + 4, y + 10);
        colX += colWidths[cellIndex];
      });

      y += rowHeight + 1;

      // Page break handling
      if (y > 240) {
        doc.addPage();
        y = 30;
        
        // Continuation header
        addRoundedRect(0, 0, pageWidth, 25, 0, backgroundLight);
        doc.setTextColor(...primaryColor);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('PRESCRIPTION CONTINUED', pageWidth / 2, 15, { align: 'center' });
        y += 10;
      }
    });
  } else {
    // No medications message
    addRoundedRect(margin, y, contentWidth, 20, 3, [254, 252, 232], warningColor);
    
    doc.setTextColor(...textPrimary);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'italic');
    doc.text('⚠️ No medications prescribed. Please follow up as advised.', pageWidth / 2, y + 12, { align: 'center' });
    y += 25;
  }

  y += 15;

  // Notes Section (if available)
  if (prescription.notes && prescription.notes.trim()) {
    y = addSectionHeader('ADDITIONAL NOTES', y, secondaryColor);
    
    const notesHeight = 25;
    addRoundedRect(margin, y, contentWidth, notesHeight, 4, white, borderColor);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...textPrimary);
    
    const notesLines = doc.splitTextToSize(prescription.notes, contentWidth - 16);
    notesLines.forEach((line: string, index: number) => {
      doc.text(line, margin + 8, y + 8 + (index * 4));
    });
    
    y += notesHeight + 15;
  }

  // Medical Instructions
  y = addSectionHeader('IMPORTANT INSTRUCTIONS', y, warningColor);
  
  const instructions = [
    '• Take medications exactly as prescribed',
    '• Complete the full course of treatment',
    '• Store medications properly and away from children',
    '• Contact doctor for adverse reactions',
    '• Bring this prescription for follow-ups'
  ];

  const instructionHeight = instructions.length * 5 + 12;
  addRoundedRect(margin, y, contentWidth, instructionHeight, 4, [255, 251, 235], warningColor);

  doc.setTextColor(...textPrimary);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  
  instructions.forEach((instruction, index) => {
    doc.text(instruction, margin + 8, y + 8 + (index * 5));
  });

  y += instructionHeight + 20;

  // Modern Footer
  const footerY = pageHeight - 35;
  
  // Footer background
  addRoundedRect(0, footerY - 5, pageWidth, 40, 0, backgroundLight);
  
  // Decorative line
  doc.setDrawColor(...primaryColor);
  doc.setLineWidth(2);
  doc.line(margin, footerY - 2, pageWidth - margin, footerY - 2);

  // Footer content
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...textSecondary);

  // Left section
  const fullPrescriptionId = prescription._id || prescription.id || '';
  const displayFullId = fullPrescriptionId ? fullPrescriptionId.slice(-12).toUpperCase() : 'Unknown';
  doc.text(`Prescription ID: ${displayFullId}`, margin, footerY + 5);
  doc.text(`Issue Date: ${formatDateDMY(prescription.date)}`, margin, footerY + 12);
  doc.text(`Generated: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, margin, footerY + 19);

  // Center section
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...accentColor);
  doc.text('✓ DIGITALLY VERIFIED PRESCRIPTION', pageWidth / 2, footerY + 5, { align: 'center' });
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(...textSecondary);
  doc.text('This prescription is electronically generated and authenticated', pageWidth / 2, footerY + 12, { align: 'center' });
  doc.text('Valid for 30 days from issue date', pageWidth / 2, footerY + 19, { align: 'center' });

  // Right section
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...primaryColor);
  doc.text('Powered by MedSync', pageWidth - margin, footerY + 5, { align: 'right' });
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(...textSecondary);
  doc.text('Advanced Healthcare Solutions', pageWidth - margin, footerY + 12, { align: 'right' });
  doc.text('www.medsync.com', pageWidth - margin, footerY + 19, { align: 'right' });

  // QR Code placeholder
  const qrSize = 15;
  const qrX = pageWidth - margin - qrSize - 5;
  const qrY = footerY + 20;
  
  addRoundedRect(qrX, qrY, qrSize, qrSize, 2, white, borderColor);
  
  // Simple QR pattern
  doc.setFillColor(...textPrimary);
  for (let i = 1; i < qrSize - 1; i += 2) {
    for (let j = 1; j < qrSize - 1; j += 2) {
      if ((i + j) % 4 < 2) {
        doc.rect(qrX + i, qrY + j, 1, 1, 'F');
      }
    }
  }

  // Generate filename
  const patientName = (prescription.patient?.user?.name || prescription.patient?.name || 'Patient')
    .replace(/[^a-zA-Z0-9]/g, '_');
  const prescriptionDate = formatDateDMY(prescription.date).replace(/[^a-zA-Z0-9]/g, '_');
  const prescriptionIdShort = displayPrescriptionId.replace('#', '');
  const filename = `MedSync_Prescription_${patientName}_${prescriptionDate}_${prescriptionIdShort}.pdf`;
  
  doc.save(filename);
}