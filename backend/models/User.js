const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const addressSchema = new mongoose.Schema({
  fullName: String,
  phone: String,
  street: String,
  city: String,
  state: String,
  pincode: String,
  country: { type: String, default: 'India' },
  isDefault: { type: Boolean, default: false }  // For easy retrieval of default address mtlb jo order place karte time use hoga
});

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  phone: {
    type: String,
    match: [/^[6-9]\d{9}$/, 'Please enter a valid Indian phone number']
  },
  avatar: {
    url: { type: String, default: '' },  // For Cloudinary URL
    public_id: { type: String, default: '' } // For Cloudinary public ID
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  isVerified: {   // For email verification
    type: Boolean,
    default: false      // Initially false, set to true after email verification
  },
  otp: {
    code: String,  // For storing OTP code for email verification and password reset
    expiresAt: Date
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  addresses: [addressSchema],
  wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  isActive: { type: Boolean, default: true }   // For soft delete and account deactivation mtlb agar user apna account delete karta hai to uske data ko hard delete na karke isActive false kar denge taki future me agar user wapas aana chahe to uska data wapas mil jaye aur agar admin ko kisi user ka data dekhna ho to wo bhi dekh sakega ki kis user ne apna account delete kiya hai
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password
userSchema.methods.comparePassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate OTP
userSchema.methods.generateOTP = function() {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  this.otp = {
    code: otp,
    expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
  };
  return otp;
};

module.exports = mongoose.model('User', userSchema);
