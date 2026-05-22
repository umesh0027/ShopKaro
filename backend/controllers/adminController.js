



const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const Category = require('../models/Category');

// @desc    Get dashboard stats
// @route   GET /api/admin/dashboard
const getDashboardStats = async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // Core counts
    const [totalOrders, totalProducts, totalUsers, totalCategories] = await Promise.all([
      Order.countDocuments(),
      Product.countDocuments({ isActive: true }),
      User.countDocuments({ role: 'user' }),
      Category.countDocuments({ isActive: true })
    ]);

    // Revenue stats
    const revenueData = await Order.aggregate([
      { $match: { 'paymentInfo.status': 'paid' } },
      { $group: { _id: null, total: { $sum: '$totalPrice' }, count: { $sum: 1 } } }
    ]);

    const monthlyRevenue = await Order.aggregate([
      { $match: { 'paymentInfo.status': 'paid', createdAt: { $gte: startOfMonth } } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } }
    ]);

    const lastMonthRevenue = await Order.aggregate([
      { $match: { 'paymentInfo.status': 'paid', createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth } } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } }
    ]);

    // Order status breakdown
    const orderStats = await Order.aggregate([
      { $group: { _id: '$orderStatus', count: { $sum: 1 } } }
    ]);

    // Monthly orders chart (last 6 months)
    const monthlyOrders = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(now.getFullYear(), now.getMonth() - 5, 1) }
        }
      },
      {
        $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          count: { $sum: 1 },
          revenue: { $sum: { $cond: [{ $eq: ['$paymentInfo.status', 'paid'] }, '$totalPrice', 0] } }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Top selling products
    const topProducts = await Order.aggregate([
      { $unwind: '$items' },
      { $group: { _id: '$items.product', totalSold: { $sum: '$items.quantity' }, revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } } } },
      { $sort: { totalSold: -1 } },
      { $limit: 5 },
      { $lookup: { from: 'products', localField: '_id', foreignField: '_id', as: 'product' } },
      { $unwind: '$product' },
      { $project: { name: '$product.name', image: { $arrayElemAt: ['$product.images.url', 0] }, totalSold: 1, revenue: 1 } }
    ]);

    // Recent orders
    const recentOrders = await Order.find()
      .sort('-createdAt')
      .limit(5)
      .populate('user', 'name email');

    // Low stock alert
    const lowStock = await Product.find({ stock: { $lte: 10, $gt: 0 }, isActive: true })
      .select('name stock images')
      .limit(5);

    const outOfStock = await Product.countDocuments({ stock: 0, isActive: true });

    // Return stats
    const returnStats = {
      total: await Order.countDocuments({ 'returnRequest.requestedAt': { $exists: true } }),
      pending: await Order.countDocuments({ 'returnRequest.status': 'pending' }),
      approved: await Order.countDocuments({ 'returnRequest.status': 'approved' }),
      refunded: await Order.countDocuments({ 'returnRequest.status': 'refunded' }),
    };

    // COD pending payments
    const codPendingCount = await Order.countDocuments({
      'paymentInfo.method': 'cod',
      'paymentInfo.status': 'pending',
      orderStatus: 'delivered'
    });

    res.json({
      success: true,
      stats: {
        totalOrders, totalProducts, totalUsers, totalCategories,
        totalRevenue: revenueData[0]?.total || 0,
        paidOrders: revenueData[0]?.count || 0,
        monthlyRevenue: monthlyRevenue[0]?.total || 0,
        lastMonthRevenue: lastMonthRevenue[0]?.total || 0,
        outOfStock,
        returnStats,
        codPendingCount
      },
      orderStats: orderStats.reduce((acc, s) => ({ ...acc, [s._id]: s.count }), {}),
      monthlyOrders,
      topProducts,
      recentOrders,
      lowStock
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getDashboardStats };