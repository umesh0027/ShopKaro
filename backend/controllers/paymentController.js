


const Razorpay = require('razorpay');
const crypto = require('crypto');
const Order = require('../models/Order');
const { sendEmail, emailTemplates } = require('../utils/email');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// @desc    Create Razorpay order
// @route   POST /api/payment/create-order
const createRazorpayOrder = async (req, res) => {
  try {
    const { orderId } = req.body;
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(order.totalPrice * 100), // paise
      currency: 'INR',
      receipt: order.orderNumber,
      notes: {
        orderId: order._id.toString(),
        userId: req.user._id.toString()
      }
    });

    order.paymentInfo.razorpayOrderId = razorpayOrder.id;
    await order.save();

    res.json({
      success: true,
      razorpayOrder,
      key: process.env.RAZORPAY_KEY_ID,
      amount: Math.round(order.totalPrice * 100),
      currency: 'INR',
      orderNumber: order.orderNumber
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Verify Razorpay payment
// @route   POST /api/payment/verify
const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;

    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Payment verification failed' });
    }

    const order = await Order.findById(orderId).populate('user', 'name email');
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    order.paymentInfo.razorpayPaymentId = razorpay_payment_id;
    order.paymentInfo.razorpaySignature = razorpay_signature;
    order.paymentInfo.status = 'paid';
    order.paymentInfo.paidAt = new Date();
    order.orderStatus = 'confirmed';
    order.trackingHistory.push({
      status: 'confirmed',
      message: 'Payment received. Order confirmed.',
      location: 'Online'
    });

    await order.save();

    res.json({ success: true, message: 'Payment verified successfully', order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get payment details (Admin)
// @route   GET /api/payment/all
const getAllPayments = async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const query = {};
    if (status) query['paymentInfo.status'] = status;

    const total = await Order.countDocuments(query);
    const payments = await Order.find(query)
      .select('orderNumber paymentInfo totalPrice user createdAt')
      .populate('user', 'name email')
      .sort('-createdAt')
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const revenue = await Order.aggregate([
      { $match: { 'paymentInfo.status': 'paid' } },
      { $group: { _id: null, total: { $sum: '$totalPrice' }, count: { $sum: 1 } } }
    ]);

    const refundAgg = await Order.aggregate([
      { $match: { 'paymentInfo.status': 'refunded' } },
      { $group: { _id: null, total: { $sum: '$totalPrice' }, count: { $sum: 1 } } }
    ]);

    res.json({
      success: true,
      payments,
      total,
      pages: Math.ceil(total / limit),
      totalRevenue: revenue[0]?.total || 0,
      paidCount: revenue[0]?.count || 0,
      refundCount: refundAgg[0]?.count || 0,
      refundTotal: refundAgg[0]?.total || 0
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { createRazorpayOrder, verifyPayment, getAllPayments };
