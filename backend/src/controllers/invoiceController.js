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

        // --- Header ---
        doc.fillColor('#444444')
            .fontSize(20)
            .text('DTDC+ Courier Service', 50, 57)
            .fontSize(10)
            .text('123 Enterprise Road', 200, 65, { align: 'right' })
            .text('Bangalore, India 560001', 200, 80, { align: 'right' })
            .moveDown();

        // --- Invoice Details ---
        doc.text(`Invoice Number: INV-${id.substring(id.length - 6).toUpperCase()}`, 50, 200)
            .text(`Invoice Date: ${new Date().toLocaleDateString()}`, 50, 215)
            .text(`Consignment ID: ${id}`, 50, 230)
            .moveDown();

        // --- Customer Details ---
        doc.text(`Bill To:`, 50, 260)
            .font('Helvetica-Bold')
            .text(consignment.sender.name, 50, 275)
            .font('Helvetica')
            .text(consignment.sender.address)
            .text(`Phone: ${consignment.sender.phone}`)
            .moveDown();

        // --- Table Header ---
        const tableTop = 350;
        doc.font('Helvetica-Bold');
        doc.text('Description', 50, tableTop)
            .text('Weight (kg)', 280, tableTop, { width: 90, align: 'right' })
            .text('Amount (INR)', 370, tableTop, { width: 90, align: 'right' });

        doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke();

        // --- Table Body ---
        let position = tableTop + 30;
        doc.font('Helvetica');

        doc.text(`${consignment.serviceType} Delivery - ${consignment.packageDetails.type}`, 50, position)
            .text(consignment.packageDetails.weight.toString(), 280, position, { width: 90, align: 'right' })
            .text(consignment.cost.amount.toFixed(2), 370, position, { width: 90, align: 'right' });

        doc.moveTo(50, position + 20).lineTo(550, position + 20).stroke();

        // --- Totals ---
        const subtotalPosition = position + 40;
        doc.font('Helvetica-Bold');
        doc.text('Total:', 280, subtotalPosition, { width: 90, align: 'right' })
            .text(`Rs. ${consignment.cost.amount.toFixed(2)}`, 370, subtotalPosition, { width: 90, align: 'right' });

        // --- Footer ---
        doc.fontSize(10).text('Thank you for your business.', 50, 700, { align: 'center', width: 500 });

        doc.end();

    } catch (error) {
        console.error('Invoice Generation Error:', error);
        res.status(500).json({ error: 'Failed to generate invoice' });
    }
};
