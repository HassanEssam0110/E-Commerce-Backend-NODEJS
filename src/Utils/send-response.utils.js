/**
 * Sends a JSON response with the specified status code and data.
 *
 * @function sendResponse
 * @param {Object} res - The response object from Express.
 * @param {Object} [data={}] - The data to be included in the response body. Defaults to an empty object.
 * @param {number} [code=200] - The HTTP status code for the response. Defaults to 200.
 * @returns {Object} The response object with the specified status and data.
 */
export const sendResponse = (res, data = {}, code = 200) => {
    return res.status(code).json({ status: 'success', ...data })
};