


const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name: { type: String, required: true },
  image: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
    selectedColor: { type: String, default: '' },
     selectedColorHex: { type: String, default: '' },
  selectedSize:  { type: String, default: '' },
  
});

const trackingSchema = new mongoose.Schema({
  status: { type: String, required: true },
  message: { type: String, required: true },
  location: { type: String, default: '' },
  timestamp: { type: Date, default: Date.now }
});

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  orderNumber: { type: String, unique: true },
  items: [orderItemSchema],
  shippingAddress: {
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    country: { type: String, default: 'India' }
  },
  paymentInfo: {
    razorpayOrderId: String,
    razorpayPaymentId: String,
    razorpaySignature: String,
    method: { type: String, enum: ['razorpay', 'cod'], default: 'razorpay' },
    status: { type: String, enum: ['pending', 'paid', 'failed', 'refunded'], default: 'pending' },
    paidAt: Date,
     refundId: String,
    refundedAt: Date,
    refundError: String
  },
  itemsPrice: { type: Number, required: true },
  taxPrice: { type: Number, default: 0 },
  shippingPrice: { type: Number, default: 0 },
  totalPrice: { type: Number, required: true },
  orderStatus: {
    type: String,
    enum: ['placed', 'confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled', 'return_requested', 'returned'],
    default: 'placed'
  },
  trackingNumber: { type: String, default: '' },
  trackingHistory: [trackingSchema],
  // Fake Shiprocket data
  shiprocketOrderId: { type: String, default: '' },
  shiprocketShipmentId: { type: String, default: '' },
  estimatedDelivery: Date,
  deliveredAt: Date,
  cancelledAt: Date,
   hiddenByUser: { type: Boolean, default: false }, // user ne history se delete kiya"
  cancelReason: String,
  notes: String, 
  // COD payment confirmation
  codPaymentCollectedAt: Date,
  codPaymentCollectedBy: String,
  // Return fields
  returnRequest: {
    reason: String,
    description: String,
    images: [String],
    requestedAt: Date,
    status: { type: String, enum: ['pending', 'approved', 'rejected', 'picked_up', 'refunded'], default: 'pending' },
    adminNote: String, // For admin to add notes while processing return request
    processedAt: Date,
    refundAmount: Number,
    refundedAt: Date
  }
}, { timestamps: true });

// Generate order number
orderSchema.pre('save', function(next) {

  // Agar order number already generated hai to usko regenerate mat karo, warna har save operation par order number change ho jayega jo ki galat hoga, isliye check karenge ki agar orderNumber already exist karta hai to usko regenerate mat karo
  if (!this.orderNumber) {
    this.orderNumber = 'ORD-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5).toUpperCase(); // Generate unique order number using current timestamp and random string, taki har order ka ek unique identifier ho jisse user apne orders ko track kar sake aur admin bhi easily orders ko manage kar sake
  }
  next();
});

module.exports = mongoose.model('Order', orderSchema);


