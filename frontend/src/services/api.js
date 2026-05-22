



import axios from 'axios';

const API = axios.create({
  // baseURL: process.env.REACT_APP_API_URL || '/api',
  baseURL: process.env.REACT_APP_API_URL ,
  timeout: 30000,
});

// Attach token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle auth errors globally
API.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ============ AUTH ============
export const authAPI = {
  register: (data) => API.post('/auth/register', data),
  login: (data) => API.post('/auth/login', data),
  verifyOTP: (data) => API.post('/auth/verify-otp', data),
  resendOTP: (data) => API.post('/auth/resend-otp', data),
  getMe: () => API.get('/auth/me'),
  forgotPassword: (data) => API.post('/auth/forgot-password', data),
  resetPassword: (data) => API.post('/auth/reset-password', data),
  requestReactivation: (data) => API.post('/auth/request-reactivation', data),
  verifyReactivation: (data) => API.post('/auth/verify-reactivation', data),
};

// ============ PRODUCTS ============
export const productAPI = {
  getAll: (params) => API.get('/products', { params }),
  getFilterOptions: (params) => API.get('/products/filter-options', { params }),
  getOne: (id) => API.get(`/products/${id}`),
  getAdminAll: (params) => API.get('/products/admin/all', { params }),
  create: (data) => API.post('/products', data),
  update: (id, data) => API.put(`/products/${id}`, data),
  delete: (id) => API.delete(`/products/${id}`),
  deleteImage: (id, data) => API.delete(`/products/${id}/image`, { data }),
  toggleFeatured: (id) => API.patch(`/products/${id}/featured`),
  addReview: (id, data) => API.post(`/products/${id}/reviews`, data),
  replyReview: (id, reviewId, data) => API.patch(`/products/${id}/reviews/${reviewId}/reply`, data),
  deleteReview: (id, reviewId) => API.delete(`/products/${id}/reviews/${reviewId}`),
};

// ============ CATEGORIES ============
export const categoryAPI = {
  getAll: (params) => API.get('/categories', { params }),
  
  getOne: (id) => API.get(`/categories/${id}`),
  create: (data) => API.post('/categories', data),
  update: (id, data) => API.put(`/categories/${id}`, data),
  delete: (id) => API.delete(`/categories/${id}`),
  toggle: (id) => API.patch(`/categories/${id}/toggle`),
  syncCounts: () => API.post('/categories/sync-counts'),
};

// ============ ORDERS ============
export const orderAPI = {
  create: (data) => API.post('/orders', data),
  getMyOrders: (params) => API.get('/orders/my-orders', { params }),
  getOne: (id) => API.get(`/orders/${id}`),
  track: (orderNumber, email) => API.get(`/orders/track/${orderNumber}`, { params: { email } }),
  cancel: (id, data) => API.patch(`/orders/${id}/cancel`, data),
  getAdminAll: (params) => API.get('/orders/admin/all', { params }),
  getAdminReturns: (params) => API.get('/orders/admin/returns', { params }),
  updateStatus: (id, data) => API.patch(`/orders/${id}/status`, data),
  markCODPaid: (id) => API.patch(`/orders/${id}/cod-paid`),
  requestReturn: (id, data) => API.post(`/orders/${id}/return-request`, data),
  processReturn: (id, data) => API.patch(`/orders/${id}/process-return`, data),
  
deleteFromHistory: (id) => API.delete(`/orders/${id}/history`),
};

// ============ PAYMENT ============
export const paymentAPI = {
  createOrder: (data) => API.post('/payment/create-order', data),
  verify: (data) => API.post('/payment/verify', data),
  getAll: (params) => API.get('/payment/all', { params }),
};

// ============ USERS ============
export const userAPI = {
  updateProfile: (data) => API.put('/users/profile', data),
  changePassword: (data) => API.put('/users/change-password', data),
  addAddress: (data) => API.post('/users/addresses', data),
  updateAddress: (id, data) => API.put(`/users/addresses/${id}`, data),
  deleteAddress: (id) => API.delete(`/users/addresses/${id}`),
  toggleWishlist: (productId) => API.post(`/users/wishlist/${productId}`),
  getWishlist: () => API.get('/users/wishlist'),
  getAdminAll: (params) => API.get('/users/admin/all', { params }),
  toggleStatus: (id) => API.patch(`/users/admin/${id}/toggle`),
  
  deleteAccount: (data) => API.delete('/users/account', { data }),
};

// ============ CONTACT ============
export const contactAPI = {
  submit: (data) => API.post('/contact', data),
  getAdmin: (params) => API.get('/contact/admin', { params }),
  reply: (id, data) => API.patch(`/contact/${id}/reply`, data),
  updateStatus: (id, data) => API.patch(`/contact/${id}/status`, data),
  delete: (id) => API.delete(`/contact/${id}`),
};

// ============ ADMIN ============
export const adminAPI = {
  getDashboard: () => API.get('/admin/dashboard'),
};

export default API;