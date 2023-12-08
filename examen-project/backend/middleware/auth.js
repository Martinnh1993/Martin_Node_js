const ErrorResponse = require('../utils/errorResponse')
const jwt = require('jsonwebtoken')
const User = require('../models/userModel')

// check if user is authendicated
exports.isAuthendicated = async (req, res, next) => {
    let token;

    console.log("Authorization Header:", req.headers.authorization); // Log the authorization header

    // Check if token is in headers
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1]; // Extract the token
    }

    if (!token) {
        return next(new ErrorResponse('You must be logged in...', 401));
    }

    try {
        // Verify token and decode it
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log("Decoded Token:", decoded); // Log the decoded token

        // Find user based on ID in decoded token
        req.user = await User.findById(decoded.id);
        console.log("User from token:", req.user); // Log the user obtained from the token

        next();
    } catch (error) {
        console.error("Error in isAuthenticated middleware:", error); // Log the error
        return next(new ErrorResponse('You must be logged in', 401));
    }
}

// middleware for admin
exports.isAdmin = (req, res, next) => {
    if (req.user.role === 'user') {
        return next(new ErrorResponse('Access denied, you must be admin', 401))
    }
    next()
}