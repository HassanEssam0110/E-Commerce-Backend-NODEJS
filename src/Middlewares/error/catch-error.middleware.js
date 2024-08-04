import { ApiError } from "../../Utils/index.js";

/**
 * Middleware to catch errors in asynchronous route handlers and pass them to the next error handling middleware.
 * 
 * @param {function} callback - The asynchronous function to wrap. It should take `req`, `res`, and `next` as arguments.
 * @returns {function} Middleware function that wraps the provided callback and catches any errors, passing them to `next`.
 * 
 * @example
 * // Example usage in an Express route
 * router.get('/example', catchError(async (req, res, next) => {
 *   const result = await someAsyncOperation();
 *   res.send(result);
 * }));
 */
export const catchError = (callback) => {
    return (req, res, next) => {
        callback(req, res, next)
            .catch(err => next(new ApiError(
                'Internal Server error',
                400,
                err.message,
                'catch error Middleware',
                err.stack
            )));
    }
}