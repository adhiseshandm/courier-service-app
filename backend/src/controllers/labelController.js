const PDFDocument = require('pdfkit');
const bwipjs = require('bwip-js');
const Consignment = require('../models/Consignment');
const path = require('path');

exports.generateLabel = async (req, res) => {
    try {
        const { consignmentId } = req.params;
        const consignment = await Consignment.findById(consignmentId);

        if (!consignment) {
            return res.status(404).json({ error: 'Consignment not found' });
        }

        // Create a document (4x6 inches for label printers)
        const doc = new PDFDocument({
            size: [288, 432], // 4x6 inches in points (72 DPI)
            margin: 10
        });

        // Set response headers
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `inline; filename=label-${consignmentId}.pdf`);

        doc.pipe(res);

        // --- Logo / Header ---
        doc.fontSize(18).font('Helvetica-Bold').text('DTDC+', { align: 'center' });
        doc.fontSize(8).font('Helvetica').text('Enterprise Courier Service', { align: 'center' });

        doc.moveDown();
        doc.lineWidth(2).moveTo(10, doc.y).lineTo(278, doc.y).stroke();
        doc.moveDown();

        // --- Barcode Generation ---
        const barcodeBuffer = await bwipjs.toBuffer({
            bcid: 'code128',       // Barcode type
            text: consignment._id.toString(),    // Text to encode
            scale: 3,              // 3x scaling factor
            height: 10,            // Bar height, in millimeters
            includetext: true,     // Show human-readable text
            textxalign: 'center',  // Always good to align this
        });

        const barcodeY = doc.y + 10;
        doc.image(barcodeBuffer, 44, barcodeY, { width: 200, align: 'center' }); // Centered roughly
        doc.y = barcodeY + 60; // Move cursor past barcode

        // --- Shipping Details ---
        doc.moveDown();

        // Sender box
        const startY = doc.y;
        doc.rect(10, startY, 268, 80).stroke();
        doc.fontSize(8).font('Helvetica-Bold').text('FROM:', 15, startY + 5);
        doc.font('Helvetica').fontSize(10).text(consignment.sender.name, 15, startY + 15);
        doc.fontSize(8).text(consignment.sender.address, { width: 250 });
        doc.text(`Phone: ${consignment.sender.phone}`);

        // Receiver box
        const receiverY = startY + 90;
        doc.rect(10, receiverY, 268, 100).stroke();
        doc.fontSize(10).font('Helvetica-Bold').text('TO:', 15, receiverY + 5);
        doc.fontSize(14).text(consignment.receiver.name, 15, receiverY + 20);
        doc.fontSize(10).font('Helvetica').text(consignment.receiver.address, { width: 250 });
        doc.text(`${consignment.receiver.destination} - ${consignment.receiver.pincode}`);
        doc.font('Helvetica-Bold').text(`Phone: ${consignment.receiver.phone}`, { continued: false });

        // --- Footer Info ---
        const footerY = receiverY + 110;

        doc.fontSize(12).font('Helvetica-Bold').text(consignment.serviceType.toUpperCase(), 15, footerY);
        doc.fontSize(10).font('Helvetica').text(`Weight: ${consignment.packageDetails.weight} kg`, 15, footerY + 15);

        // Date
        const dateStr = new Date(consignment.bookingDate).toLocaleDateString();
        doc.text(`Date: ${dateStr}`, 180, footerY);

        // Branch
        doc.moveDown();
        doc.fontSize(8).text(`Processed by: ${consignment.branch || 'Main Branch'}`, 15, footerY + 40, { align: 'center', width: 258 });

        // Finalize PDF file
        doc.end();

    } catch (error) {
        console.error('Label Generation Error:', error);
        res.status(500).json({ error: 'Failed to generate label' });
    }
};
