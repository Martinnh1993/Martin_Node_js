const User = require('../models/userModel')
const ErrorResponse = require('../utils/errorResponse')

// sign up
exports.signup = async (req, res, next) => {
    const { email } = req.body
    const userExists = await User.findOne({ email })
    if (userExists) {
        return next(new ErrorResponse('E-mail already registered', 400))
    }
    try {
        const user = await User.create(req.body)
        res.status(201).json({
            success: true, 
            user
        })
    } catch (error) {
        next(error)
    }
}

// sign in
exports.signin = async (req, res, next) => {
    try {
        const { email, password } = req.body
        // validation
        if (!email) {
            return next(new ErrorResponse('Please enter an email', 403))
        }
        if (!password) {
            return next(new ErrorResponse('Please enter a password', 403))
        }

        // check user email 
        const user = await User.findOne({email})
        if (!user) {
            return next(new ErrorResponse('Invalid credentials', 400))
        }
        // check password 
        const isMatched = await user.comparePassword(password);
        if (!isMatched) {
            return next(new ErrorResponse('Invalid credentials', 400))
        }

        sendTokenResponse(user, 200, res)
    } catch (error) {
        next(error)
    }
}

const sendTokenResponse = (user, statusCode, res) => {
    const token = user.getJwtToken();
    res.status(statusCode).json({
        success: true,
        id: user._id,
        role: user.role,
        token: token
    });
};


// log out
exports.logout = (req, res, next) => {
    res.clearCookie('token')
    res.status(200).json({
        success: true, 
        message: 'logged out'
    })
}

// log profile
exports.userProfile = async (req, res, next) => {
    const user = await User.findById(req.user.id).select('-password')
    res.status(200).json({
        success: true, 
        user
    })
}