const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/auth/login');
});
router.get('/login', authController.getLogin);
router.post('/login', authController.postLogin);
module.exports = router;