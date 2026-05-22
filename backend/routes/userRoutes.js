const express = require('express');
const router = express.Router();
const { updateProfile, changePassword, addAddress, updateAddress, deleteAddress, toggleWishlist, getWishlist, getAllUsers, toggleUserStatus,deleteAccount } = require('../controllers/userController');
const { protect, adminOnly } = require('../middleware/auth');
const { upload } = require('../config/cloudinary');

router.put('/profile', protect, updateProfile);
router.delete('/account', protect, deleteAccount);
router.put('/change-password', protect, changePassword);
router.post('/addresses', protect, addAddress);
router.put('/addresses/:addressId', protect, updateAddress);
router.delete('/addresses/:addressId', protect, deleteAddress);
router.post('/wishlist/:productId', protect, toggleWishlist);
router.get('/wishlist', protect, getWishlist);

// Admin
router.get('/admin/all', protect, adminOnly, getAllUsers);
router.patch('/admin/:id/toggle', protect, adminOnly, toggleUserStatus);

module.exports = router;
