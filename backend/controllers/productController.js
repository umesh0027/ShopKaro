const Product = require('../models/Product');
const Category = require('../models/Category');
const { cloudinary } = require('../config/cloudinary');
const { uploadToCloudinary, deleteFromCloudinary } = require('../config/cloudinary');
const mongoose = require('mongoose');

// @desc    Get all products with filters
// // @route   GET /api/products
// const getProducts = async (req, res) => {
//   try {
    

//     const {
//       search, category, minPrice, maxPrice, rating,
//       sort = '-createdAt', page = 1, limit = 12,
//       featured, inStock, colors, sizes
//     } = req.query;

//     const query = { isActive: true };

//     if (search) {
//       query.$text = { $search: search };
//     }
//     // if (category) {
//     //   const cat = await Category.findOne({ slug: category });
//     //   if (cat) query.category = cat._id;
//     // }
//     if (category) {
//   const cat = await Category.findOne({ slug: category });
//   if (cat) {
//     if (cat.level === 0) {
//       // Parent category — uske aur saari subcategories ke products lao
//       const subCats = await Category.find({ parent: cat._id });
//       const allIds = [cat._id, ...subCats.map(s => s._id)];
//       query.category = { $in: allIds };
//     } else {
//       // Subcategory — sirf us category ke products
//       query.category = cat._id;
//     }
//   }
// }
//     // Price range filter — works on discountPrice if exists, else price
//     if (minPrice || maxPrice) {
//       const priceFilter = {};
//       if (minPrice) priceFilter.$gte = Number(minPrice);
//       if (maxPrice) priceFilter.$lte = Number(maxPrice);
//       query.$or = [
//         { discountPrice: { ...priceFilter, $gt: 0 }, },
//         { discountPrice: { $eq: 0 }, price: priceFilter },
//         { discountPrice: { $exists: false }, price: priceFilter }
//       ];
//     }
//     if (rating) query.rating = { $gte: Number(rating) };
//     if (featured === 'true') query.isFeatured = true;
//     if (inStock === 'true') query.stock = { $gt: 0 };
//     // Color filter
//     if (colors) {
//       const colorArr = colors.split(',').map(c => c.trim().toLowerCase());
//       query['colors.name'] = { $in: colorArr.map(c => new RegExp(c, 'i')) };
//     }
//     // Size filter
//     if (sizes) {
//       const sizeArr = sizes.split(',').map(s => s.trim());
//       query['sizes.label'] = { $in: sizeArr };
//     }
//     const skip = (Number(page) - 1) * Number(limit);
//     const total = await Product.countDocuments(query);
//     const products = await Product.find(query)
//       .populate('category', 'name slug')
//       .sort(sort)
//       .skip(skip)
//       .limit(Number(limit));

//     res.json({
//       success: true,
//       products,
//       total,
//       page: Number(page),
//       pages: Math.ceil(total / Number(limit))
//     });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // @desc    Get single product
// // @route   GET /api/products/:id




// const getProduct = async (req, res) => {
//   try {
//     const { id } = req.params;

//     let product;

//     if (mongoose.Types.ObjectId.isValid(id)) {
//       product = await Product.findOne({ _id: id, isActive: true });
//     } else {
//       product = await Product.findOne({ slug: id, isActive: true });
//     }

//     if (!product) {
//       return res.status(404).json({ success: false, message: 'Product not found' });
//     }
//    product = await Product.findById(product._id)
//   .populate('category', 'name slug sizeType customSizes')
//   .populate('reviews.user', 'name avatar');

//     const related = await Product.find({
//       category: product.category._id,
//       _id: { $ne: product._id },
//       isActive: true
//     })
//       .limit(4)
//       .populate('category', 'name slug');

//     res.json({ success: true, product, related });

