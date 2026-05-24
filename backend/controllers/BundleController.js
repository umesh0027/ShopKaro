// controllers/bundleController.js
const Bundle = require('../models/Bundle');
const Product = require('../models/Product');
const { uploadToCloudinary, deleteFromCloudinary } = require('../config/cloudinary');

/* ── helper ── */
const safeJSON = (val, fallback = []) => {
  try { return typeof val === 'string' ? JSON.parse(val) : (val ?? fallback); }
  catch { return fallback; }
};

/* ─────────────────────────────────────────
   HELPER: Recalculate prices from products
───────────────────────────────────────── */
const recalcPrices = async (products, bundlePrice) => {
  // products = [{ product: ObjectId, quantity: Number }]
  const ids = products.map(p => p.product);
  const dbProducts = await Product.find({ _id: { $in: ids } }).select('price discountPrice');

  let originalPrice = 0;
  for (const item of products) {
    const p = dbProducts.find(d => d._id.toString() === item.product.toString());
    if (p) {
      const effectivePrice = p.discountPrice > 0 ? p.discountPrice : p.price;
      originalPrice += effectivePrice * item.quantity;
    }
  }

  const savingsAmount  = Math.max(0, originalPrice - bundlePrice);
  const savingsPercent = originalPrice > 0
    ? Math.round((savingsAmount / originalPrice) * 100)
    : 0;

  return { originalPrice, savingsAmount, savingsPercent };
};

/* ─────────────────────────────────────────
   GET ALL BUNDLES (public)
   GET /api/bundles
───────────────────────────────────────── */
const getBundles = async (req, res) => {
  try {
    const { featured, page = 1, limit = 12 } = req.query;
    const query = { isActive: true };
    if (featured === 'true') query.isFeatured = true;

    const total = await Bundle.countDocuments(query);
    const bundles = await Bundle.find(query)
      .populate('products.product', 'name images price discountPrice discountPercent variantType colors sizes')
      .sort('-createdAt')
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ success: true, bundles, total, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ─────────────────────────────────────────
   GET SINGLE BUNDLE (public)
   GET /api/bundles/:id
───────────────────────────────────────── */
const getBundle = async (req, res) => {
  try {
    const bundle = await Bundle.findOne({
      $or: [{ _id: req.params.id }, { slug: req.params.id }],
      isActive: true
    }).populate('products.product', 'name images price discountPrice discountPercent stock slug variantType colors sizes');

    if (!bundle) return res.status(404).json({ success: false, message: 'Bundle not found' });

    res.json({ success: true, bundle });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ─────────────────────────────────────────
   GET BUNDLES CONTAINING A PRODUCT (public)
   GET /api/bundles/by-product/:productId
   — Used on product detail page to show
     "Frequently Bought Together"
───────────────────────────────────────── */
const getBundlesByProduct = async (req, res) => {
  try {
    const bundles = await Bundle.find({
      isActive: true,
      'products.product': req.params.productId
    })
      .populate('products.product', 'name images price discountPrice discountPercent slug variantType colors sizes')
      .limit(3);

    res.json({ success: true, bundles });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ─────────────────────────────────────────
   CREATE BUNDLE (Admin)
   POST /api/bundles
───────────────────────────────────────── */
const createBundle = async (req, res) => {
  try {
    const { name, description, bundlePrice, isFeatured, tags } = req.body;
    const products = safeJSON(req.body.products);

    if (!products.length) {
      return res.status(400).json({ success: false, message: 'At least one product required' });
    }

    // Upload image if provided
    let image = { url: '', public_id: '' };
    if (req.files?.image) {
      const result = await uploadToCloudinary(req.files.image.data, 'ecommerce/bundles');
      image = { url: result.url, public_id: result.public_id };
    }

    // Recalculate prices
    const { originalPrice, savingsAmount, savingsPercent } = await recalcPrices(products, Number(bundlePrice));

    const bundle = await Bundle.create({
      name,
      description,
      products,
      bundlePrice: Number(bundlePrice),
      originalPrice,
      savingsAmount,
      savingsPercent,
      image,
      isFeatured: isFeatured === 'true' || isFeatured === true,
      tags: safeJSON(tags)
    });

    const populated = await bundle.populate('products.product', 'name images price discountPrice variantType colors sizes');
    res.status(201).json({ success: true, message: 'Bundle created!', bundle: populated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ─────────────────────────────────────────
   UPDATE BUNDLE (Admin)
   PUT /api/bundles/:id
───────────────────────────────────────── */
const updateBundle = async (req, res) => {
  try {
    const bundle = await Bundle.findById(req.params.id);
    if (!bundle) return res.status(404).json({ success: false, message: 'Bundle not found' });

    const updates = { ...req.body };

    if (updates.products) {
      updates.products = safeJSON(updates.products);
    }
    if (updates.tags) {
      updates.tags = safeJSON(updates.tags);
    }
    if (updates.bundlePrice) {
      updates.bundlePrice = Number(updates.bundlePrice);
    }

    // Recalc prices if products or bundlePrice changed
    const newProducts = updates.products || bundle.products;
    const newBundlePrice = updates.bundlePrice || bundle.bundlePrice;
    const { originalPrice, savingsAmount, savingsPercent } = await recalcPrices(newProducts, newBundlePrice);
    updates.originalPrice  = originalPrice;
    updates.savingsAmount  = savingsAmount;
    updates.savingsPercent = savingsPercent;

    // Image update
    if (req.files?.image) {
      if (bundle.image?.public_id) await deleteFromCloudinary(bundle.image.public_id);
      const result = await uploadToCloudinary(req.files.image.data, 'ecommerce/bundles');
      updates.image = { url: result.url, public_id: result.public_id };
    }

    if (typeof updates.isFeatured !== 'undefined') {
      updates.isFeatured = updates.isFeatured === 'true' || updates.isFeatured === true;
    }

    const updated = await Bundle.findByIdAndUpdate(req.params.id, updates, { new: true })
      .populate('products.product', 'name images price discountPrice variantType colors sizes');

    res.json({ success: true, message: 'Bundle updated!', bundle: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ─────────────────────────────────────────
   DELETE BUNDLE (Admin)
   DELETE /api/bundles/:id
───────────────────────────────────────── */
const deleteBundle = async (req, res) => {
  try {
    const bundle = await Bundle.findById(req.params.id);
    if (!bundle) return res.status(404).json({ success: false, message: 'Bundle not found' });

    if (bundle.image?.public_id) await deleteFromCloudinary(bundle.image.public_id);
    await bundle.deleteOne();

    res.json({ success: true, message: 'Bundle deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ─────────────────────────────────────────
   TOGGLE ACTIVE (Admin)
   PATCH /api/bundles/:id/toggle
───────────────────────────────────────── */
const toggleBundle = async (req, res) => {
  try {
    const bundle = await Bundle.findById(req.params.id);
    if (!bundle) return res.status(404).json({ success: false, message: 'Bundle not found' });
    bundle.isActive = !bundle.isActive;
    await bundle.save();
    res.json({ success: true, isActive: bundle.isActive });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ─────────────────────────────────────────
   GET ALL BUNDLES (Admin — includes inactive)
   GET /api/bundles/admin
───────────────────────────────────────── */
const getAdminBundles = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const total = await Bundle.countDocuments();
    const bundles = await Bundle.find()
      .populate('products.product', 'name images price discountPrice variantType colors sizes')
      .sort('-createdAt')
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ success: true, bundles, total, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getBundles, getBundle, getBundlesByProduct,
  createBundle, updateBundle, deleteBundle,
  toggleBundle, getAdminBundles
};