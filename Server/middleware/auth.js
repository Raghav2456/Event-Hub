const jwt = require('jsonwebtoken');
const User = require('../models/User');

// User authentication middleware to protect routes
const protect = async (req, res, next) => {
    let token = req.headers.authorization && req.headers.authorization.startsWith('Bearer ') ? req.headers.authorization.substring(7) : null;
    if (!token) {
        return res.status(401).json({ message: 'Not authorized, no token' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id).select('-password');
        
        if(!req.user) {
            return res.status(401).json({ message: 'Not authorized, user not found' });
        }
        next();
        
    } catch (error) {
        return res.status(401).json({ message: 'Not authorized, token failed' });
    }
};

// Admin authorization middleware to protect admin routes
const admin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        return res.status(403).json({ message: 'Not authorized, admin can access only' });
    }
};

module.exports = {
    protect,
    admin
};