//   } catch (error) {
//     console.error(error); // 👈 add this for debugging
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // @desc    Create product (Admin)
// // @route   POST /api/products
// const createProduct = async (req, res) => {
//   try {
//     const { name, description, shortDescription, price, discountPrice, stock, category, tags, specifications } = req.body;
//     const images = req.files ? req.files.map(f => ({ url: f.path, public_id: f.filename })) : [];

//     if (images.length === 0) {
//       return res.status(400).json({ success: false, message: 'At least one image is required' });
//     }

//     // Process per-color images
//     let parsedColors = req.body.colors ? JSON.parse(req.body.colors) : [];
//     if (parsedColors.length > 0 && req.files) {
//       parsedColors = parsedColors.map((color, i) => {
//         const colorFiles = req.files.filter(f => f.fieldname === `colorImages_${i}`);
//         const colorImgs = colorFiles.map(f => ({ url: f.path, public_id: f.filename }));
//         return { ...color, images: [...(color.images || []), ...colorImgs] };
//       });
//     }


//     const product = await Product.create({
//       name, description, shortDescription,
//       price: Number(price),
//       discountPrice: discountPrice ? Number(discountPrice) : 0,
//       stock: Number(stock),
//       category,
//       images,
//       tags: tags ? JSON.parse(tags) : [],
//       specifications: specifications ? JSON.parse(specifications) : [],
//       colors: parsedColors,
//       sizes: req.body.sizes ? JSON.parse(req.body.sizes) : [],
//       variantType: req.body.variantType || 'none'
//     });

//     // Update category product count
//     await Category.findByIdAndUpdate(category, { $inc: { productCount: 1 } });

//     const populated = await product.populate('category', 'name slug');
//     res.status(201).json({ success: true, message: 'Product created successfully', product: populated });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // @desc    Update product (Admin)
// // @route   PUT /api/products/:id
// const updateProduct = async (req, res) => {
//   try {
//     const product = await Product.findById(req.params.id);
//     if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

//     const updates = { ...req.body };
//       // ✅ Category change hone par productCount sync karo
//     const oldCategoryId = product.category?.toString();
//     const newCategoryId = updates.category?.toString();

//     if (newCategoryId && oldCategoryId !== newCategoryId) {
//       await Category.findByIdAndUpdate(oldCategoryId, { $inc: { productCount: -1 } });
//       await Category.findByIdAndUpdate(newCategoryId, { $inc: { productCount: 1 } });
//     }
//     if (updates.price) updates.price = Number(updates.price);
//     if (updates.discountPrice) updates.discountPrice = Number(updates.discountPrice);
//     if (updates.stock) updates.stock = Number(updates.stock);
//     if (updates.tags && typeof updates.tags === 'string') updates.tags = JSON.parse(updates.tags);
//     if (updates.specifications && typeof updates.specifications === 'string') updates.specifications = JSON.parse(updates.specifications);
//      if (updates.colors && typeof updates.colors === 'string'){
//           let parsedColors = JSON.parse(updates.colors);
//       if (parsedColors.length > 0 && req.files) {
//         parsedColors = parsedColors.map((color, i) => {
//           const colorFiles = req.files.filter(f => f.fieldname === `colorImages_${i}`);
//           const colorImgs = colorFiles.map(f => ({ url: f.path, public_id: f.filename }));
//           return { ...color, images: [...(color.images || []), ...colorImgs] };
//         });
//       }
//       updates.colors = parsedColors;
//         }
//     if (updates.sizes && typeof updates.sizes === 'string') updates.sizes = JSON.parse(updates.sizes);

//     // Handle new images
//     if (req.files && req.files.length > 0) {
//       const newImages = req.files.map(f => ({ url: f.path, public_id: f.filename }));
//       updates.images = [...product.images, ...newImages];
//     }

//     // Calculate discount percent
//     const finalPrice = updates.price || product.price;
//     const finalDiscount = updates.discountPrice || product.discountPrice;
//     if (finalDiscount && finalPrice) {
//       updates.discountPercent = Math.round(((finalPrice - finalDiscount) / finalPrice) * 100);
//     }

