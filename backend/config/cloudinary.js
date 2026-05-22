// const cloudinary = require('cloudinary').v2;
// const { CloudinaryStorage } = require('multer-storage-cloudinary');
// const multer = require('multer');

// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET,
// });

// const storage = new CloudinaryStorage({
//   cloudinary,
//   params: {
//     folder: 'ecommerce',
//     allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
//     transformation: [{ width: 800, height: 800, crop: 'limit' }],
//   },
// });

// const upload = multer({ storage });

// module.exports = { cloudinary, upload };




const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload a single file buffer to Cloudinary
 * @param {Buffer} buffer   - file buffer from express-fileupload
 * @param {string} folder   - cloudinary folder name
 * @param {Object} opts     - extra cloudinary options
 * @returns {{ url, public_id }}
 */
const uploadToCloudinary = (buffer, folder = 'ecommerce', opts = {}) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
        transformation: [{ width: 800, height: 800, crop: 'limit' }],
        ...opts,
      },
      (error, result) => {
        if (error) return reject(error);
        resolve({ url: result.secure_url, public_id: result.public_id });
      }
    );
    stream.end(buffer);
  });
};

/**
 * Delete image from Cloudinary by public_id
 */
const deleteFromCloudinary = async (public_id) => {
  if (!public_id) return;
  try {
    await cloudinary.uploader.destroy(public_id);
  } catch (err) {
    console.error('Cloudinary delete error:', err.message);
  }
};

module.exports = { cloudinary, uploadToCloudinary, deleteFromCloudinary };