// const express = require('express');
// const router = express.Router();
// const { createOrder, getMyOrders, getOrder, trackOrder, cancelOrder, getAllOrders, updateOrderStatus } = require('../controllers/orderController');
// const { protect, adminOnly } = require('../middleware/auth');

// router.post('/', protect, createOrder);
// router.get('/my-orders', protect, getMyOrders);
// router.get('/track/:orderNumber', trackOrder);
// router.get('/admin/all', protect, adminOnly, getAllOrders);
// router.get('/:id', protect, getOrder);
// router.patch('/:id/cancel', protect, cancelOrder);
// router.patch('/:id/status', protect, adminOnly, updateOrderStatus);

// module.exports = router;


const express = require('express');
const router = express.Router();
const { createOrder, getMyOrders, getOrder, trackOrder, cancelOrder, getAllOrders, updateOrderStatus, markCODPaid, requestReturn, getAllReturns, processReturn ,deleteFromHistory} = require('../controllers/orderController');
const { protect, adminOnly } = require('../middleware/auth');

router.post('/', protect, createOrder);
router.get('/my-orders', protect, getMyOrders);
router.get('/track/:orderNumber', trackOrder);
router.get('/admin/all', protect, adminOnly, getAllOrders);
router.get('/admin/returns', protect, adminOnly, getAllReturns);
router.get('/:id', protect, getOrder);
router.patch('/:id/cancel', protect, cancelOrder);
router.patch('/:id/status', protect, adminOnly, updateOrderStatus);
router.patch('/:id/cod-paid', protect, adminOnly, markCODPaid);
router.post('/:id/return-request', protect, requestReturn);
router.delete('/:id/history', protect, deleteFromHistory);
router.patch('/:id/process-return', protect, adminOnly, processReturn);


module.exports = router;