//     const updated = await Product.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true })
//       .populate('category', 'name slug');

//     res.json({ success: true, message: 'Product updated successfully', product: updated });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // @desc    Delete product (Admin)
// // @route   DELETE /api/products/:id
// const deleteProduct = async (req, res) => {
//   try {
//     const product = await Product.findById(req.params.id);
//     if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

//     // Delete images from cloudinary
//     for (const img of product.images) {
//       if (img.public_id) await cloudinary.uploader.destroy(img.public_id);
//     }

//     await Category.findByIdAndUpdate(product.category, { $inc: { productCount: -1 } });
//     await product.deleteOne();
//     res.json({ success: true, message: 'Product deleted successfully' });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };




/* ── helper: safe file array ── */
const getFilesArray = (files, key) => {
  if (!files || !files[key]) return [];
  return Array.isArray(files[key]) ? files[key] : [files[key]];
};

/* ── helper: upload global images ── */
const uploadProductImages = async (files) => {
  const fileArr = getFilesArray(files, 'images');
  return Promise.all(
    fileArr.map(f => uploadToCloudinary(f.data, 'ecommerce/products'))
  );
};

/* ── helper: upload color images ── */
const uploadColorImages = async (files, index) => {
  const fileArr = getFilesArray(files, `colorImages_${index}`);
  return Promise.all(
    fileArr.map(f => uploadToCloudinary(f.data, 'ecommerce/products/colors'))
  );
};

/* ── helper: safe JSON parse ── */
const safeJSON = (val, fallback = []) => {
  try {
    return typeof val === 'string' ? JSON.parse(val) : val;
  } catch {
    return fallback;
  }
};

