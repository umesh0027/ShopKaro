const User = require('../models/User');
const { generateToken } = require('../middleware/auth');
const { sendEmail, emailTemplates } = require('../utils/email');

// @desc    Register user
// @route   POST /api/auth/register


const register = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      // Check if account is deactivated — offer reactivation
      if (!existingUser.isActive) {
        return res.status(403).json({
          success: false,
          message: 'This email belongs to a deactivated account.',
          isDeactivated: true,// mtlb agar user ka account deactivate hai to frontend ko pata chal jayega ki account deactivate hai aur uske according frontend me reactivate ka option show kar sakte hai, aur userId bhi bhej denge taki agar user reactivate karna chahta hai to usko pata chal jaye ki kis user ka account reactivate karna hai
          userId: existingUser._id
        });
      }
      return res.status(400).json({ success: false, message: 'Email already registered. Please login.' });
    }

    const user = await User.create({ name, email, password, phone });
    const otp = user.generateOTP();
    await user.save();
    await sendEmail({
      to: email,
      subject: 'Verify your ShopKaro account',
      html: emailTemplates.otpVerification(name, otp)
    });
    res.status(201).json({
      success: true,
      message: 'Registration successful! Please verify your email with OTP.',
      userId: user._id
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Verify OTP
// @route   POST /api/auth/verify-otp
const verifyOTP = async (req, res) => {
  try {

    // userId kha se mileygi hume? userId hume frontend se milegi jab user OTP verification page par jayega, kyunki OTP verification ke liye hume ye pata hona chahiye ki kis user ka OTP verify karna hai, to jab user registration ke baad OTP verification page par jayega to usko ek form milega jisme wo apna OTP enter karega, aur us form ke sath hidden field me userId bhi hoga jo ki us user ka ID hoga jisse hum identify kar sakte hai ki kis user ka OTP verify karna hai, aur jab user OTP submit karega to wo data backend me POST request ke through bheja jayega jisme userId aur OTP dono included honge, to is tarah se hume userId mil jayegi OTP verification ke time par taki hum us user ka OTP verify kar sake.
    // ye userID ka mtlb hai database me us user ka unique identifier, jisse hum identify kar sakte hai ki kis user ka OTP verify karna hai, kyunki OTP code unique nahi hota hai aur multiple users ke OTP same ho sakte hai to userId ke through hum identify kar sakte hai ki kis user ka OTP verify karna hai, aur agar userId nahi diya gaya to hum verify nahi kar payenge ki kis user ka OTP verify karna hai, isliye userId ko required banaya gaya hai taki OTP verification process me asani ho jaye
    const { userId, otp } = req.body;   // userId is required to identify which user's OTP we are verifying, kyunki OTP code unique nahi hota hai aur multiple users ke OTP same ho sakte hai to userId ke through hum identify kar sakte hai ki kis user ka OTP verify karna hai, aur agar userId nahi diya gaya to hum verify nahi kar payenge ki kis user ka OTP verify karna hai, isliye userId ko required banaya gaya hai taki OTP verification process me asani ho jaye
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (!user.otp || !user.otp.code) {  // Agar user ke paas OTP code nahi hai to iska matlab hai ki ya to user ne OTP request nahi kiya hai ya phir OTP already verify ho chuka hai aur code remove kar diya gaya hai, isliye is case me hum user ko error message denge ki koi OTP found nahi hai aur naya OTP request karne ko kahenge
      return res.status(400).json({ success: false, message: 'No OTP found. Please request a new one.' });
    }
    if (new Date() > user.otp.expiresAt) {
      return res.status(400).json({ success: false, message: 'OTP has expired. Please request a new one.' });
    }
    if (user.otp.code !== otp) {
      return res.status(400).json({ success: false, message: 'Invalid OTP' });
    }
    user.isVerified = true;  // OTP verify hone ke baad user ka isVerified true kar denge taki wo user apne account ko access kar sake aur protected routes ko access kar sake, aur agar user ka email verify nahi hai to wo login bhi nahi kar payega, isliye OTP verification ke baad hi user ka email verified mark kar denge taki wo apne account ka full access le sake
    user.otp = undefined;  // OTP verify hone ke baad OTP code ko remove kar denge taki future me us OTP code ka misuse na ho sake, aur agar user ko future me naya OTP request karna hai to wo naya OTP generate kar sakta hai aur usko save kar sakta hai, isliye OTP verify hone ke baad usko remove kar dena chahiye taki security maintain rahe
    await user.save();  // Save user after updating isVerified and removing OTP code, taki changes database me reflect ho jaye aur user ka email verified mark ho jaye

  
    const token = generateToken(user._id);  // OTP verify hone ke baad user ko JWT token generate karke de denge taki wo apne account me login kar sake aur protected routes ko access kar sake, aur kyunki OTP verification ke baad hi user ka email verified hota hai to uske baad hi token generate karna chahiye taki security maintain rahe, aur agar user ka email verify nahi hai to wo login bhi nahi kar payega, isliye OTP verification ke baad hi token generate karna chahiye taki wo apne account ka full access le sake
    res.json({
      success: true, // OTP verify hone ke baad success message ke sath token aur user info bhi return kar denge taki frontend me user ko login karne ke baad uska data easily mil jaye aur wo apne account me changes kar sake, aur token ko localStorage me store kar sakta hai taki future me protected routes ko access kar sake
      message: 'Email verified successfully!',
      token,
      user: { _id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar, isVerified: user.isVerified }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Resend OTP
// @route   POST /api/auth/resend-otp
const resendOTP = async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    const otp = user.generateOTP();
    await user.save();
    await sendEmail({
      to: user.email,
      subject: 'Your new OTP - ShopKaro',
      html: emailTemplates.otpVerification(user.name, otp)
    });
    res.json({ success: true, message: 'OTP resent successfully!' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }
    const user = await User.findOne({ email }).select('+password');
    if (!user) return res.status(401).json({ success: false, message: 'Invalid email or password' });
    // if (!user.isActive) return res.status(401).json({ success: false, message: 'Account has been deactivated' });
    if (!user.isActive) {
      return res.status(403).json({
        success: false,// success false ka mtlb hai ki request successful nahi hui hai aur user ka account deactivate hai, aur is case me hum 403 Forbidden status code return karenge kyunki user ka account deactivate hai to wo is resource ko access karne ke liye forbidden hai, aur message me bhi clear message denge ki account deactivate hai taki user ko pata chal jaye ki uska account deactivate hai aur uske according action le sake, jaise ki agar user apne account ko reactivate karna chahta hai to wo reactivate ka option choose kar sakta hai
        message: 'Your account has been deactivated.',
        isDeactivated: true,   // isDeactivated flag se frontend ko pata chal jayega ki account deactivate hai aur uske according frontend me reactivate ka option show kar sakte hai, aur userId bhi bhej denge taki agar user reactivate karna chahta hai to usko pata chal jaye ki kis user ka account reactivate karna hai
        userId: user._id
      });
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ success: false, message: 'Invalid email or password' });

    // Agar user ka email verify nahi hai to usko OTP verification ke liye bolenge taki wo apne email ko verify kar sake aur apne account ka full access le sake, aur agar user ka email verify nahi hai to wo login bhi nahi kar payega, isliye login ke time par bhi check karenge ki user ka email verify hai ya nahi, aur agar verify nahi hai to usko OTP verification ke liye bolenge taki wo apne email ko verify kar sake
    if (!user.isVerified) {
      const otp = user.generateOTP();
      await user.save();
      await sendEmail({
        to: user.email,
        subject: 'Verify your ShopKaro account',
        html: emailTemplates.otpVerification(user.name, otp)
      });
      return res.status(403).json({
        success: false,
        message: 'Email not verified. OTP sent to your email.',
        userId: user._id,
        requiresVerification: true
      });
    }
    const token = generateToken(user._id);
    res.json({
      success: true,
      token,
      user: { _id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar, isVerified: user.isVerified, phone: user.phone }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me

// 
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('wishlist', 'name images price discountPrice');
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Forgot Password - send OTP
// @route   POST /api/auth/forgot-password
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ success: false, message: 'No account with that email found' });
    const otp = user.generateOTP();
    await user.save();
    await sendEmail({
      to: email,
      subject: 'Reset your ShopKaro password',
      html: emailTemplates.otpVerification(user.name, otp)
    });
    res.json({ success: true, message: 'OTP sent to your email', userId: user._id });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Reset Password
// @route   POST /api/auth/reset-password
const resetPassword = async (req, res) => {
  try {
    const { userId, otp, newPassword } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (!user.otp || user.otp.code !== otp) {
      return res.status(400).json({ success: false, message: 'Invalid OTP' });
    }
    if (new Date() > user.otp.expiresAt) {
      return res.status(400).json({ success: false, message: 'OTP has expired' });
    }
    user.password = newPassword;
    user.otp = undefined;
    await user.save();
    res.json({ success: true, message: 'Password reset successfully!' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// @desc    Request reactivation OTP
// @route   POST /api/auth/request-reactivation
const requestReactivation = async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (user.isActive) return res.status(400).json({ success: false, message: 'Account is already active' });

    const otp = user.generateOTP();
    await user.save();

    await sendEmail({
      to: user.email,
      subject: 'Reactivate your ShopKaro account',
      html: `
        <div style="font-family:'Segoe UI',sans-serif;max-width:600px;margin:0 auto;background:#f8f9fa;padding:20px">
          <div style="background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);padding:40px;border-radius:12px 12px 0 0;text-align:center">
            <h1 style="color:white;margin:0;font-size:26px">Welcome Back! 👋</h1>
          </div>
          <div style="background:white;padding:40px;border-radius:0 0 12px 12px;box-shadow:0 4px 20px rgba(0,0,0,0.1)">
            <p>Hi <strong>${user.name}</strong>,</p>
            <p>We received a request to reactivate your ShopKaro account. Use the OTP below:</p>
            <div style="background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);padding:25px;border-radius:10px;text-align:center;margin:20px 0">
              <span style="font-size:40px;font-weight:bold;color:white;letter-spacing:10px">${otp}</span>
            </div>
            <p style="color:#999;font-size:14px">This OTP is valid for <strong>10 minutes</strong>.</p>
            <div style="background:#f0f9f0;padding:15px;border-radius:8px;border-left:4px solid #22c55e;margin:15px 0">
              <p style="margin:0;color:#166534;font-size:14px">
                ✅ Your account data, orders, and wishlist are all preserved and will be restored.
              </p>
            </div>
            <p style="color:#999;font-size:12px">If you didn't request this, ignore this email.</p>
          </div>
        </div>`
    });

    res.json({
      success: true,
      message: 'Reactivation OTP sent to your email!'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Verify OTP and reactivate account
// @route   POST /api/auth/verify-reactivation
const verifyReactivation = async (req, res) => {
  try {
    const { userId, otp } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    if (!user.otp || !user.otp.code) {
      return res.status(400).json({ success: false, message: 'No OTP found. Request a new one.' });
    }
    if (new Date() > user.otp.expiresAt) {
      return res.status(400).json({ success: false, message: 'OTP expired. Request a new one.' });
    }
    if (user.otp.code !== otp) {
      return res.status(400).json({ success: false, message: 'Invalid OTP' });
    }

    user.isActive = true;
    user.isVerified = true;
    user.otp = undefined;
    await user.save();

    const token = generateToken(user._id);

    // Welcome back email
    await sendEmail({
      to: user.email,
      subject: 'Account Reactivated - Welcome Back to ShopKaro!',
      html: `
        <div style="font-family:'Segoe UI',sans-serif;max-width:600px;margin:0 auto;background:#f8f9fa;padding:20px">
          <div style="background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);padding:40px;border-radius:12px 12px 0 0;text-align:center">
            <h1 style="color:white;margin:0">Account Reactivated! 🎉</h1>
          </div>
          <div style="background:white;padding:40px;border-radius:0 0 12px 12px">
            <p>Hi <strong>${user.name}</strong>,</p>
            <p>Your ShopKaro account has been successfully reactivated!</p>
            <div style="background:#f0f9f0;padding:20px;border-radius:10px;border-left:4px solid #22c55e;margin:20px 0">
              <p style="margin:0;color:#166534">✅ All your orders, wishlist, and account data have been restored.</p>
            </div>
            <p>Welcome back! Happy shopping 🛍️</p>
          </div>
        </div>`
    });

    res.json({
      success: true,
      message: 'Account reactivated successfully! Welcome back!',
      token,
      user: {
        _id: user._id, name: user.name, email: user.email,
        role: user.role, avatar: user.avatar, isVerified: user.isVerified
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { register, login, verifyOTP, resendOTP, getMe, forgotPassword, resetPassword,requestReactivation, verifyReactivation  };
