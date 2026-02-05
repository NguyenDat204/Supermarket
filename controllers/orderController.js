const Order = require('../models/orderModel');
const Product = require('../models/productModel');

// --- PHẦN DÀNH CHO CUSTOMER ---

// 1. Hiển thị danh sách sản phẩm để mua hàng
exports.getPlaceOrder = async (req, res) => {
    try {
        const products = await Product.find();
        res.render('placeOrder', { products, user: req.session.user });
    } catch (err) {
        res.status(500).send("Lỗi tải danh sách sản phẩm");
    }
};

// 2. Thêm sản phẩm vào giỏ hàng (Lưu vào Session, chưa trừ kho)
exports.addToCart = (req, res) => {
    const { productId, quantity } = req.body;
    const qty = parseInt(quantity) || 1;

    if (!req.session.cart) req.session.cart = [];

    // Kiểm tra nếu sản phẩm đã có trong giỏ hàng thì tăng số lượng
    const itemIndex = req.session.cart.findIndex(item => item.productId === productId);
    if (itemIndex > -1) {
        req.session.cart[itemIndex].quantity += qty;
    } else {
        req.session.cart.push({ productId, quantity: qty });
    }
    res.redirect('/orders/cart');
};

// 3. Hiển thị trang giỏ hàng
exports.getCart = async (req, res) => {
    try {
        const cartItems = [];
        if (req.session.cart && req.session.cart.length > 0) {
            for (let item of req.session.cart) {
                const product = await Product.findById(item.productId);
                if (product) {
                    cartItems.push({
                        product,
                        quantity: item.quantity,
                        total: product.price * item.quantity
                    });
                }
            }
        }
        res.render('cart', { cartItems, user: req.session.user });
    } catch (err) {
        res.status(500).send("Lỗi tải giỏ hàng");
    }
};

// 4. Thanh toán (Xử lý giao dịch: Ghi đơn hàng & Trừ kho)
exports.checkout = async (req, res) => {
    try {
        const cart = req.session.cart;
        if (!cart || cart.length === 0) return res.redirect('/orders/place');

        for (let item of cart) {
            const product = await Product.findById(item.productId);
            
            // Ràng buộc: Chỉ đặt hàng nếu đủ tồn kho
            if (product && product.stock >= item.quantity) {
                // Tạo đơn hàng mới
                await Order.create({
                    customerId: req.session.user._id,
                    productId: item.productId,
                    quantity: item.quantity,
                    status: 'pending'
                });

                // Cập nhật giảm tồn kho
                product.stock -= item.quantity;
                await product.save();
            } else {
                return res.status(400).send(`Sản phẩm ${product.name} không đủ hàng!`);
            }
        }

        // Xóa giỏ hàng sau khi thanh toán thành công
        req.session.cart = [];
        res.redirect('/orders/cancel'); // Chuyển đến trang lịch sử đơn hàng
    } catch (err) {
        res.status(500).send("Lỗi xử lý thanh toán");
    }
};

// 5. Xem lịch sử đơn hàng (Trang Cancel Order)
exports.getMyOrders = async (req, res) => {
    try {
        const orders = await Order.find({ customerId: req.session.user._id })
            .populate('productId')
            .sort({ orderDate: -1 });
        res.render('cancelOrder', { orders, user: req.session.user });
    } catch (err) {
        res.status(500).send("Lỗi tải lịch sử đơn hàng");
    }
};

// 6. Hủy đơn hàng (Hoàn trả số lượng vào kho)
exports.cancelOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        // Ràng buộc: Chỉ được hủy nếu chưa giao hàng (pending)
        if (order && order.status === 'pending') {
            const product = await Product.findById(order.productId);
            if (product) {
                // HOÀN LẠI TỒN KHO
                product.stock += order.quantity;
                await product.save();
            }
            // Xóa đơn hàng hoặc cập nhật status thành 'cancelled'
            await Order.findByIdAndDelete(req.params.id);
        }
        res.redirect('/orders/cancel');
    } catch (err) {
        res.status(500).send("Lỗi khi hủy đơn hàng");
    }
};

// --- PHẦN DÀNH CHO ADMIN ---

// 7. Admin: Danh sách tất cả đơn hàng
exports.getAllOrdersForAdmin = async (req, res) => {
    try {
        const orders = await Order.find()
            .populate('customerId')
            .populate('productId')
            .sort({ orderDate: -1 });
        res.render('listOrders', { orders, user: req.session.user });
    } catch (err) {
        res.status(500).send("Lỗi truy xuất dữ liệu admin");
    }
};

// 8. Admin: Tìm kiếm đơn hàng theo ngày
exports.searchOrders = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        let error = null;
        let orders = [];

        if (startDate && endDate) {
            // Ràng buộc: Ngày bắt đầu < Ngày kết thúc
            if (new Date(startDate) > new Date(endDate)) {
                error = "Ngày bắt đầu phải trước ngày kết thúc!";
            } else {
                orders = await Order.find({
                    orderDate: { 
                        $gte: new Date(startDate), 
                        $lte: new Date(endDate + 'T23:59:59') 
                    }
                }).populate('customerId productId');
            }
        }

        res.render('searchOrders', { orders, error, user: req.session.user });
    } catch (err) {
        res.status(500).send("Lỗi tìm kiếm đơn hàng");
    }
};