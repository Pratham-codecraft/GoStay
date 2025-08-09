const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'GoStay_DEV',
    allowedFormats:["png","jpg","jpeg","webp"],
  },
});
console.log("CLOUD_SECRET:", process.env.CLOUD_API_SECRET); // should log the secret

module.exports = {
  cloudinary,
  storage
};


