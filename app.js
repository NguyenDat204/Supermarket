require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const path = require('path');

const app = express();

mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Database Connected Successfully'))
    .catch(err => console.error('Database Connection Error:', err));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
    secret: process.env.SESSION_SECRET || 'fallback_secret_dev',
    resave: false,
    saveUninitialized: false
}));

app.use('/auth', require('./routes/authRoutes'));
app.use('/orders', require('./routes/orderRoutes'));
app.use('/products', require('./routes/productRoutes'));

app.get('/', (req, res) => res.redirect('/auth/login'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});