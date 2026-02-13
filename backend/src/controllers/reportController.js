const Consignment = require('../models/Consignment');
const ExcelJS = require('exceljs');

exports.exportMonthlyReport = async (req, res) => {
    try {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Monthly Report');

        worksheet.columns = [
            { header: 'Booking ID', key: '_id', width: 25 },
            { header: 'Date', key: 'bookingDate', width: 20 },
            { header: 'Sender Name', key: 'senderName', width: 20 },
            { header: 'Receiver Destination', key: 'destination', width: 20 },
            { header: 'Service Type', key: 'serviceType', width: 15 },
            { header: 'Weight (kg)', key: 'weight', width: 15 },
            { header: 'Cost (INR)', key: 'cost', width: 15 },
            { header: 'Status', key: 'status', width: 15 },
            { header: 'Branch', key: 'branch', width: 20 },
            { header: 'Processed By', key: 'processedBy', width: 15 },
        ];

        const matchStage = {};
        if (req.query.branch && req.query.branch !== 'All Branches') {
            matchStage.branch = req.query.branch;
        }
        if (req.user.branch && req.user.branch !== 'Headquarters' && req.user.branch !== 'Main Branch') {
            matchStage.branch = req.user.branch;
        }

        const consignments = await Consignment.find(matchStage).populate('processedBy', 'username');

        consignments.forEach(c => {
            worksheet.addRow({
                _id: c._id.toString(),
                bookingDate: c.bookingDate.toISOString().split('T')[0],
                senderName: c.sender.name,
                destination: c.receiver.destination,
                serviceType: c.serviceType,
                weight: c.packageDetails.weight,
                cost: c.cost.amount,
                status: c.status,
                branch: c.branch || 'N/A',
                processedBy: c.processedBy ? c.processedBy.username : 'System'
            });
        });

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=' + 'monthly-report.xlsx');

        await workbook.xlsx.write(res);
        res.end();

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to generate report' });
    }
};

exports.getDashboardStats = async (req, res) => {
    try {
        const matchStage = {};

        // If query param 'branch' is provided (and user is admin), use it
        // OR: If user is restricted to a branch, force it.

        if (req.query.branch && req.query.branch !== 'All Branches') {
            matchStage.branch = req.query.branch;
        }

        // Force branch restriction for non-HQ users
        if (req.user.branch && req.user.branch !== 'Headquarters' && req.user.branch !== 'Main Branch') {
            matchStage.branch = req.user.branch;
        }

        const totalBookings = await Consignment.countDocuments(matchStage);

        // Revenue
        const revenueAgg = await Consignment.aggregate([
            { $match: matchStage },
            { $group: { _id: null, total: { $sum: "$cost.amount" } } }
        ]);
        const totalRevenue = revenueAgg[0] ? revenueAgg[0].total : 0;

        // Recent
        const recent = await Consignment.find(matchStage).sort({ bookingDate: -1 }).limit(5);

        res.json({
            totalBookings,
            totalRevenue,
            recentBookings: recent
        });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
};

const nodemailer = require('nodemailer');

exports.sendDailyReport = async (req, res) => {
    try {
        // Calculate Today's Stats
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        const todayBookings = await Consignment.find({
            bookingDate: { $gte: startOfDay, $lte: endOfDay }
        }).populate('processedBy', 'username');

        const totalRevenue = todayBookings.reduce((sum, b) => sum + b.cost.amount, 0);
        const bookingCount = todayBookings.length;

        // Breakdown by Employee
        const employeeStats = {};
        todayBookings.forEach(b => {
            const empName = b.processedBy ? b.processedBy.username : 'Unknown';
            if (!employeeStats[empName]) employeeStats[empName] = 0;
            employeeStats[empName] += b.cost.amount;
        });

        // Email Content
        const tableRows = Object.entries(employeeStats).map(([emp, amt]) =>
            `<tr><td style="padding:8px;border:1px solid #ddd">${emp}</td><td style="padding:8px;border:1px solid #ddd">₹${amt}</td></tr>`
        ).join('');

        const htmlContent = `
            <div style="font-family: Arial, sans-serif; padding: 20px;">
                <h2 style="color: #2563eb;">Daily Financial Report - ${startOfDay.toLocaleDateString()}</h2>
                
                <div style="background:#f3f4f6; padding:15px; border-radius:8px; margin-bottom:20px;">
                    <h3 style="margin:0;">Total Collection: <span style="color:#166534; font-size:24px;">₹${totalRevenue}</span></h3>
                    <p>Total Bookings: <strong>${bookingCount}</strong></p>
                </div>

                <h3>Collection by Employee</h3>
                <table style="width:100%; border-collapse:collapse;">
                    <tr style="background:#eee;">
                        <th style="padding:8px;border:1px solid #ddd;text-align:left;">Employee</th>
                        <th style="padding:8px;border:1px solid #ddd;text-align:left;">Collected</th>
                    </tr>
                    ${tableRows}
                </table>
                <p style="font-size:12px; color:#666; margin-top:20px;">Automated Report from Courier Admin System</p>
            </div>
        `;

        if (process.env.EMAIL_USER && process.env.EMAIL_PASS) { // Send to Self (Admin)
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
            });

            await transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: process.env.EMAIL_USER, // Owner Email
                subject: `💰 Daily EOD Report: ₹${totalRevenue}`,
                html: htmlContent
            });

            res.json({ success: true, message: 'Report sent to Admin Email', revenue: totalRevenue });
        } else {
            res.status(500).json({ error: 'Email configuration missing' });
        }

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to send report' });
    }
};
