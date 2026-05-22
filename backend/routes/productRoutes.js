// const express = require('express');
// const router = express.Router();
// const {
//   getProducts, getProduct, createProduct, updateProduct, deleteProduct,
//   deleteProductImage, toggleFeatured, addReview, replyToReview, deleteReview, getAdminProducts,getFilterOptions
// } = require('../controllers/productController');
// const { protect, adminOnly } = require('../middleware/auth');
// const { upload } = require('../config/cloudinary');

// // Accept both global 'images' and per-color 'colorImages_N' fields
// const productUpload = upload.fields([ // Global product images
//   { name: 'images', maxCount: 10 },
//   { name: 'colorImages_0', maxCount: 5 },
//   { name: 'colorImages_1', maxCount: 5 },
//   { name: 'colorImages_2', maxCount: 5 },
//   { name: 'colorImages_3', maxCount: 5 },
//   { name: 'colorImages_4', maxCount: 5 },
//   { name: 'colorImages_5', maxCount: 5 },
//   { name: 'colorImages_6', maxCount: 5 },
//   { name: 'colorImages_7', maxCount: 5 },
//   { name: 'colorImages_8', maxCount: 5 },
//   { name: 'colorImages_9', maxCount: 5 },
// ]);

// // Flatten files so controllers can use req.files as array with fieldname property
// const flattenFiles = (req, res, next) => { // Agar req.files ek object hai jisme fieldname ke hisab se arrays hai (jo ki multer ka default behavior hai jab multiple fields ke liye upload karte hai), to usko flatten kar denge taki controllers me req.files ko ek simple array ke roop me access kar sake jisme har file object me uska fieldname bhi ho, taki controllers me easily identify kar sake ki kaunse file kaunsi field se aayi hai, aur agar req.files already ek array hai to usko waise hi rehne denge
//   if (req.files && !Array.isArray(req.files)) {
//     const flat = []; //
//     Object.entries(req.files).forEach(([fieldname, files]) => {
//       files.forEach(f => flat.push({ ...f, fieldname }));
//     });
//     req.files = flat;
//   }
//   next();
// };

// router.get('/', getProducts);
// router.get('/filter-options', getFilterOptions);
// router.get('/admin/all', protect, adminOnly, getAdminProducts);
// router.get('/:id', getProduct);

// router.post('/', protect, adminOnly, productUpload, flattenFiles, createProduct);
// router.put('/:id', protect, adminOnly, productUpload, flattenFiles, updateProduct);
// // router.post('/', protect, adminOnly, upload.array('images', 5), createProduct);
// // router.put('/:id', protect, adminOnly, upload.array('images', 5), updateProduct);
// router.delete('/:id', protect, adminOnly, deleteProduct);
// router.delete('/:id/image', protect, adminOnly, deleteProductImage);
// router.patch('/:id/featured', protect, adminOnly, toggleFeatured);

// router.post('/:id/reviews', protect, addReview);
// router.patch('/:id/reviews/:reviewId/reply', protect, adminOnly, replyToReview);
// router.delete('/:id/reviews/:reviewId', protect, adminOnly, deleteReview);

// module.exports = router;



const express = require('express');
const router  = express.Router();
const {
  getProducts, getProduct, createProduct, updateProduct, deleteProduct,
  deleteProductImage, toggleFeatured, addReview, replyToReview,
  deleteReview, getAdminProducts, getFilterOptions
} = require('../controllers/productController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/',              getProducts);
router.get('/filter-options', getFilterOptions);
router.get('/admin/all',     protect, adminOnly, getAdminProducts);
router.get('/:id',           getProduct);

// No multer middleware — express-fileupload handles req.files globally
router.post('/',             protect, adminOnly, createProduct);
router.put('/:id',           protect, adminOnly, updateProduct);
router.delete('/:id',        protect, adminOnly, deleteProduct);
router.delete('/:id/image',  protect, adminOnly, deleteProductImage);
router.patch('/:id/featured',protect, adminOnly, toggleFeatured);

router.post('/:id/reviews',                    protect, addReview);
router.patch('/:id/reviews/:reviewId/reply',   protect, adminOnly, replyToReview);
router.delete('/:id/reviews/:reviewId',        protect, adminOnly, deleteReview);

module.exports = router;