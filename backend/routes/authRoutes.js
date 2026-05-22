// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const { register, login, verifyOTP, resendOTP, getMe, forgotPassword, resetPassword,requestReactivation,verifyReactivation } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.post('/request-reactivation', requestReactivation);
router.post('/verify-reactivation', verifyReactivation);
router.post('/verify-otp', verifyOTP);
router.post('/resend-otp', resendOTP);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/me', protect, getMe);

module.exports = router;
