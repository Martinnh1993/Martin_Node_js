const express = require('express')
const http = require('http');
const socketIo = require('socket.io');
const app = express()
const server = http.createServer(app); 
const mongoose = require('mongoose')
const morgan = require('morgan')
const bodyParser = require('body-parser')
require('dotenv').config();
const cors = require('cors')
const cookieParser = require('cookie-parser')
const errorHandler = require('./middleware/error')
const io = require('socket.io')(server, {
  cors: {
      origin: "http://127.0.0.1:5500",
      methods: ["GET", "POST"]
  }
});


// import routes 
const authRoutes = require('./routes/authRoutes')
const postRoutes = require('./routes/postRoutes')

// database connection
mongoose.connect(process.env.DATABASE)
  .then(() => {
    console.log('DB Connected');

    // Connection is successful, now set up change stream
    const db = mongoose.connection;
    
    const postChangeStream = db.collection('posts').watch();
    postChangeStream.on('change', (change) => {
      console.log('Change detected in posts collection:', change);
      // Emit change to all connected clients
      io.emit('postChange', change);
    });

    postChangeStream.on('error', (error) => {
      console.error('Error in change stream:', error);
    });
  })
  .catch((error) => {
    console.log('DB connection error:', error);
  });

// Serve static files from 'frontend/public'
app.use(express.static('frontend/public'));

io.on('connection', (socket) => {
    console.log('A user connected');
    
    socket.on('setUserData', (userData) => {
        socket.userData = userData;
        console.log('User data set:', userData);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});


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

const port = process.env.PORT || 9000;
server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
