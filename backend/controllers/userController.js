const User = require('../models/User');

const { uploadToCloudinary, deleteFromCloudinary } = require('../config/cloudinary');
const { sendEmail } = require('../utils/email');

// @desc    Update profile
// @route   PUT /api/users/profile
const updateProfile = async (req, res) => {
  try {
    const { name, phone } = req.body;
    const updates = { name, phone };

    // for multer
    // if (req.file) {
    //   const user = await User.findById(req.user._id);
    //   if (user.avatar.public_id) await cloudinary.uploader.destroy(user.avatar.public_id);
    //   updates.avatar = { url: req.file.path, public_id: req.file.filename };
    // }


    // for cloudinary
      if (req.files && req.files.avatar) {
      const file = Array.isArray(req.files.avatar)
        ? req.files.avatar[0]
        : req.files.avatar;

      const user = await User.findById(req.user._id);

      // delete old avatar
      if (user?.avatar?.public_id) {
        await deleteFromCloudinary(user.avatar.public_id);
      }

      const uploaded = await uploadToCloudinary(
        file.data,
        'ecommerce/users'
      );

      updates.avatar = {
        url: uploaded.url,
        public_id: uploaded.public_id
      };
    }
    
    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true });
    res.json({ success: true, message: 'Profile updated', user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Change password
// @route   PUT /api/users/change-password
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    user.password = newPassword;
    await user.save();
    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add address
// @route   POST /api/users/addresses
const addAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
     // If setting default → remove others
    if (req.body.isDefault) {
      user.addresses.forEach(a => a.isDefault = false);
    }
    if (user.addresses.length === 0) req.body.isDefault = true;
    user.addresses.push(req.body);
    await user.save();
    res.status(201).json({ success: true, message: 'Address added', addresses: user.addresses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update address
// @route   PUT /api/users/addresses/:addressId
const updateAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const address = user.addresses.id(req.params.addressId);
    if (!address) return res.status(404).json({ success: false, message: 'Address not found' });
    if (req.body.isDefault) user.addresses.forEach(a => a.isDefault = false);
    Object.assign(address, req.body);
    await user.save();
    res.json({ success: true, message: 'Address updated', addresses: user.addresses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete address
// @route   DELETE /api/users/addresses/:addressId
const deleteAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.addresses = user.addresses.filter(a => a._id.toString() !== req.params.addressId);
    await user.save();
    res.json({ success: true, message: 'Address removed', addresses: user.addresses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Toggle wishlist
// @route   POST /api/users/wishlist/:productId
const toggleWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const productId = req.params.productId;
    const idx = user.wishlist.findIndex(id => id.toString() === productId);
    let action;
    if (idx === -1) {
      user.wishlist.push(productId);
      action = 'added';
    } else {
      user.wishlist.splice(idx, 1);
      action = 'removed';
    }
    await user.save();
    res.json({ success: true, message: `Product ${action} from wishlist`, action });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get wishlist
// @route   GET /api/users/wishlist
const getWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: 'wishlist',
      select: 'name images price discountPrice rating numReviews slug',
      populate: { path: 'category', select: 'name slug' }
    });
    res.json({ success: true, wishlist: user.wishlist });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ADMIN: Get all users
const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const query = search ? { $or: [{ name: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }] } : {};
    const total = await User.countDocuments({ ...query, role: 'user' });
    const users = await User.find({ ...query, role: 'user' })
      .sort('-createdAt')
      .skip((page - 1) * limit)
      .limit(Number(limit));
    res.json({ success: true, users, total, pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ADMIN: Toggle user active status
const toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    user.isActive = !user.isActive;
    await user.save();
    res.json({ success: true, isActive: user.isActive });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete (deactivate) own account
// @route   DELETE /api/users/account
const deleteAccount = async (req, res) => {
  try {
    const { password } = req.body;
    const user = await User.findById(req.user._id).select('+password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // Verify password before deleting
    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(400).json({ success: false, message: 'Incorrect password. Please try again.' });

    // Soft delete — set isActive false
    user.isActive = false;
    await user.save();

    // Send goodbye email
    
    await sendEmail({
      to: user.email,
      subject: 'Account Deactivated - ShopKaro',
      html: `
        <div style="font-family:'Segoe UI',sans-serif;max-width:600px;margin:0 auto;background:#f8f9fa;padding:20px">
          <div style="background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);padding:40px;border-radius:12px 12px 0 0;text-align:center">
            <h1 style="color:white;margin:0;font-size:24px">Account Deactivated</h1>
          </div>
          <div style="background:white;padding:40px;border-radius:0 0 12px 12px;box-shadow:0 4px 20px rgba(0,0,0,0.1)">
            <p>Hi <strong>${user.name}</strong>,</p>
            <p>Your ShopKaro account has been successfully deactivated.</p>
            <div style="background:#fef3c7;padding:15px;border-radius:8px;border-left:4px solid #f59e0b;margin:20px 0">
              <p style="margin:0;color:#92400e;font-size:14px">
                <strong>Want to come back?</strong> Your account data is preserved. Contact us at 
                <a href="mailto:support@shopkaro.com">support@shopkaro.com</a> to reactivate.
              </p>
            </div>
            <p style="color:#666;font-size:13px">Thank you for being a ShopKaro customer. We hope to see you again!</p>
            <p style="color:#999;font-size:12px;text-align:center">© 2024 ShopKaro. All rights reserved.</p>
          </div>
        </div>`
    });

    res.json({ success: true, message: 'Account deactivated successfully. You have been logged out.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { updateProfile, changePassword, addAddress, updateAddress, deleteAddress, toggleWishlist, getWishlist, getAllUsers, toggleUserStatus,deleteAccount };
