const User = require('../models/userModel');
const bcrypt = require('bcryptjs');

exports.getLogin = (req, res) => res.render('login', { error: null });

exports.postLogin = async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (user && await bcrypt.compare(password, user.password)) {
        req.session.user = user;
        return user.role === 'admin' ? res.redirect('/orders/admin/list') : res.redirect('/orders/place');
    }
    res.render('login', { error: 'Invalid username or password' });
};