/**
 * Cloudinary Configuration
 * Setup for image upload functionality
 */

const cloudinary = require('cloudinary').v2;

// Configure Cloudinary with environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload image to Cloudinary
 * @param {String} filePath - Path to the file to upload
 * @param {String} folder - Cloudinary folder name
 * @returns {Object} Upload result with URL
 */
const uploadToCloudinary = async (filePath, folder = 'chat-spark') => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: folder,
      resource_type: 'auto', // Automatically detect file type
      transformation: [
        { width: 1000, height: 1000, crop: 'limit' }, // Limit size
        { quality: 'auto' }, // Auto quality
        { fetch_format: 'auto' }, // Auto format
      ],
    });

    return {
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
      size: result.bytes,
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error('Failed to upload image');
  }
};

/**
 * Delete image from Cloudinary
 * @param {String} publicId - Cloudinary public ID
 */
const deleteFromCloudinary = async (publicId) => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    throw new Error('Failed to delete image');
  }
};

module.exports = {
  uploadToCloudinary,
  deleteFromCloudinary,
};
