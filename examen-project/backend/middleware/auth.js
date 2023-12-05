const ErrorResponse = require('../utils/errorResponse')
const jwt = require('jsonwebtoken')
const User = require('../models/userModel')

// check if user is authendicated
exports.isAuthendicated = async (req, res, next) => {
    const { token } = req.cookies
    // make sure token exsists
    if (!token) {
        return next(new ErrorResponse('you must be logged in...', 401))
    }

    try {
        // verify token
        const decoded = jwt.verify(token, process.env.JWT_SERCET)
        req.user = await User.findById(decoded.id)
        next()
    } catch (error) {
        return next(new ErrorResponse('you must be logged in', 401))
    }
}

// middleware for admin
exports.isAdmin = (req, res, next) => {
    if (req.user.role === 'user') {
        return next(new ErrorResponse('Access denied, you must be admin', 401))
    }
    next()
}