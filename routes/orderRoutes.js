const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { isAuth, isAdmin, isCustomer } = require('../middleware/authMiddleware');

// --- Routes cho Khách hàng ---
router.get('/place', isAuth, isCustomer, orderController.getPlaceOrder);
router.post('/add-to-cart', isAuth, isCustomer, orderController.addToCart);
router.get('/cart', isAuth, isCustomer, orderController.getCart);
router.post('/checkout', isAuth, isCustomer, orderController.checkout);
router.get('/cancel', isAuth, isCustomer, orderController.getMyOrders);
router.get('/cancel/:id', isAuth, isCustomer, orderController.cancelOrder);

// --- Routes cho Admin ---
router.get('/admin/list', isAuth, isAdmin, orderController.getAllOrdersForAdmin);
router.get('/admin/search', isAuth, isAdmin, orderController.searchOrders);

module.exports = router;