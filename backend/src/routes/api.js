const express = require('express');
const router = express.Router();
const rateController = require('../controllers/rateController');
const bookingController = require('../controllers/bookingController');
const authController = require('../controllers/authController');
const reportController = require('../controllers/reportController');
const labelController = require('../controllers/labelController'); // New import
const { protect, authorize } = require('../middleware/authMiddleware');

console.log('API Routes Loaded');

// Debug Route
router.get('/ping', (req, res) => res.json({ message: 'pong' }));

// Auth Routes
router.post('/auth/login', (req, res, next) => {
    console.log(`[AUTH] Login attempt for: ${req.body.username}`);
    authController.login(req, res).catch(next);
});


// Rate & Booking
router.post('/calculate-rates', protect, rateController.calculateRate);
// router.post('/send-otp', protect, bookingController.generateOtp); // Removed
router.post('/book', protect, bookingController.bookConsignment);

// Admin Routes
router.get('/admin/export-excel', protect, authorize('admin', 'employee'), reportController.exportMonthlyReport);
router.get('/admin/stats', protect, authorize('admin'), reportController.getDashboardStats);
router.post('/admin/daily-report', protect, authorize('admin'), reportController.sendDailyReport);

// Dynamic Admin Features
router.get('/admin/employees', protect, authorize('admin'), authController.getEmployees);
router.post('/admin/employees', protect, authorize('admin'), authController.createEmployee);

router.get('/admin/rates', protect, authorize('admin'), rateController.getRates);
router.post('/admin/rates', protect, authorize('admin'), rateController.updateRate);

// Shipping Label
router.get('/label/:consignmentId', protect, labelController.generateLabel);



module.exports = router;
