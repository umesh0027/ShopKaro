// // models/Bundle.js
// const mongoose = require('mongoose');

// const bundleSchema = new mongoose.Schema({
//   name: {
//     type: String,
//     required: [true, 'Bundle name is required'],
//     trim: true,
//     maxlength: [200, 'Bundle name cannot exceed 200 characters']
//     // e.g. "Complete Summer Look", "Gaming Starter Pack"
//   },
//   slug: {
//     type: String,
//     unique: true,
//     lowercase: true
//   },
//   description: {
//     type: String,
//     maxlength: [500, 'Description cannot exceed 500 characters']
//   },
//   // Products in this bundle
//   products: [
//     {
//       product: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: 'Product',
//         required: true
//       },
//       quantity: { type: Number, default: 1, min: 1 }
//     }
//   ],

//   // Bundle price — admin sets this manually (lower than sum of individual prices)
//   bundlePrice: {
//     type: Number,
//     required: [true, 'Bundle price is required'],
//     min: [0, 'Bundle price cannot be negative']
//   },

//   // Auto-calculated from products (shown as "original price" with strikethrough)
//   originalPrice: {
//     type: Number,
//     default: 0
//   },

//   // Savings amount shown to user
//   savingsAmount: {
//     type: Number,
//     default: 0
//   },

//   // Savings percent shown to user
//   savingsPercent: {
//     type: Number,
//     default: 0
//   },

//   image: {
//     url: { type: String, default: '' },
//     public_id: { type: String, default: '' }
//   },

//   isActive: { type: Boolean, default: true },
//   isFeatured: { type: Boolean, default: false },

//   // How many times this bundle was purchased (for analytics)
//   purchaseCount: { type: Number, default: 0 },

//   // Tags for search
//   tags: [String]

// }, { timestamps: true });

// // Auto-generate slug
// bundleSchema.pre('save', function (next) {
//   if (this.isModified('name')) {
//     const base = this.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
//     this.slug = base + '-' + Date.now().toString(36);
//   }
//   next();
// });

// module.exports = mongoose.model('Bundle', bundleSchema);






// backend/models/Bundle.js

const mongoose = require('mongoose');

const bundleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Bundle name is required'],
    trim: true,
    maxlength: [200, 'Name cannot exceed 200 characters']
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  products: [
    {
      product:  { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
      quantity: { type: Number, default: 1, min: 1 }
    }
  ],
  bundlePrice:    { type: Number, required: true, min: 0 },
  originalPrice:  { type: Number, default: 0 },
  savingsAmount:  { type: Number, default: 0 },
  savingsPercent: { type: Number, default: 0 },
  image: {
    url:       { type: String, default: '' },
    public_id: { type: String, default: '' }
  },
  isActive:      { type: Boolean, default: true },
  isFeatured:    { type: Boolean, default: false },
  purchaseCount: { type: Number, default: 0 },
  tags:          [String]
}, { timestamps: true });

// Auto slug
bundleSchema.pre('save', function (next) {
  if (this.isModified('name') || this.isNew) {
    const base = this.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    this.slug = base + '-' + Date.now().toString(36);
  }
  next();
});

module.exports = mongoose.model('Bundle', bundleSchema);