/* ============================= */
/* GET PRODUCTS */
/* ============================= */
const getProducts = async (req, res) => {
  try {
    const {
      search, category, minPrice, maxPrice, rating,
      sort = '-createdAt', page = 1, limit = 12,
      featured, inStock, colors, sizes
    } = req.query;

    const query = { isActive: true };

    // if (search) query.$text = { $search: search };
       if (search) {
  // 1. Find categories + subcategories matching search
  const matchedCategories = await Category.find({
    name: { $regex: search, $options: 'i' }
  }).select('_id');

  const categoryIds = matchedCategories.map(c => c._id);

  // 2. Combine search
  query.$and = query.$and || [];

  query.$and.push({
    $or: [
      { $text: { $search: search } },   // product fields  (tags, description , product name)
      { category: { $in: categoryIds } } // category/subcategory match
    ]
  });
}


    // ✅ FIXED category logic (parent + subcategories)
    if (category) {
      const cat = await Category.findOne({ slug: category });
      if (cat) {
        if (cat.level === 0) {
          const subs = await Category.find({ parent: cat._id });
          query.category = { $in: [cat._id, ...subs.map(s => s._id)] };
        } else {
          query.category = cat._id;
        }
      }
    }

    if (minPrice || maxPrice) {
      const pf = {};
      if (minPrice) pf.$gte = Number(minPrice);
      if (maxPrice) pf.$lte = Number(maxPrice);

      query.$or = [
        { discountPrice: { ...pf, $gt: 0 } },
        { discountPrice: { $eq: 0 }, price: pf },
        { discountPrice: { $exists: false }, price: pf }
      ];
    }

    if (rating) query.rating = { $gte: Number(rating) };
    if (featured === 'true') query.isFeatured = true;
    if (inStock === 'true') query.stock = { $gt: 0 };

    if (colors) {
      const arr = colors.split(',').map(c => c.trim());
      query['colors.name'] = { $in: arr.map(c => new RegExp(c, 'i')) };
    }

    if (sizes) {
      const arr = sizes.split(',').map(s => s.trim());
      query['sizes.label'] = { $in: arr };
    }

    const skip = (page - 1) * limit;

    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .populate('category', 'name slug')
      .sort(sort)
      .skip(skip)
      .limit(Number(limit));

    res.json({
      success: true,
      products,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit)
    });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ============================= */
/* GET SINGLE PRODUCT */
/* ============================= */
const getProduct = async (req, res) => {
  try {
    let product;

    if (mongoose.Types.ObjectId.isValid(req.params.id)) {
      product = await Product.findOne({ _id: req.params.id, isActive: true });
    } else {
      product = await Product.findOne({ slug: req.params.id, isActive: true });
    }

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    product = await Product.findById(product._id)
      .populate('category', 'name slug sizeType customSizes')
      .populate('reviews.user', 'name avatar');

    const related = await Product.find({
      category: product.category._id,
      _id: { $ne: product._id },
      isActive: true
    }).limit(4);

    res.json({ success: true, product, related });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ============================= */
/* CREATE PRODUCT */
/* ============================= */
const createProduct = async (req, res) => {
  try {
    const {
      name, description, shortDescription,
      price, discountPrice, stock, category,
      tags, specifications, colors, sizes, variantType
    } = req.body;

    const images = await uploadProductImages(req.files);

    if (!images.length) {
      return res.status(400).json({ success: false, message: 'At least one image required' });
    }

    let parsedColors = safeJSON(colors);
    parsedColors = await Promise.all(
      parsedColors.map(async (c, i) => ({
        ...c,
        images: [
          ...(c.images || []),
          ...(await uploadColorImages(req.files, i))
        ]
      }))
    );

    const product = await Product.create({
      name,
      description,
      shortDescription,
      price: Number(price),
      discountPrice: Number(discountPrice || 0),
      stock: Number(stock),
      category,
      images,
      tags: safeJSON(tags),
      specifications: safeJSON(specifications),
      colors: parsedColors,
      sizes: safeJSON(sizes),
      variantType: variantType || 'none'
    });

    await Category.findByIdAndUpdate(category, { $inc: { productCount: 1 } });

    res.status(201).json({ success: true, product });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ============================= */
/* UPDATE PRODUCT */
/* ============================= */
const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Not found' });

    const updates = { ...req.body };

    // ✅ category count sync
    if (updates.category && updates.category !== product.category.toString()) {
      await Category.findByIdAndUpdate(product.category, { $inc: { productCount: -1 } });
      await Category.findByIdAndUpdate(updates.category, { $inc: { productCount: 1 } });
    }

    updates.price = Number(updates.price || product.price);
    updates.discountPrice = Number(updates.discountPrice || product.discountPrice);
    updates.stock = Number(updates.stock || product.stock);

    updates.tags = safeJSON(updates.tags, product.tags);
    updates.specifications = safeJSON(updates.specifications, product.specifications);
    updates.sizes = safeJSON(updates.sizes, product.sizes);

    if (updates.colors) {
      let parsed = safeJSON(updates.colors);
      parsed = await Promise.all(
        parsed.map(async (c, i) => ({
          ...c,
          images: [
            ...(c.images || []),
            ...(await uploadColorImages(req.files, i))
          ]
        }))
      );
      updates.colors = parsed;
    }

    // upload new images
    if (req.files?.images) {
      const newImgs = await uploadProductImages(req.files);
      updates.images = [...product.images, ...newImgs];
    }

    // discount %
    if (updates.discountPrice && updates.price) {
      updates.discountPercent = Math.round(
        ((updates.price - updates.discountPrice) / updates.price) * 100
      );
    }

    const updated = await Product.findByIdAndUpdate(req.params.id, updates, { new: true });

    res.json({ success: true, product: updated });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ============================= */
/* DELETE PRODUCT */
/* ============================= */
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Not found' });

    for (const img of product.images) {
      await deleteFromCloudinary(img.public_id);
    }

    for (const c of product.colors || []) {
      for (const img of c.images || []) {
        await deleteFromCloudinary(img.public_id);
      }
    }

    await Category.findByIdAndUpdate(product.category, { $inc: { productCount: -1 } });
    await product.deleteOne();

    res.json({ success: true, message: 'Deleted' });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};



// @desc    Delete product image
// @route   DELETE /api/products/:id/image
const deleteProductImage = async (req, res) => {
  try {
    const { public_id } = req.body;
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    await cloudinary.uploader.destroy(public_id);
    product.images = product.images.filter(img => img.public_id !== public_id);
    await product.save();
    res.json({ success: true, message: 'Image deleted', product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Toggle featured
// @route   PATCH /api/products/:id/featured
const toggleFeatured = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    product.isFeatured = !product.isFeatured;
    await product.save();
    res.json({ success: true, isFeatured: product.isFeatured });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add review
// @route   POST /api/products/:id/reviews
const addReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    const alreadyReviewed = product.reviews.find(r => r.user.toString() === req.user._id.toString());
    if (alreadyReviewed) {
      return res.status(400).json({ success: false, message: 'You have already reviewed this product' });
    }

    product.reviews.push({
      user: req.user._id,
      name: req.user.name,
      rating: Number(rating),
      comment
    });

    product.calculateRating();
    await product.save();
    const updated = await Product.findById(req.params.id).populate('reviews.user', 'name avatar');
    res.status(201).json({ success: true, message: 'Review added', product: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Admin reply to review
// @route   PATCH /api/products/:id/reviews/:reviewId/reply
const replyToReview = async (req, res) => {
  try {
    const { reply } = req.body;
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    const review = product.reviews.id(req.params.reviewId);
    if (!review) return res.status(404).json({ success: false, message: 'Review not found' });
    review.adminReply = reply;
    await product.save();
    res.json({ success: true, message: 'Reply added' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete review (Admin)
const deleteReview = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    product.reviews = product.reviews.filter(r => r._id.toString() !== req.params.reviewId);
    product.calculateRating();
    await product.save();
    res.json({ success: true, message: 'Review deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all products for admin
const getAdminProducts = async (req, res) => {
  try {
    const { search, category, page = 1, limit = 20 } = req.query;
    const query = {};
    if (search) query.$text = { $search: search };
    if (category) query.category = category;

    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .populate('category', 'name')
      .sort('-createdAt')
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ success: true, products, total, pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// / @desc  Get available filter options for a category
// @route GET /api/products/filter-options
const getFilterOptions = async (req, res) => {
  try {
    const { category } = req.query;
    const match = { isActive: true };
    if (category) {
      const cat = await Category.findOne({ slug: category });
      if (cat) match.category = cat._id;
    }

    const agg = await Product.aggregate([
      { $match: match },
      {
        $facet: {
          priceRange: [
            {
              $project: {
                effectivePrice: {
                  $cond: [{ $and: [{ $gt: ['$discountPrice', 0] }] }, '$discountPrice', '$price']
                }
              }
            },
            {
              $group: {
                _id: null,
                min: { $min: '$effectivePrice' },
                max: { $max: '$effectivePrice' }
              }
            }
          ],
          colors: [
            { $unwind: { path: '$colors', preserveNullAndEmptyArrays: false } },
            { $group: { _id: { name: '$colors.name', hex: '$colors.hex' } } },
            { $project: { _id: 0, name: '$_id.name', hex: '$_id.hex' } },
            { $sort: { name: 1 } }
          ],
          sizes: [
            { $unwind: { path: '$sizes', preserveNullAndEmptyArrays: false } },
            { $group: { _id: '$sizes.label' } },
            { $project: { _id: 0, label: '$_id' } },
            { $sort: { label: 1 } }
          ]
        }
      }
    ]);

    const result = agg[0];
    res.json({
      success: true,
      priceRange: result.priceRange[0] || { min: 0, max: 10000 },
      colors: result.colors || [],
      sizes: result.sizes.map(s => s.label) || []
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


module.exports = {
  getProducts, getProduct, createProduct, updateProduct, deleteProduct,
  deleteProductImage, toggleFeatured, addReview, replyToReview, deleteReview, getAdminProducts, getFilterOptions
};
