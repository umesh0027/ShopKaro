// // ===== categoryRoutes.js =====
// const express = require('express');
// const catRouter = express.Router();
// const { getCategories, getCategory, createCategory, updateCategory, deleteCategory, toggleCategory,syncProductCounts } = require('../controllers/categoryController');
// const { protect, adminOnly } = require('../middleware/auth');
// const { upload } = require('../config/cloudinary');

// catRouter.post('/sync-counts', protect, adminOnly, syncProductCounts);
// catRouter.get('/', getCategories);
// catRouter.get('/:id', getCategory);
// catRouter.post('/', protect, adminOnly, upload.single('image'), createCategory);
// catRouter.put('/:id', protect, adminOnly, upload.single('image'), updateCategory);
// catRouter.delete('/:id', protect, adminOnly, deleteCategory);
// catRouter.patch('/:id/toggle', protect, adminOnly, toggleCategory);

// module.exports = catRouter;


const express    = require('express');
const catRouter  = express.Router();
const {
  getCategories, getCategory, createCategory,
  updateCategory, deleteCategory, toggleCategory
} = require('../controllers/categoryController');
const { protect, adminOnly } = require('../middleware/auth');

catRouter.get('/',          getCategories);
catRouter.get('/:id',       getCategory);
catRouter.post('/',         protect, adminOnly, createCategory);
catRouter.put('/:id',       protect, adminOnly, updateCategory);
catRouter.delete('/:id',    protect, adminOnly, deleteCategory);
catRouter.patch('/:id/toggle', protect, adminOnly, toggleCategory);

module.exports = catRouter;