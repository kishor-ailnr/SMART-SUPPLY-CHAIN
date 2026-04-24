const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

function generateTripReport(vehicle, trip, events) {
  const doc = new PDFDocument({ margin: 50 });
  const filename = `Report_${vehicle.registration_number}_${Date.now()}.pdf`;
  const filePath = path.join(__dirname, '../../public/reports', filename);

  // Ensure directory exists
  if (!fs.existsSync(path.dirname(filePath))) {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
  }

  const stream = fs.createWriteStream(filePath);
  doc.pipe(stream);

  // Header
  doc.fontSize(25).text('ROADWAYS 2.0 - VOYAGE REPORT', { align: 'center' });
  doc.moveDown();
  doc.fontSize(10).text(`Generated: ${new Date().toLocaleString('en-IN')}`, { align: 'right' });
  doc.moveDown();

  // Vehicle Details
  doc.fontSize(16).text('VEHICLE INTELLIGENCE', { underline: true });
  doc.fontSize(12).text(`Registration: ${vehicle.registration_number}`);
  doc.text(`Driver: ${vehicle.driver_name}`);
  doc.text(`Vehicle Type: ${vehicle.vehicle_type}`);
  doc.text(`Cargo: ${vehicle.cargo_type} (${vehicle.load_weight_tons} Tonnes)`);
  doc.moveDown();

  // Trip Summary
  doc.fontSize(16).text('VOYAGE SUMMARY', { underline: true });
  doc.fontSize(12).text(`Origin: ${trip?.origin_name || 'N/A'}`);
  doc.text(`Destination: ${trip?.destination_name || 'N/A'}`);
  doc.text(`Status: ${trip?.status || 'ACTIVE'}`);
  doc.moveDown();

  // Intel Events
  doc.fontSize(16).text('CRITICAL INCIDENTS & ALERTS', { underline: true });
  doc.moveDown();
  events.forEach((event, index) => {
    doc.fontSize(10).text(`${index + 1}. [${event.severity}] ${event.title} - ${event.description}`);
    doc.text(`   Location: ${event.lat}, ${event.lng} | Confidence: ${Math.round(event.confidence_score * 100)}%`);
    doc.moveDown(0.5);
  });

  // Footer
  doc.fontSize(8).text('ROADWAYS 2.0 Intelligence Platform - India Operations', { align: 'center', bottom: 50 });

  doc.end();

  return filename;
}

module.exports = { generateTripReport };
