const express = require('express')
const { signup, signin, logout, userProfile } = require('../controllers/authController')
const { isAuthendicated } = require('../middleware/auth')
const router = express.Router()

// auth routes 

// api/signup
router.post('/signup', signup)

// api/signin
router.post('/signin', signin)

// api/logout
router.get('/logout', logout)

// api/me
router.get('/me', isAuthendicated, userProfile)

module.exports = router