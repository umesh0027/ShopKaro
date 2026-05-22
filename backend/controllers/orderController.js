

const Order = require('../models/Order');
const Product = require('../models/Product');
const { sendEmail, emailTemplates } = require('../utils/email');
const User = require('../models/User');
const Razorpay = require('razorpay');
const razorpayInstance = new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET });

// Fake Shiprocket tracking simulation
const generateFakeTracking = (orderNumber) => {
  return {
    shiprocketOrderId: 'SR-' + Date.now(),
    shiprocketShipmentId: 'SHP-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
    trackingNumber: 'TRACK' + Math.random().toString(36).substr(2, 10).toUpperCase(),
    estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000) // 5 days from now
  };
};

const trackingMessages = {
  placed: { message: 'Order placed successfully', location: 'Online' },
  confirmed: { message: 'Order confirmed by seller', location: 'Seller Warehouse' },
  processing: { message: 'Order is being packed', location: 'Seller Warehouse' },
  shipped: { message: 'Order picked up by courier', location: 'Dispatch Hub' },
  out_for_delivery: { message: 'Out for delivery', location: 'Local Delivery Center' },
  delivered: { message: 'Order delivered successfully', location: 'Delivered' },
  cancelled: { message: 'Order cancelled', location: '' },
};

// @desc    Create order
// @route   POST /api/orders
const createOrder = async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod = 'razorpay' } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'No items in order' });
    }

    // Validate items and calculate prices
    let itemsPrice = 0;
    const validatedItems = [];

    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) return res.status(404).json({ success: false, message: `Product not found: ${item.product}` });
      if (!product.isActive) return res.status(400).json({ success: false, message: `Product unavailable: ${product.name}` });
      if (product.stock < item.quantity) {
        return res.status(400).json({ success: false, message: `Insufficient stock for: ${product.name}` });
      }

      const price = product.discountPrice || product.price;
      itemsPrice += price * item.quantity;

         // Get color image if color selected
      let itemImage = product.images[0]?.url || '';
      if (item.selectedColor && product.colors?.length) {
        const colorObj = product.colors.find(c => c.name === item.selectedColor);
        if (colorObj?.images?.[0]?.url) itemImage = colorObj.images[0].url;
        else if (colorObj?.images?.[0]) itemImage = colorObj.images[0];
      }
      validatedItems.push({
        product: product._id,
        name: product.name,
        image: product.images[0]?.url || '',
        price,
        quantity: item.quantity,
        selectedColor: item.selectedColor || '',
             selectedColorHex: item.selectedColorHex || '',
        selectedSize:  item.selectedSize  || ''
      });
    }

    const taxPrice = Math.round(itemsPrice * 0.18); // 18% GST
    const shippingPrice = itemsPrice > 499 ? 0 : 49;
    const totalPrice = itemsPrice + taxPrice + shippingPrice;

    const trackingData = generateFakeTracking();

    const order = await Order.create({
      user: req.user._id,
      items: validatedItems,
      shippingAddress,
      paymentInfo: { method: paymentMethod, status: paymentMethod === 'cod' ? 'pending' : 'pending' },
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
      ...trackingData,
      trackingHistory: [{
        status: 'placed',
        message: trackingMessages.placed.message,
        location: trackingMessages.placed.location
      }]
    });

    // Reduce stock
    for (const item of validatedItems) {
      await Product.findByIdAndUpdate(item.product, { $inc: { stock: -item.quantity } });
    }

    const populated = await Order.findById(order._id).populate('user', 'name email');

    // Send confirmation email
    await sendEmail({
      to: req.user.email,
      subject: `Order Confirmed - #${order.orderNumber}`,
      html: emailTemplates.orderConfirmation(req.user.name, populated)
    });

    res.status(201).json({ success: true, message: 'Order placed successfully', order: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get user orders
// @route   GET /api/orders/my-orders
const getMyOrders = async (req, res) => {
  try { 
    const { page = 1, limit = 10 } = req.query;
     // hiddenByUser: {$ne: true} — exclude orders user has deleted from history
        const query = { user: req.user._id, hiddenByUser: { $ne: true } };
    // const total = await Order.countDocuments({ user: req.user._id });
    // const orders = await Order.find({ user: req.user._id })
       const total = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .sort('-createdAt')
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .populate('items.product', 'name images');

    res.json({ success: true, orders, total, pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single order
// @route   GET /api/orders/:id
const getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email phone')
      .populate('items.product', 'name images slug');

    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    // Only admin or order owner can view
    if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Track order (public with order number + email)
// @route   GET /api/orders/track/:orderNumber
const trackOrder = async (req, res) => {
  try {
    const { email } = req.query;
    const order = await Order.findOne({ orderNumber: req.params.orderNumber })
      .populate('user', 'name email')
      .populate('items.product', 'name images');

    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    if (email && order.user.email !== email) {
      return res.status(403).json({ success: false, message: 'Order not found for this email' });
    }

    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Cancel order (user)
// @route   PATCH /api/orders/:id/cancel

// @desc    Cancel order (user)
// @route   PATCH /api/orders/:id/cancel
const cancelOrder = async (req, res) => {
  try {
    const { reason } = req.body;
    const order = await Order.findById(req.params.id).populate('user', 'name email');
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    if (order.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const cancellableStatuses = ['placed', 'confirmed', 'processing'];
    if (!cancellableStatuses.includes(order.orderStatus)) {
      return res.status(400).json({ success: false, message: 'Order cannot be cancelled at this stage' });
    }

    // =========================================
    // RAZORPAY REFUND - if online payment paid
    // =========================================
    let refundId = null;
    let refundInitiated = false;

    const isOnlinePaid =
      order.paymentInfo.method === 'razorpay' &&
      order.paymentInfo.status === 'paid' &&
      order.paymentInfo.razorpayPaymentId;

    if (isOnlinePaid) {
      try {
        const refund = await razorpayInstance.payments.refund(order.paymentInfo.razorpayPaymentId, {
          amount: Math.round(order.totalPrice * 100), // paise
          notes: {
            reason: reason || 'Cancelled by customer',
            orderNumber: order.orderNumber
          }
        });
        refundId = refund.id;
        refundInitiated = true;
        order.paymentInfo.status = 'refunded';
        order.paymentInfo.refundId = refundId;
        order.paymentInfo.refundedAt = new Date();
      } catch (refundErr) {
        console.error('Razorpay refund error:', refundErr);
        // Still cancel but note refund failed
        order.paymentInfo.refundError = refundErr.message;
      }
    }

    order.orderStatus = 'cancelled';
    order.cancelReason = reason || 'Cancelled by user';
    order.cancelledAt = new Date();
    order.trackingHistory.push({
      status: 'cancelled',
      message: refundInitiated
        ? `Order cancelled. Refund of \u20b9${order.totalPrice.toLocaleString()} initiated to original payment method.`
        : `Order cancelled: ${reason || 'By user'}`,
      location: ''
    });

    // Restore stock
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity } });
    }

    await order.save();

    // Send cancellation + refund email
    const emailHtml = `
      <div style="font-family:'Segoe UI',sans-serif;max-width:600px;margin:0 auto;background:#f8f9fa;padding:20px">
        <div style="background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);padding:40px;border-radius:12px 12px 0 0;text-align:center">
          <h1 style="color:white;margin:0;font-size:24px">Order Cancelled</h1>
        </div>
        <div style="background:white;padding:40px;border-radius:0 0 12px 12px;box-shadow:0 4px 20px rgba(0,0,0,0.1)">
          <p>Hi <strong>${order.user.name}</strong>,</p>
          <p>Your order <strong>#${order.orderNumber}</strong> has been cancelled successfully.</p>
          ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}

          ${isOnlinePaid ? `
          <div style="margin:20px 0;padding:20px;border-radius:10px;background:${refundInitiated ? '#f0fdf4' : '#fef3c7'};border-left:4px solid ${refundInitiated ? '#22c55e' : '#f59e0b'}">
            <h3 style="margin:0 0 8px;color:${refundInitiated ? '#16a34a' : '#d97706'}">
              ${refundInitiated ? '✅ Refund Initiated' : '⚠️ Refund Pending'}
            </h3>
            ${refundInitiated ? `
              <p style="margin:0;color:#166534;font-size:14px">
                <strong>₹${order.totalPrice.toLocaleString()}</strong> refund has been initiated to your original payment method.
                It will be credited within <strong>5-7 business days</strong>.
              </p>
              <p style="margin:6px 0 0;color:#166534;font-size:12px">Refund ID: <code>${refundId}</code></p>
            ` : `
              <p style="margin:0;color:#92400e;font-size:14px">
                Your refund is being processed. Contact support if not received within 7 days.
              </p>
            `}
          </div>
          ` : order.paymentInfo.method === 'cod' ? `
          <div style="margin:20px 0;padding:15px;border-radius:10px;background:#f0f4ff">
            <p style="margin:0;color:#4338ca;font-size:14px">💵 This was a Cash on Delivery order — no refund needed.</p>
          </div>
          ` : ''}

          <div style="background:#f8f9fa;padding:15px;border-radius:8px;margin:20px 0">
            <p style="margin:0;font-size:13px;color:#666">Order Amount: <strong>₹${order.totalPrice.toLocaleString()}</strong></p>
            <p style="margin:4px 0 0;font-size:13px;color:#666">Cancelled on: ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
          </div>

          <p style="color:#666;font-size:13px">If you have questions, contact us at support@shopkaro.com</p>
          <p style="color:#999;font-size:12px;text-align:center">© 2024 ShopKaro. All rights reserved.</p>
        </div>
      </div>`;

    await sendEmail({
      to: order.user.email,
      subject: `Order Cancelled${refundInitiated ? ' & Refund Initiated' : ''} - #${order.orderNumber}`,
      html: emailHtml
    });

    res.json({
      success: true,
      message: refundInitiated
        ? `Order cancelled. Refund of ₹${order.totalPrice.toLocaleString()} initiated. Will be credited in 5-7 business days.`
        : 'Order cancelled successfully.',
      refundInitiated,
      refundId,
      order
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// const cancelOrder = async (req, res) => {
//   try {
//     const { reason } = req.body;
//     const order = await Order.findById(req.params.id);
//     if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

//     if (order.user.toString() !== req.user._id.toString()) {
//       return res.status(403).json({ success: false, message: 'Not authorized' });
//     }

//     const cancellableStatuses = ['placed', 'confirmed', 'processing'];
//     if (!cancellableStatuses.includes(order.orderStatus)) {
//       return res.status(400).json({ success: false, message: 'Order cannot be cancelled at this stage' });
//     }
    

//     order.orderStatus = 'cancelled';
//     order.cancelReason = reason || 'Cancelled by user';
//     order.cancelledAt = new Date();
//     order.trackingHistory.push({
//       status: 'cancelled',
//       message: `Order cancelled: ${reason || 'By user'}`,
//       location: ''
//     });

//     // Restore stock
//     for (const item of order.items) {
//       await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity } });
//     }

//     await order.save();
//     res.json({ success: true, message: 'Order cancelled successfully', order });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// ============= ADMIN ROUTES =============

// @desc    Get all orders (Admin)
// @route   GET /api/orders/admin/all
const getAllOrders = async (req, res) => {
  try {
    const { status, page = 1, limit = 20, search } = req.query;
    const query = {};
    if (status) query.orderStatus = status;
    if (search) query.orderNumber = { $regex: search, $options: 'i' };

    const total = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .sort('-createdAt')
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .populate('user', 'name email phone');

    const stats = {
      total: await Order.countDocuments(),
      placed: await Order.countDocuments({ orderStatus: 'placed' }),
      processing: await Order.countDocuments({ orderStatus: 'processing' }),
      shipped: await Order.countDocuments({ orderStatus: 'shipped' }),
      delivered: await Order.countDocuments({ orderStatus: 'delivered' }),
      cancelled: await Order.countDocuments({ orderStatus: 'cancelled' }),
      revenue: (await Order.aggregate([
        { $match: { 'paymentInfo.status': 'paid' } },
        { $group: { _id: null, total: { $sum: '$totalPrice' } } }
      ]))[0]?.total || 0
    };

    res.json({ success: true, orders, total, pages: Math.ceil(total / limit), stats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update order status (Admin)
// @route   PATCH /api/orders/:id/status
const updateOrderStatus = async (req, res) => {
  try {
    const { status, trackingNumber, message } = req.body;
    const order = await Order.findById(req.params.id).populate('user', 'name email');
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    order.orderStatus = status;
    if (trackingNumber) order.trackingNumber = trackingNumber;
    if (status === 'delivered') order.deliveredAt = new Date();

    order.trackingHistory.push({
      status,
      message: message || trackingMessages[status]?.message || `Status updated to ${status}`,
      location: trackingMessages[status]?.location || ''
    });

    await order.save();

    // Send email notification
    await sendEmail({
      to: order.user.email,
      subject: `Order Update - #${order.orderNumber}`,
      html: emailTemplates.orderStatusUpdate(order.user.name, order.orderNumber, status, order.trackingNumber)
    });

    res.json({ success: true, message: 'Order status updated', order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    COD Payment collected (Admin marks COD as paid)
// @route   PATCH /api/orders/:id/cod-paid
const markCODPaid = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email');
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    if (order.paymentInfo.method !== 'cod') {
      return res.status(400).json({ success: false, message: 'This is not a COD order' });
    }
    if (order.paymentInfo.status === 'paid') {
      return res.status(400).json({ success: false, message: 'Payment already marked as paid' });
    }

    order.paymentInfo.status = 'paid';
    order.paymentInfo.paidAt = new Date();
    order.codPaymentCollectedAt = new Date();
    order.codPaymentCollectedBy = req.user.name;

    order.trackingHistory.push({
      status: order.orderStatus,
      message: 'COD payment collected successfully',
      location: order.shippingAddress.city
    });

    await order.save();

    // Email user
    await sendEmail({
      to: order.user.email,
      subject: `Payment Confirmed - Order #${order.orderNumber}`,
      html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px">
        <div style="background:linear-gradient(135deg,#667eea,#764ba2);padding:30px;border-radius:12px 12px 0 0;text-align:center">
          <h1 style="color:white;margin:0">Payment Received! ✅</h1>
        </div>
        <div style="background:white;padding:30px;border-radius:0 0 12px 12px;box-shadow:0 4px 20px rgba(0,0,0,0.1)">
          <p>Hi <strong>${order.user.name}</strong>,</p>
          <p>Your COD payment of <strong>₹${order.totalPrice.toLocaleString()}</strong> for order <strong>#${order.orderNumber}</strong> has been collected and confirmed.</p>
          <div style="background:#f0f9f0;padding:15px;border-radius:8px;border-left:4px solid #22c55e;margin:15px 0">
            <strong style="color:#16a34a">Payment Status: PAID</strong>
          </div>
          <p style="color:#666;font-size:13px">Thank you for shopping with ShopKaro!</p>
        </div>
      </div>`
    });

    res.json({ success: true, message: 'COD payment marked as paid. Customer notified via email.', order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Request Return (User)
// @route   POST /api/orders/:id/return-request
const requestReturn = async (req, res) => {
  try {
    const { reason, description } = req.body;
    const order = await Order.findById(req.params.id).populate('user', 'name email');
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    if (order.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    if (order.orderStatus !== 'delivered') {
      return res.status(400).json({ success: false, message: 'Return can only be requested for delivered orders' });
    }
    if (order.returnRequest && order.returnRequest.requestedAt) {
      return res.status(400).json({ success: false, message: 'Return already requested for this order' });
    }

    // Check 7-day return window
    const deliveredAt = order.deliveredAt || order.updatedAt;
    const daysDiff = (Date.now() - new Date(deliveredAt).getTime()) / (1000 * 60 * 60 * 24);
    if (daysDiff > 7) {
      return res.status(400).json({ success: false, message: 'Return window (7 days) has expired' });
    }

    order.orderStatus = 'return_requested';
    order.returnRequest = {
      reason,
      description,
      requestedAt: new Date(),
      status: 'pending',
      refundAmount: order.totalPrice
    };

    order.trackingHistory.push({
      status: 'return_requested',
      message: `Return requested: ${reason}`,
      location: ''
    });

    await order.save();

    // Notify admin
    await sendEmail({
      to: process.env.ADMIN_EMAIL,
      subject: `New Return Request - Order #${order.orderNumber}`,
      html: `<div style="font-family:sans-serif;padding:20px">
        <h2>New Return Request 🔄</h2>
        <p><strong>Order:</strong> #${order.orderNumber}</p>
        <p><strong>Customer:</strong> ${order.user.name} (${order.user.email})</p>
        <p><strong>Amount:</strong> ₹${order.totalPrice.toLocaleString()}</p>
        <p><strong>Reason:</strong> ${reason}</p>
        <p><strong>Description:</strong> ${description || 'N/A'}</p>
        <p>Please review in Admin Panel.</p>
      </div>`
    });

    // Notify user
    await sendEmail({
      to: order.user.email,
      subject: `Return Request Received - Order #${order.orderNumber}`,
      html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px">
        <div style="background:linear-gradient(135deg,#667eea,#764ba2);padding:30px;border-radius:12px 12px 0 0;text-align:center">
          <h1 style="color:white;margin:0">Return Request Received</h1>
        </div>
        <div style="background:white;padding:30px;border-radius:0 0 12px 12px">
          <p>Hi <strong>${order.user.name}</strong>,</p>
          <p>We have received your return request for order <strong>#${order.orderNumber}</strong>.</p>
          <div style="background:#fef3c7;padding:15px;border-radius:8px;border-left:4px solid #f59e0b;margin:15px 0">
            <strong>Status: Under Review</strong><br/>
            <small>Our team will review and respond within 24-48 hours.</small>
          </div>
          <p><strong>Reason:</strong> ${reason}</p>
          <p style="color:#666;font-size:13px">If approved, refund will be processed within 5-7 business days.</p>
        </div>
      </div>`
    });

    res.json({ success: true, message: 'Return request submitted successfully. We will review and respond within 24-48 hours.', order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all return requests (Admin)
// @route   GET /api/orders/admin/returns
const getAllReturns = async (req, res) => {
  try {
    const { status, page = 1, limit = 15 } = req.query;
    const query = {
      orderStatus: { $in: ['return_requested', 'returned'] },
      'returnRequest.requestedAt': { $exists: true }
    };
    if (status) query['returnRequest.status'] = status;

    const total = await Order.countDocuments(query);
    const returns = await Order.find(query)
      .sort('-returnRequest.requestedAt')
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .populate('user', 'name email phone');

    const returnStats = {
      total: await Order.countDocuments({ 'returnRequest.requestedAt': { $exists: true } }),
      pending: await Order.countDocuments({ 'returnRequest.status': 'pending' }),
      approved: await Order.countDocuments({ 'returnRequest.status': 'approved' }),
      rejected: await Order.countDocuments({ 'returnRequest.status': 'rejected' }),
      refunded: await Order.countDocuments({ 'returnRequest.status': 'refunded' }),
    };

    res.json({ success: true, returns, total, pages: Math.ceil(total / limit), returnStats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Process return request (Admin)
// @route   PATCH /api/orders/:id/process-return
const processReturn = async (req, res) => {
  try {
    const { action, adminNote, refundAmount } = req.body; // action: 'approve' | 'reject' | 'pickup' | 'refund'
    const order = await Order.findById(req.params.id).populate('user', 'name email');
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    if (!order.returnRequest || !order.returnRequest.requestedAt) {
      return res.status(400).json({ success: false, message: 'No return request found' });
    }

    let newReturnStatus, newOrderStatus, emailSubject, emailContent, trackingMsg;

    switch (action) {
      case 'approve':
        newReturnStatus = 'approved';
        newOrderStatus = 'return_requested';
        emailSubject = `Return Approved - Order #${order.orderNumber}`;
        trackingMsg = 'Return request approved. Our team will pick up shortly.';
        emailContent = `<p>Great news! Your return request for order <strong>#${order.orderNumber}</strong> has been <strong style="color:#16a34a">APPROVED</strong>.</p>
          <p>Our delivery partner will contact you within 2-3 business days for pickup.</p>
          ${adminNote ? `<p><strong>Admin Note:</strong> ${adminNote}</p>` : ''}`;
        break;

      case 'reject':
        newReturnStatus = 'rejected';
        newOrderStatus = 'delivered';
        emailSubject = `Return Request Update - Order #${order.orderNumber}`;
        trackingMsg = 'Return request rejected.';
        emailContent = `<p>We're sorry, your return request for order <strong>#${order.orderNumber}</strong> has been <strong style="color:#ef4444">REJECTED</strong>.</p>
          ${adminNote ? `<p><strong>Reason:</strong> ${adminNote}</p>` : ''}
          <p>If you have any questions, please contact our support team.</p>`;
        break;

      case 'pickup':
        newReturnStatus = 'picked_up';
        newOrderStatus = 'return_requested';
        emailSubject = `Return Picked Up - Order #${order.orderNumber}`;
        trackingMsg = 'Return item picked up by our delivery partner.';
        emailContent = `<p>Your return item for order <strong>#${order.orderNumber}</strong> has been <strong>picked up</strong> by our delivery partner.</p>
          <p>Refund will be processed after quality check (2-3 business days).</p>`;
        break;

      case 'refund':
        newReturnStatus = 'refunded';
        newOrderStatus = 'returned';
        order.paymentInfo.status = 'refunded';
        order.returnRequest.refundedAt = new Date();
        order.returnRequest.refundAmount = refundAmount || order.totalPrice;
        emailSubject = `Refund Processed - Order #${order.orderNumber}`;
        trackingMsg = `Refund of ₹${(refundAmount || order.totalPrice).toLocaleString()} processed.`;
        emailContent = `<p>Your refund of <strong>₹${(refundAmount || order.totalPrice).toLocaleString()}</strong> for order <strong>#${order.orderNumber}</strong> has been processed.</p>
          <p>Amount will be credited to your original payment method within <strong>5-7 business days</strong>.</p>`;
        break;

      default:
        return res.status(400).json({ success: false, message: 'Invalid action' });
    }

    order.returnRequest.status = newReturnStatus;
    order.returnRequest.adminNote = adminNote || '';
    order.returnRequest.processedAt = new Date();
    order.orderStatus = newOrderStatus;

    order.trackingHistory.push({
      status: newOrderStatus,
      message: trackingMsg,
      location: 'ShopKaro Returns Center'
    });

    await order.save();

    // Send email to user
    await sendEmail({
      to: order.user.email,
      subject: emailSubject,
      html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px">
        <div style="background:linear-gradient(135deg,#667eea,#764ba2);padding:30px;border-radius:12px 12px 0 0;text-align:center">
          <h1 style="color:white;margin:0">${emailSubject}</h1>
        </div>
        <div style="background:white;padding:30px;border-radius:0 0 12px 12px">
          <p>Hi <strong>${order.user.name}</strong>,</p>
          ${emailContent}
        </div>
      </div>`
    });

    res.json({ success: true, message: `Return ${action}d successfully. Customer notified.`, order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteFromHistory = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    // Only allow deleting completed/cancelled orders
    const allowedStatuses = ['delivered', 'cancelled', 'returned'];
    if (!allowedStatuses.includes(order.orderStatus)) {
      return res.status(400).json({
        success: false,
        message: 'Only delivered, cancelled or returned orders can be removed from history'
      });
    }
    order.hiddenByUser = true;
    await order.save();
    res.json({ success: true, message: 'Order removed from your history' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createOrder, getMyOrders, getOrder, trackOrder,
  cancelOrder, getAllOrders, updateOrderStatus,
  markCODPaid, requestReturn, getAllReturns, processReturn,deleteFromHistory
};