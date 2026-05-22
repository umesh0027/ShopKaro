// paymentRoutes.js
const express = require('express');
const payRouter = express.Router();
const { createRazorpayOrder, verifyPayment, getAllPayments } = require('../controllers/paymentController');
const { protect, adminOnly } = require('../middleware/auth');

payRouter.post('/create-order', protect, createRazorpayOrder);
payRouter.post('/verify', protect, verifyPayment);
payRouter.get('/all', protect, adminOnly, getAllPayments);

module.exports = payRouter;
