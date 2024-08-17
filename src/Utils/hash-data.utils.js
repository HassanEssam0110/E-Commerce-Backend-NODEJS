import crypto from 'crypto';
import bcrypt from 'bcryptjs';


/**
 * Hashes data using SHA-256 algorithm.
 *
 * @param {string} data - The data to be hashed.
 * @returns {string} The hashed data in hexadecimal format.
 * 
 * @example
 * const hashedData = cryptoHashData('myData');
 * console.log(hashedData); // Output: e.g., '5d41402abc4b2a76b9719d911017c592'
 */
export const cryptoHashData = (data) => {
    const hashed = crypto.createHash('sha256').update(data).digest('hex');
    return hashed;
}

/**
 * Hashes data using bcrypt algorithm.
 *
 * @param {string} data - The data to be hashed.
 * @returns {string} The hashed data.
 * 
 * @example
 * const hashedData = bcryptHashData('myPassword');
 * console.log(hashedData); // Output: e.g., '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36...' 
 */
export const bcryptHashData = (data) => {
    const hashed = bcrypt.hashSync(data, +process.env.BCRYPT_SALT);
    return hashed;
}

/**
 * Compares data with a bcrypt hash.
 *
 * @param {string} data - The data to be compared.
 * @param {string} hashData - The hashed data to compare against.
 * @returns {boolean} True if the data matches the hash, false otherwise.
 * 
 * @example
 * const isMatch = bcryptCompare('myPassword', hashedData);
 * console.log(isMatch); // Output: true or false
 */
export const bcryptCompare = (data, hashData) => {
    const result = bcrypt.compareSync(data, hashData);
    return result;
}