import PDFDocument from 'pdfkit';
import fs from 'fs';

export const generateInvoicePDF = (appointment, outputPath) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const stream = fs.createWriteStream(outputPath);
    doc.pipe(stream);

    doc.fontSize(20).text('INVOICE', { align: 'center' });
    doc.moveDown();

    doc.fontSize(12).text(`Invoice #: ${appointment._id}`);
    doc.text(`Date: ${new Date(appointment.date).toDateString()}`);
    doc.text(`Time: ${appointment.startTime} - ${appointment.endTime}`);
    doc.moveDown();

    doc.text('Services:');
    appointment.services.forEach((s) => {
      const price = s.discountPrice ?? s.price;
      doc.text(`  - ${s.name} (${s.duration} min): ₹${price}`);
    });
    doc.moveDown();

    doc.text(`Subtotal: ₹${appointment.totalAmount - appointment.taxAmount}`);
    doc.text(`Tax (${process.env.TAX_RATE_PERCENT || 18}%): ₹${appointment.taxAmount}`);
    if (appointment.discountAmount > 0) doc.text(`Discount: -₹${appointment.discountAmount}`);
    if (appointment.tipAmount > 0) doc.text(`Tip: ₹${appointment.tipAmount}`);
    doc.fontSize(14).text(`Total: ₹${appointment.totalAmount + appointment.tipAmount}`, { underline: true });
    doc.moveDown();
    doc.fontSize(10).text('Payment Method: ' + appointment.paymentMethod);
    doc.text('Thank you for your visit!', { align: 'center' });

    doc.end();
    stream.on('finish', () => resolve(outputPath));
    stream.on('error', reject);
  });
};
