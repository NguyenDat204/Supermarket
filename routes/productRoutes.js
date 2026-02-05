const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { isAuth, isCustomer } = require('../middleware/authMiddleware');

router.get('/', isAuth, isCustomer, productController.getAllProducts);

module.exports = router;