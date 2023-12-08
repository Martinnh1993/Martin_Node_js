const cloudinary = require('cloudinary').v2
          
cloudinary.config({ 
  cloud_name: process.env.COULD_NAME, 
  api_key: process.env.CLOUD_KEY, 
  api_secret: process.env.COULD_KEY_SECRET 
});

module.exports = cloudinary