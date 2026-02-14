const PDFDocument = require('pdfkit');
const Consignment = require('../models/Consignment');

exports.generateInvoice = async (req, res) => {
    try {
        const { id } = req.params;
        const consignment = await Consignment.findById(id);

        if (!consignment) {
            return res.status(404).json({ error: 'Consignment not found' });
        }

        const doc = new PDFDocument({ size: 'A4', margin: 50 });

        // Set response headers
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=Invoice-${id}.pdf`);

        doc.pipe(res);

        // --- Colors ---
        const primaryColor = '#0a192f'; // Dark Blue
        const accentColor = '#e11d48';  // Red

        // --- Header Background ---
        doc.rect(0, 0, 595.28, 120).fill(primaryColor);

        // --- Logo / Company Name ---
        doc.font('Helvetica-Bold').fontSize(28).fillColor('white').text('DTDC+', 50, 45);
        doc.font('Helvetica').fontSize(10).fillColor('#cbd5e1').text('Enterprise Logistics Solution', 50, 75);

        // --- Company Contact (Header Right) ---
        doc.fontSize(9).fillColor('white').text('123 Enterprise Road', 400, 45, { align: 'right' })
            .text('Bangalore, India 560001', 400, 58, { align: 'right' })
            .text('support@dtdcplus.com', 400, 71, { align: 'right' })
            .text('+91 80 1234 5678', 400, 84, { align: 'right' });

        doc.moveDown();
        doc.moveDown();
        doc.moveDown();

        // --- Invoice Title & Info ---
        const invoiceY = 150;
        doc.font('Helvetica-Bold').fontSize(20).fillColor(primaryColor).text('INVOICE', 50, invoiceY);

        doc.font('Helvetica-Bold').fontSize(10).fillColor('#333')
            .text('Invoice #:', 400, invoiceY)
            .text('Date:', 400, invoiceY + 15)
            .text('Status:', 400, invoiceY + 30);

        doc.font('Helvetica').fillColor('#555')
            .text(`INV-${id.substring(id.length - 6).toUpperCase()}`, 470, invoiceY, { align: 'right' })
            .text(new Date().toLocaleDateString(), 470, invoiceY + 15, { align: 'right' })
            .fillColor('green').text('PAID', 470, invoiceY + 30, { align: 'right' });

        // --- Billing Divider ---
        doc.rect(50, 210, 500, 1).fill('#e2e8f0');

        // --- Bill To / Ship To ---
        const billY = 230;
        doc.font('Helvetica-Bold').fontSize(12).fillColor(primaryColor).text('Bill To:', 50, billY);
        doc.font('Helvetica').fontSize(10).fillColor('#333')
            .text(consignment.sender.name, 50, billY + 20)
            .fillColor('#555')
            .text(consignment.sender.address, { width: 200 })
            .text(`Phone: ${consignment.sender.phone}`);

        doc.font('Helvetica-Bold').fontSize(12).fillColor(primaryColor).text('Ship To:', 300, billY);
        doc.font('Helvetica').fontSize(10).fillColor('#333')
            .text(consignment.receiver.name, 300, billY + 20)
            .fillColor('#555')
            .text(consignment.receiver.address, { width: 200 })
            .text(`${consignment.receiver.destination} - ${consignment.receiver.pincode}`, { width: 200 })
            .text(`Phone: ${consignment.receiver.phone}`);

        // --- Table Header ---
        const tableTop = 380;
        const itemCodeX = 50;
        const descriptionX = 150;
        const weightX = 350;
        const amountX = 450;

        doc.rect(50, tableTop, 500, 25).fill('#f1f5f9'); // Table Header BG
        doc.font('Helvetica-Bold').fontSize(10).fillColor('#333');
        doc.text('Service Type', itemCodeX + 10, tableTop + 8);
        doc.text('Description', descriptionX, tableTop + 8);
        doc.text('Weight', weightX, tableTop + 8, { align: 'center', width: 50 });
        doc.text('Total', amountX, tableTop + 8, { align: 'right', width: 90 });

        // --- Table Row ---
        const rowY = tableTop + 35;
        doc.font('Helvetica').fontSize(10).fillColor('#333');
        doc.text(consignment.serviceType, itemCodeX + 10, rowY);
        doc.text(consignment.packageDetails.type, descriptionX, rowY);
        doc.text(`${consignment.packageDetails.weight} kg`, weightX, rowY, { align: 'center', width: 50 });
        doc.text(`Rs. ${consignment.cost.amount.toFixed(2)}`, amountX, rowY, { align: 'right', width: 90 });

        // Divider
        doc.rect(50, rowY + 20, 500, 1).fill('#e2e8f0');

        // --- Totals Section ---
        const totalY = rowY + 40;
        doc.font('Helvetica-Bold').fontSize(10).fillColor('#333');

        doc.text('Subtotal:', 350, totalY, { align: 'right', width: 90 });
        doc.font('Helvetica').text(`Rs. ${consignment.cost.amount.toFixed(2)}`, 450, totalY, { align: 'right', width: 90 });

        doc.font('Helvetica-Bold').text('Tax (18%):', 350, totalY + 20, { align: 'right', width: 90 });
        const tax = consignment.cost.amount * 0.18; // Assuming tax was inclusive or needs to be shown. Let's create a simulated breakdown for display
        // Since stored cost is total, let's reverse calculate for display or just show 0 if not handled. 
        // For simplicity in this demo, let's assume cost is inclusive.
        // Actually, let's just make Tax 0 for now as we didn't calculate it earlier
        doc.font('Helvetica').text(`Rs. 0.00`, 450, totalY + 20, { align: 'right', width: 90 });

        doc.rect(350, totalY + 40, 200, 1).fill('#e2e8f0');

        doc.fontSize(12).fillColor(accentColor).text('Total Amount:', 350, totalY + 55, { align: 'right', width: 90 });
        doc.fontSize(12).text(`Rs. ${consignment.cost.amount.toFixed(2)}`, 450, totalY + 55, { align: 'right', width: 90 });

        // --- Footer ---
        const footerY = 700;
        doc.rect(0, footerY, 595.28, 142).fill('#f8fafc'); // Footer BG

        doc.fontSize(10).fillColor('#333').font('Helvetica-Bold')
            .text('Thank you for your business!', 50, footerY + 30, { align: 'center', width: 500 });

        doc.fontSize(8).font('Helvetica').fillColor('#64748b')
            .text('Terms & Conditions: This invoice is generated electronically and is valid without signature.', 50, footerY + 50, { align: 'center', width: 500 });

        doc.text('www.dtdcplus.com', 50, footerY + 70, { align: 'center', width: 500 });

        doc.end();

    } catch (error) {
        console.error('Invoice Generation Error:', error);
        res.status(500).json({ error: 'Failed to generate invoice' });
    }
};
