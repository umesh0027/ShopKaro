# 🛍️ ShopKaro - Full Stack MERN E-Commerce

A complete, production-ready e-commerce platform built with MERN stack (MongoDB, Express.js, React, Node.js) with Tailwind CSS.

---

## 🚀 Features

### User Features
- ✅ Register / Login with **Email OTP Verification**
- ✅ Forgot password via OTP
- ✅ Browse products with **search, filter, sort**
- ✅ **Product detail** with image gallery, specs, related products
- ✅ **Shopping cart** (persists in localStorage)
- ✅ **Checkout** with address management
- ✅ **Razorpay payment** integration (cards, UPI, net banking)
- ✅ **Order tracking** with fake Shiprocket simulation
- ✅ Cancel orders
- ✅ **Wishlist** management
- ✅ Profile & address management
- ✅ Leave **product reviews** with ratings
- ✅ About, Contact, Terms & Conditions pages

### Admin Features
- ✅ **Dashboard** with revenue charts, stats, top products
- ✅ **Product CRUD** - create/edit/delete with Cloudinary images
- ✅ **Category CRUD** with images
- ✅ **Order management** - update status, add tracking, auto email
- ✅ **User management** - view, activate/block
- ✅ **Contact/Query management** - view & reply via email
- ✅ **Payment dashboard** - view all transactions
- ✅ **Review management** - view, reply, delete reviews
- ✅ Featured product toggle
- ✅ Low stock alerts

---

## 📁 Project Structure

```
ecommerce/
├── backend/
│   ├── config/          # DB, Cloudinary config
│   ├── controllers/     # Route handlers
│   ├── middleware/      # Auth, etc.
│   ├── models/          # Mongoose schemas
│   ├── routes/          # Express routes
│   ├── utils/           # Email templates
│   ├── server.js
│   └── .env.example
│
└── frontend/
    ├── public/
    └── src/
        ├── components/
        │   └── common/  # Navbar, Footer, ProductCard, etc.
        ├── context/     # AuthContext, CartContext
        ├── pages/
        │   ├── user/    # All user pages
        │   └── admin/   # All admin pages
        └── services/    # API calls (axios)
```

---

## ⚙️ Setup Instructions

### 1. Clone & Install

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Backend Environment Variables

Copy `.env.example` to `.env` and fill in:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/ecommerce

JWT_SECRET=your_super_secret_key
JWT_EXPIRE=30d

# Gmail SMTP
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your@gmail.com
EMAIL_PASS=your_app_password   # Use Gmail App Password

# Cloudinary (free account at cloudinary.com)
CLOUDINARY_CLOUD_NAME=xxxx
CLOUDINARY_API_KEY=xxxx
CLOUDINARY_API_SECRET=xxxx

# Razorpay (free test account at razorpay.com)
RAZORPAY_KEY_ID=rzp_test_xxxx
RAZORPAY_KEY_SECRET=xxxx

FRONTEND_URL=http://localhost:3000
ADMIN_EMAIL=admin@yourstore.com
```

### 3. Create Admin User

After starting the server, register a user normally, then in MongoDB:
```js
db.users.updateOne({ email: "admin@email.com" }, { $set: { role: "admin", isVerified: true } })
```

Or use MongoDB Compass / Atlas to set `role: "admin"` and `isVerified: true`.

### 4. Run the App

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm start
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api
- Admin Panel: http://localhost:3000/admin

---

## 💳 Razorpay Test Cards

| Card Number         | Expiry | CVV | Notes        |
|---------------------|--------|-----|--------------|
| 4111 1111 1111 1111 | Any    | Any | Visa Success |
| 5267 3181 8797 5449 | Any    | Any | MC Success   |

**Test UPI:** `success@razorpay`

---

## 📦 Tech Stack

| Layer     | Tech                              |
|-----------|-----------------------------------|
| Frontend  | React 18, React Router v6, Tailwind CSS |
| State     | React Context API                 |
| Backend   | Node.js, Express.js               |
| Database  | MongoDB + Mongoose                |
| Auth      | JWT + bcryptjs                    |
| Email     | Nodemailer (Gmail SMTP)           |
| Images    | Cloudinary                        |
| Payments  | Razorpay                          |
| Shipping  | Fake Shiprocket simulation        |

---

## 🔒 Security Features

- JWT authentication with token expiry
- Password hashing with bcryptjs
- Rate limiting on API routes
- CORS configuration
- Email OTP verification
- Admin role protection on all admin routes

---

## 📧 Email Features

All emails use beautiful HTML templates:
- **OTP Verification** - on register & login
- **Order Confirmation** - after placing order
- **Order Status Updates** - when admin updates status
- **Contact Reply** - when admin replies to query

---

## 🌐 Deployment

### Backend (Railway / Render)
1. Set all environment variables
2. Deploy from GitHub

### Frontend (Vercel / Netlify)
1. Set `REACT_APP_API_URL=https://your-backend-url.com/api`
2. Deploy from GitHub

---


