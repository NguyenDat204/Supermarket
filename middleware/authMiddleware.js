exports.isAuth = (req, res, next) => {
    if (req.session.user) return next();
    res.redirect('/auth/login');
};

exports.isAdmin = (req, res, next) => {
    if (req.session.user && req.session.user.role === 'admin') return next();
    res.status(403).send('Access Denied: Admin Only');
};

exports.isCustomer = (req, res, next) => {
    if (req.session.user && req.session.user.role === 'customer') return next();
    res.status(403).send('Access Denied: Customer Only');
};