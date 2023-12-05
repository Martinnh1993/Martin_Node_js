const express = require('express')
const app = express()
const mongoose = require('mongoose')
const morgan = require('morgan')
const bodyParser = require('body-parser')
require('dotenv').config()
const cors = require('cors')
const cookieParser = require('cookie-parser')

const errorHandler = require('./middleware/error')

// import routes 
const authRoutes = require('./routes/authRoutes')
const postRoutes = require('./routes/postRoutes')

// database connection
mongoose.connect(process.env.DATABASE)
.then(() => console.log('DB Connected'))
.catch((error) => console.log(error))

// middleware 
app.use(morgan('dev'))
app.use(bodyParser.json({ limit: 'smb'}))
app.use(bodyParser.urlencoded({
    limit: 'smb',
    extended: true
}))
app.use(cookieParser())
app.use(cors())

// routes middleware
app.use('/api', authRoutes)
app.use('/api', postRoutes)

// error middleware
app.use(errorHandler)

const port = process.env.PORT || 9000
app.listen(port, () => {
    console.log(`server is running on port ${port}`);
})