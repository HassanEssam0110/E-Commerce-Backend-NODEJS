import { User } from "../../DB/Models/index.js";
import { ApiError, verifyToken } from "../Utils/index.js";
import { catchError } from "./../Middlewares/index.js";


export const auth = catchError(async (req, res, next) => {
    const token = req.headers['authorization']?.split(" ")[1];
    if (!token) {
        return next(new ApiError('Access denied. No token provided.', 401));
    };

    // check if the valid 
    const decoded = verifyToken(token, process.env.JWT_SECRET_KEY)

    // check if user is exist.
    const currentUser = await User.findById(decoded.userId);
    if (!currentUser) {
        return next(new ApiError('The user that belong to this token does no longer exist.', 401));
    };

    //  check if user email is confirm.
    if (!currentUser?.isEmailvalidated) {
        return next(new ApiError('Please confirm your email address.', 401));
    };

    // check if password change after create token 
    if (currentUser.passwordChangedAt) {
        const passChangedAimestamp = parseInt(currentUser.passwordChangedAt.getTime() / 1000, 10);
        if (passChangedAimestamp > decoded?.iat) {
            return next(new ApiError('User recently changed his password. please login again..', 401));
        };
    };

    req.user = currentUser;
    next();
});