const mongoose = require('mongoose');




// why need slug? mtlb category ka name hi URL me dikhana hai to usko slug me convert karna padega taki URL-friendly ban jaye aur SEO ke liye bhi acha hota hai, jaise ki agar category ka name "Men's Clothing" hai to uska slug "mens-clothing" ban jayega aur URL me /category/mens-clothing dikhai dega instead of /category/60f7c0b9e1d2c8a1b2c3d4e5 jisse user ko samajhne me asani hoti hai ki ye category kis cheez se related hai aur SEO ke liye bhi acha hota hai kyunki search engines ko bhi samajhne me asani hoti hai ki ye page kis topic se related hai


const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Category name is required'],
    trim: true,
    maxlength: [50, 'Category name cannot exceed 50 characters']
  },
  //// slug mtlb URL-friendly version of name, generated automatically using pre-save hook and used in frontend routing instead of _id for better SEO and user-friendly URLs
  slug: {  // For SEO-friendly URLs, generated from name using pre-save hook(middleware) and used in frontend routing instead of _id
    type: String,
    unique: true,
    lowercase: true
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  image: {
    url: { type: String, default: '' }, // For category image, optional but if provided should have a URL, default is empty string
    public_id: { type: String, default: '' } // For Cloudinary public ID, useful for deleting/updating the image in Cloudinary when category is updated or deleted
  },
  isActive: { type: Boolean, default: true }, // To soft delete categories, instead of actually deleting the document from database we can just set isActive to false and filter out inactive categories in our queries, this way we can keep the data for analytics and also avoid issues with products that belong to deleted categories
  productCount: { type: Number, default: 0 },

  // Parent-child relationship
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    default: null   // null = top-level category
  },
  level: {
    type: Number,
    default: 0      // 0 = parent, 1 = sub-category
  },

  // Size configuration — set on sub-categories
  sizeType: {
    type: String,
    enum: ['none', 'clothing', 'bottomwear', 'footwear', 'custom'],
    default: 'none'
  },
  customSizes: [String]   // used when sizeType = 'custom'
}, { timestamps: true });

// categorySchema.pre('save', function(next) { // Create slug from name before saving, mtlb category ka name hi URL me dikhana hai to usko slug me convert karna padega taki URL-friendly ban jaye aur SEO ke liye bhi acha hota hai, jaise ki agar category ka name "Men 's Clothing" hai to uska slug "mens-clothing" ban jayega aur URL me /category/mens-clothing dikhai dega instead of /category/60f7c0b9e1d2c8a1b2c3d4e5 jisse user ko samajhne me asani hoti hai ki ye category kis cheez se related hai aur SEO ke liye bhi acha hota hai kyunki search engines ko bhi samajhne me asani hoti hai ki ye page kis topic se related hai
//   this.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');  // Generate slug from name, mtlb jo category ka name hai usko lowercase me convert karenge aur spaces ko hyphens me replace karenge aur special characters ko remove karenge taki URL-friendly slug ban jaye
//   next();
// });

categorySchema.pre('save', function(next) {
  // Slug = parent-slug--child-name (auto-unique)
  const base = this.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  this.slug = base + (this.isNew ? '-' + Date.now().toString(36) : '');
  if(this.isNew) this.slug = base; // first save clean
  next();
});


module.exports = mongoose.model('Category', categorySchema);
