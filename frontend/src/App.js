


import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import LoadingSpinner from './components/common/LoadingSpinner';
import ScrollToTop from './components/common/ScrollToTop';
// import Categories from './pages/admin/Categories';
import UserCategories from './pages/user/Categories';
import NotFound from './pages/user/Error';
import AdminBundles from './pages/admin/AdminBundle';

// Lazy loaded pages
const Home = lazy(() => import('./pages/user/Home'));
const Products = lazy(() => import('./pages/user/Products'));
const ProductDetail = lazy(() => import('./pages/user/ProductDetail'));
const Cart = lazy(() => import('./pages/user/Cart'));
const Checkout = lazy(() => import('./pages/user/Checkout'));
const OrderSuccess = lazy(() => import('./pages/user/OrderSuccess'));
const MyOrders = lazy(() => import('./pages/user/MyOrders'));
const OrderDetail = lazy(() => import('./pages/user/OrderDetail'));
const TrackOrder = lazy(() => import('./pages/user/TrackOrder'));
const Profile = lazy(() => import('./pages/user/Profile'));
const Wishlist = lazy(() => import('./pages/user/Wishlist'));
const About = lazy(() => import('./pages/user/About'));
const Contact = lazy(() => import('./pages/user/Contact'));
const TermsConditions = lazy(() => import('./pages/user/TermsConditions'));
const Login = lazy(() => import('./pages/user/Login'));
const Register = lazy(() => import('./pages/user/Register'));
const ForgotPassword = lazy(() => import('./pages/user/ForgotPassword'));
const Bundles      = lazy(() => import('./pages/user/Bundles'));
const BundleDetail = lazy(() => import('./pages/user/BundleDetail'));

// Admin pages
const AdminLayout = lazy(() => import('./pages/admin/AdminLayout'));
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));
const AdminProducts = lazy(() => import('./pages/admin/Products'));
const AdminProductForm = lazy(() => import('./pages/admin/ProductForm'));
const AdminCategories = lazy(() => import('./pages/admin/Categories'));
const AdminOrders = lazy(() => import('./pages/admin/Orders'));
const AdminOrderDetail = lazy(() => import('./pages/admin/OrderDetail'));
const AdminUsers = lazy(() => import('./pages/admin/Users'));
const AdminContacts = lazy(() => import('./pages/admin/Contacts'));
const AdminPayments = lazy(() => import('./pages/admin/Payments'));
const AdminReviews = lazy(() => import('./pages/admin/Reviews'));
const AdminReturns = lazy(() => import('./pages/admin/Return'));

// Protected route component
const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { isLoggedIn, isAdmin, loading } = useAuth();
  if (loading) return <LoadingSpinner />;
  if (!isLoggedIn) return <Navigate to="/login" replace />;
  if (adminOnly && !isAdmin) return <Navigate to="/" replace />;
  return children;
};

// Public only route (redirect if logged in)
const PublicRoute = ({ children }) => {
  const { isLoggedIn, loading } = useAuth();
  if (loading) return <LoadingSpinner />;
  if (isLoggedIn) return <Navigate to="/" replace />;
  return children;
};

const AppRoutes = () => {
  const { isAdmin } = useAuth();
  return (
    <Routes>
      {/* Public routes with Navbar/Footer */}
      <Route path="/" element={<><Navbar /><main className="min-h-screen"><Home /></main><Footer /></>} />
      <Route path="/products" element={<><Navbar /><main className="min-h-screen"><Products /></main><Footer /></>} />
       <Route path="/allcategories" element={<UserCategories />} />
      <Route path="/products/:id" element={<><Navbar /><main className="min-h-screen"><ProductDetail /></main><Footer /></>} />
      <Route path="/cart" element={<><Navbar /><main className="min-h-screen"><Cart /></main><Footer /></>} />
      <Route path="/about" element={<><Navbar /><main className="min-h-screen"><About /></main><Footer /></>} />
      <Route path="/contact" element={<><Navbar /><main className="min-h-screen"><Contact /></main><Footer /></>} />
      <Route path="/terms" element={<><Navbar /><main className="min-h-screen"><TermsConditions /></main><Footer /></>} />
      <Route path="/track-order" element={<><Navbar /><main className="min-h-screen"><TrackOrder /></main><Footer /></>} />
    <Route path="/bundles"    element={<><Navbar /><main className="min-h-screen"><Bundles /></main><Footer /></>} />
    <Route path="/bundles/:id" element={<><Navbar /><main className="min-h-screen"><BundleDetail /></main><Footer /></>} />

      {/* Auth routes */}
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
      <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />

      {/* Protected user routes */}
      <Route path="/checkout" element={<ProtectedRoute><><Navbar /><main className="min-h-screen"><Checkout /></main><Footer /></></ProtectedRoute>} />
      <Route path="/order-success/:id" element={<ProtectedRoute><><Navbar /><main className="min-h-screen"><OrderSuccess /></main><Footer /></></ProtectedRoute>} />
      <Route path="/my-orders" element={<ProtectedRoute><><Navbar /><main className="min-h-screen"><MyOrders /></main><Footer /></></ProtectedRoute>} />
      <Route path="/orders/:id" element={<ProtectedRoute><><Navbar /><main className="min-h-screen"><OrderDetail /></main><Footer /></></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><><Navbar /><main className="min-h-screen"><Profile /></main><Footer /></></ProtectedRoute>} />
      <Route path="/wishlist" element={<ProtectedRoute><><Navbar /><main className="min-h-screen"><Wishlist /></main><Footer /></></ProtectedRoute>} />

      {/* Admin routes */}
      <Route path="/admin" element={<ProtectedRoute adminOnly><AdminLayout /></ProtectedRoute>}>
        <Route index element={<AdminDashboard />} />
        <Route path="products" element={<AdminProducts />} />
       
        <Route path="products/new" element={<AdminProductForm />} />
        <Route path="products/edit/:id" element={<AdminProductForm />} />
        <Route path="categories" element={<AdminCategories />} />
        <Route path="orders" element={<AdminOrders />} />
        <Route path="orders/:id" element={<AdminOrderDetail />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="contacts" element={<AdminContacts />} />
        <Route path="payments" element={<AdminPayments />} />
        <Route path="reviews" element={<AdminReviews />} />
        <Route path="returns" element={<AdminReturns />} />
  <Route path="/admin/bundles" element={<AdminBundles />} />
      </Route>

      {/* <Route path="*" element={<><Navbar /><main className="min-h-screen flex items-center justify-center"><div className="text-center"><h1 className="font-display text-6xl font-bold text-primary-600">404</h1><p className="text-xl text-gray-600 mt-4">Page not found</p><a href="/" className="btn-primary mt-6 inline-block">Go Home</a></div></main><Footer /></>} /> */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <Router>
        <CartProvider>
      <AuthProvider>
      
          <ScrollToTop />
          <Suspense fallback={<LoadingSpinner fullScreen />}>
            <AppRoutes />
          </Suspense>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: { background: '#1e293b', color: '#f8fafc', borderRadius: '12px', fontSize: '14px' },
              success: { iconTheme: { primary: '#6366f1', secondary: '#fff' } },
              error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
            }}
          />
      </AuthProvider>
        </CartProvider>
     
    </Router>
  );
}

export default App;
