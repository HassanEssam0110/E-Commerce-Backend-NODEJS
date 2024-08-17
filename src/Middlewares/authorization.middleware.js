import { ApiError } from './../Utils/index.js';
import { catchError } from './../Middlewares/index.js';


/**
 * Middleware function to authorize access based on user roles.
 * @param {Array<string>} allowedRoles - Array of roles allowed to access the route.
 * @returns {import('express').RequestHandler} Express middleware function.
 */
export const athorization = (allowedRoles) => {
    return catchError(async (req, res, next) => {

        const userRole = req.user.role;
        if (!allowedRoles.includes(userRole)) {
            return next(new ApiError('You are not allowed to access this route.', 403, 'Authorization Error'))
        }

        next();
    });
}
