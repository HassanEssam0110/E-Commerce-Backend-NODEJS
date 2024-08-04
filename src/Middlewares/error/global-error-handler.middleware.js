import { ApiError } from "../../Utils/index.js";

// Function to send error details during development
const sendErrorForDev = (err, res) => res.status(err.statusCode).json({
    status: err.status,
    statusCode: err.statusCode,
    message: err.message,
    data: err.data,
    location: err.location,
    stack: err.stack
});

// Function to send error details during production
const sendErrorForProd = (err, res) => res.status(err.statusCode).json({
    status: err.status,
    statusCode: err.statusCode,
    message: err.message,
    data: err.data,
});

// handle token errors 
const handleJWTInvalidSignature = () => new ApiError('Invalid token, please login again..', 401) // Handle invalid JWT signature error
const handleJWTTokenExpired = () => new ApiError('Expired Token, please login again..', 401)// Handle expired JWT token error

// Global error handling middleware
export const globalError = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';
    err.data = err.data || undefined;

    // Check for specific JWT errors and handle them accordingly
    if (err.name === 'JsonWebTokenError') err = handleJWTInvalidSignature();
    if (err.name === 'TokenExpiredError') err = handleJWTTokenExpired();


    // Send detailed error information in development mode
    if (process.env.NODE_ENV === 'development') {
        return sendErrorForDev(err, res)
    }
    // Send minimal error information in production mode
    else {
        return sendErrorForProd(err, res)
    }

}