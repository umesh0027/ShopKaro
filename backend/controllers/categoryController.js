


const Category = require('../models/Category');
const { cloudinary } = require('../config/cloudinary');
const {uploadToCloudinary,deleteFromCloudinary}=require("../config/cloudinary")

// @desc    Get all categories with sub-categories nested
// @route   GET /api/categories
const getCategories = async (req, res) => {
  try {
    const { active, flat } = req.query;
    const match = {};
    if (active === 'true') match.isActive = true;

    // flat=true → return all as flat array (for product form selects)
    if (flat === 'true') {
      const all = await Category.find(match).sort('level name').populate('parent','name slug');
      return res.json({ success: true, categories: all });
    }

    // Default → nested tree (parent categories + their children)
    const parents = await Category.find({ ...match, parent: null }).sort('name');
    const children = await Category.find({ ...match, parent: { $ne: null } })
      .sort('name')
      .populate('parent', 'name slug');

    // Attach children to parents
    const tree = parents.map(p => ({
      ...p.toObject(),
      subCategories: children.filter(c => c.parent?._id.toString() === p._id.toString())
    }));

    res.json({ success: true, categories: tree, flat: [...parents, ...children] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single category
// @route   GET /api/categories/:id
const getCategory = async (req, res) => {
  try {
    const category = await Category.findOne({
      $or: [{ _id: req.params.id }, { slug: req.params.id }]
    }).populate('parent', 'name slug');
    if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
    res.json({ success: true, category });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create category (Admin)
// @route   POST /api/categories
const createCategory = async (req, res) => {
  try {
    const { name, description, sizeType = 'none', customSizes, parentId } = req.body;

    // Determine level
    let level = 0;
    let parent = null;

    if (parentId) {
      const parentCat = await Category.findById(parentId);
      if (!parentCat) return res.status(404).json({ success: false, message: 'Parent category not found' });
      parent = parentId;
      level = 1;
    }

    let image = { url: '', public_id: '' };

    // ye multer k liye hai 
    // if (req.file) {
    //   image = { url: req.file.path, public_id: req.file.filename };
    // }

     // ✅ express-fileupload
    if (req.files && req.files.image) {
      const file = req.files.image;

      const result = await uploadToCloudinary(file.data, 'categories');

      image = {
        url: result.url,
        public_id: result.public_id
      };
    }


    const category = await Category.create({
      name, description, image,
      sizeType,
      customSizes: customSizes ? JSON.parse(customSizes) : [],
      parent,
      level
    });

    const populated = await category.populate('parent', 'name slug');
    res.status(201).json({ success: true, message: 'Category created successfully', category: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update category (Admin)
// @route   PUT /api/categories/:id
const updateCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ success: false, message: 'Category not found' });

    const updates = { ...req.body };
    if (updates.customSizes && typeof updates.customSizes === 'string') {
      updates.customSizes = JSON.parse(updates.customSizes);
    }
    // Handle parentId change
    if ('parentId' in updates) {
      updates.parent = updates.parentId || null;
      updates.level  = updates.parentId ? 1 : 0;
      delete updates.parentId;
    }

    // for multer
    // if (req.file) {
    //   if (category.image.public_id) await cloudinary.uploader.destroy(category.image.public_id);
    //   updates.image = { url: req.file.path, public_id: req.file.filename };
    // }

    // ✅ Update image (NO multer)
    if (req.files && req.files.image) {
      if (category.image?.public_id) {
        await deleteFromCloudinary(category.image.public_id);
      }

      const result = await uploadToCloudinary(req.files.image.data, 'categories');

      updates.image = {
        url: result.url,
        public_id: result.public_id
      };
    }

    const updated = await Category.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true })
      .populate('parent', 'name slug');
    res.json({ success: true, message: 'Category updated', category: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete category (Admin)
// @route   DELETE /api/categories/:id
const deleteCategory = async (req, res) => {
  try {
    const Product = require('../models/Product');
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ success: false, message: 'Category not found' });

    // Check products
    const productCount = await Product.countDocuments({ category: req.params.id });
    if (productCount > 0) {
      return res.status(400).json({ success: false, message: `Cannot delete: ${productCount} products exist` });
    }
    // Check sub-categories
    const subCount = await Category.countDocuments({ parent: req.params.id });
    if (subCount > 0) {
      return res.status(400).json({ success: false, message: `Cannot delete: ${subCount} sub-categories exist. Delete them first.` });
    }

    // for multer
    // if (category.image.public_id) await cloudinary.uploader.destroy(category.image.public_id);

     // ✅ Delete image
    if (category.image?.public_id) {
      await deleteFromCloudinary(category.image.public_id);
    }
    await category.deleteOne();
    res.json({ success: true, message: 'Category deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Toggle category active status
// @route   PATCH /api/categories/:id/toggle
const toggleCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
    category.isActive = !category.isActive;
    await category.save();
    res.json({ success: true, isActive: category.isActive });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
// @desc    Sync all category product counts
// @route   POST /api/categories/sync-counts
const syncProductCounts = async (req, res) => {
  try {
    const Product = require('../models/Product');
    const categories = await Category.find({});
    
    await Promise.all(
      categories.map(async (cat) => {
        const count = await Product.countDocuments({ category: cat._id });
        await Category.findByIdAndUpdate(cat._id, { productCount: count });
      })
    );

    res.json({ success: true, message: 'Product counts synced!' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getCategories, getCategory, createCategory, updateCategory, deleteCategory, toggleCategory,syncProductCounts };