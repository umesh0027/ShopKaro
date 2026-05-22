const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
  adminReply: { type: String, default: '' },
  isApproved: { type: Boolean, default: true }   // For review moderation, agar admin chahte hai ki review ko approve karne ke baad hi wo product page par dikhai de to isApproved false kar denge aur admin jab review ko approve karega tab isApproved true kar denge taki wo review product page par dikhai de
}, { timestamps: true });

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [200, 'Product name cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Product description is required']
  },
  shortDescription: { type: String, maxlength: [300, 'Short description cannot exceed 300 characters'] },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  discountPrice: {
    type: Number,
    default: 0
  },
  discountPercent: {
    type: Number,
    default: 0
  },
  stock: {
    type: Number,
    required: [true, 'Stock is required'],
    min: [0, 'Stock cannot be negative'],
    default: 0
  },
  images: [{
    url: { type: String, required: true },
    public_id: { type: String }
  }],
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Category is required']
  },
  tags: [String],  // For search and filtering, jaise ki agar product ke tags me "cotton", "summer" hai to user search me "cotton shirt" ya "summer dress" type karega to wo is product ko easily find kar payega
  specifications: [{  // For additional product details, jaise ki size, color, material, etc. jo ki product ke description me nahi dena chahte but specifications me dena chahte hai taki user easily dekh sake ki product ke kya-kya features hai
    key: String,
    value: String
  }],
   // Color variants
  colors: [{
    name: String,       // e.g. "Red", "Blue"
    hex: String,        // e.g. "#FF0000"
    images: [{            // images specific to this color
      url: String,
      public_id: String
    }],  // image URLs for this color mtlb agar product ke different colors ke liye alag-alag images dena chahte hai to yaha images denge taki user ko pata chale ki ye color kaisa dikhega aur agar product ke images me color variants ke hisab se images dena chahte hai to yaha images denge taki user ko pata chale ki ye color kaisa dikhega
     sizes: [{             // size stock per color
      label: String,
      stock: { type: Number, default: 0 },
      price: Number       // optional price override per color+size
    }],
    stock: { type: Number, default: 0 }
  }],
  // Size variants  // Global sizes (when variantType is 'size' only — no color)
  sizes: [{
    label: String,      // e.g. "S", "M", "L", "XL", "42", "8"
    stock: { type: Number, default: 0 },
    price: Number       // optional size-based price override mtlb agar size ke hisab se price alag dena hai to yaha price denge otherwise product ke main price ko use kiya jayega
  }],
  // Which variant type: none / size / color / both
  variantType: { type: String, enum: ['none', 'size', 'color', 'both'], default: 'none' },
  reviews: [reviewSchema],
  rating: { type: Number, default: 0 },
  numReviews: { type: Number, default: 0 },
  isFeatured: { type: Boolean, default: false }, // For homepage and category page highlights, agar admin chahte hai ki kuch products ko homepage ya category page par highlight karna hai to un products ke isFeatured ko true kar denge taki wo products easily user ke attention me aa jaye
  isActive: { type: Boolean, default: true },   // For soft delete, agar product ko delete karna hai to uske isActive ko false kar denge taki wo product database me to rahe but frontend par dikhai na de aur agar admin ko kisi deleted product ka data dekhna ho to wo bhi dekh sakega ki kis product ko delete kiya gaya hai
  slug: { type: String, unique: true }, // 
  
  // sku mtlb Stock Keeping Unit, ek unique identifier hota hai jo ki har product ke liye alag hota hai aur inventory management me use hota hai, agar admin chahte hai ki product ke inventory ko manage karna hai to un products ke sku ko unique kar denge taki wo easily identify ho jaye aur inventory management me asani ho jaye
  sku: { type: String, unique: true },  // For inventory management, agar admin chahte hai ki product ke inventory ko manage karna hai to un products ke sku ko unique kar denge taki wo easily identify ho jaye aur inventory management me asani ho jaye
  weight: Number,
  dimensions: {
    length: Number,
    width: Number,
    height: Number
  }
}, { timestamps: true });

// Create slug before saving
productSchema.pre('save', function(next) {
  if (this.isModified('name')) {// Create slug from name before saving, mtlb product ka name hi URL me dikhana hai to usko slug me convert karna padega taki URL-friendly ban jaye aur SEO ke liye bhi acha hota hai,
    this.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now();
  }
  if (!this.sku) {// Generate SKU if not provided, mtlb agar admin SKU provide nahi karta hai to system automatically ek unique SKU generate kar dega taki inventory management me asani ho jaye
    this.sku = 'SKU-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5).toUpperCase();
  }
  // yha discount calculate kar rahe hai taki jab bhi product save ho to uska discount percentage automatically calculate ho jaye aur database me save ho jaye taki frontend par easily dikhaya ja sake ki product par kitna discount hai, mtlb agar product ke price 1000 hai aur discountPrice 800 hai to discountPercent 20% calculate hoke save ho jayega taki frontend par dikhaya ja sake ki product par 20% discount hai
  // Calculate discount
  if (this.discountPrice && this.price) {
    this.discountPercent = Math.round(((this.price - this.discountPrice) / this.price) * 100);
  }
  next();
});

// Calculate average rating
productSchema.methods.calculateRating = function() {
  if (this.reviews.length === 0) {
    this.rating = 0;
    this.numReviews = 0;
  } else {
    this.rating = this.reviews.reduce((acc, review) => acc + review.rating, 0) / this.reviews.length;
    this.numReviews = this.reviews.length;
  }
};

// For text search and filtering, jaise ki agar user search me "cotton shirt" type karta hai to wo product ke name, description aur tags me "cotton" aur "shirt" ko search karega taki user ko relevant products mil jaye, aur agar user price range filter karta hai to wo price index ka use karke quickly relevant products ko find kar sake, aur agar user rating filter karta hai to wo rating index ka use karke quickly relevant products ko find kar sake
// Text search index
productSchema.index({ name: 'text', description: 'text', tags: 'text' });
productSchema.index({ category: 1, isActive: 1 }); // For category-based filtering, jaise ki agar user category filter karta hai to wo category index ka use karke quickly relevant products ko find kar sake
productSchema.index({ price: 1 }); // For price range filtering, jaise ki agar user price range filter karta hai to wo price index ka use karke quickly relevant products ko find kar sake
productSchema.index({ rating: -1 }); // For rating-based filtering, jaise ki agar user rating filter karta hai to wo rating index ka use karke quickly relevant products ko find kar sake -1 mtlb descending order me index create karna taki highest rated products pehle aaye

module.exports = mongoose.model('Product', productSchema);
