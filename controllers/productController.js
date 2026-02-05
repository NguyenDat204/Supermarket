const Product = require('../models/productModel');

exports.getAllProducts = async (req, res) => {
    try {
        const products = await Product.find();
        res.render('placeOrder', { products });
    } catch (err) {
        res.status(500).send("Error fetching products");
    }
};