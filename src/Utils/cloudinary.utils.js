import { v2 as cloudinary } from 'cloudinary';
import { ApiError } from './api-error.utils.js';

export const cloudinaryConfig = () => {
    // Configration cloudinary
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET
    });

    return cloudinary;
};


/**
 * Upload a file to Cloudinary.
 * @param {Object} params - The parameters for the upload.
 * @param {File} file - The file to be uploaded.
 * @param {String} folder he folder to upload the file to. Default is 'General'.
 * @param {String} publicId
 * @returns {Promise<Object>}  Returns an object containing the secure URL and public ID of the uploaded file.
 */
export const uploadFile = async ({ file, folder = 'General', publicId }) => {
    // Check if the file is provided
    if (!file) {
        throw new ApiError('please upload a image file.', 400, 'please upload a image file.', 'cloudinary Utils.')
    };

    // Set upload options
    let options = { folder };

    // Handle updating image file
    if (publicId) {
        options.public_id = publicId;
    };

    // Upload file to Cloudinary
    const { secure_url, public_id } = await cloudinaryConfig().uploader.upload(
        file,
        options
    )

    return { secure_url, public_id };
};
