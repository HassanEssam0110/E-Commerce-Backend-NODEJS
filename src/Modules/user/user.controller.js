import { User, Address } from "../../../DB/Models/index.js";
import { catchError } from "../../Middlewares/index.js";
import { ApiError, bcryptCompare, cryptoHashData, generateOTP, generateToken, MsgHTML, sendResponse, sentOTP } from "../../Utils/index.js";
import { sendMails } from "../../services/index.js";



/**
 * @description   Register new user.
 * @route {POST} /api/v1/users/register
 */
export const register = catchError(async (req, res, next) => {
    const { username, email, password, phone, age, gender, role, country, city, postalCode, buildingNumber, floorNumber, addressLabel } = req.body;
    // 1- create  inctence from user.
    const userObject = new User({ username, email, password, phone, age, gender, role });

    // 2 create inctence from address
    const addressObject = new Address({ user: userObject._id, country, city, postalCode, buildingNumber, floorNumber, addressLabel, isDefault: true })

    // 3- generate OTP
    // const otp = generateOTP();
    // userObject.emailVerifyCode = cryptoHashData(otp.toString());
    // userObject.emailVerifyExpires = new Date(Date.now() + 10 * 60 * 1000);


    // 4- send confirmation email
    // const isEmailSent = await sentOTP({
    //     to: userObject.email,
    //     subject: "Welcome to E-commerce App - Verify your email address",
    //     otp,
    //     userName: userObject.username,
    //     textmessage: 'Thank you for choosing our App. Please use the following OTP to complete your sign-up process. The OTP is valid for 10 minutes.',
    // });

    // if (isEmailSent?.rejected.length) {
    //     userObject.emailVerifyCode = undefined;
    //     userObject.emailVerifyExpires = undefined;
    //     return next(new ApiError('send verification Email is faild', 500, 'signUp controller'))
    // };

    // 5- save user and address in DB
    const newUser = await userObject.save();
    const newAddress = await addressObject.save();

    return sendResponse(res, { data: { user: newUser, address: newAddress }, }, 201);
});

/**
 * @description   Login  user.
 * @route {POST} /api/v1/users/signin
 */
export const signin = catchError(async (req, res, next) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    // Check if user exists and password is correct
    if (!user || !bcryptCompare(password, user.password)) {
        return next(new ApiError('Incorrect email or password', 401));
    }

    // Generate token for authenticated user
    const token = generateToken(
        { userId: user._id, role: user.role }
        , process.env.JWT_SECRET_KEY
        , process.env.JWT_EXPIRE_TIME);

    return sendResponse(res, { data: user, token });
});


// ------------------  Email Confirmation   ------------------
/**
 * @description   Verify E-mail address.
 * @route {POST} /api/v1/users/verify-email
 */
export const verifyEmail = catchError(async (req, res, next) => {
    const { verifyCode } = req.body;
    const hashVerifyCode = cryptoHashData(verifyCode);

    // get user  based on resetCode
    const user = await User.findOne({
        emailVerifyCode: hashVerifyCode,
        emailVerifyExpires: { $gt: Date.now() }
    });

    if (!user) {
        return next(new ApiError(`verification code invalid or expired`, 400));
    }

    // 2- verify code valid
    user.isEmailvalidated = true;
    user.emailVerifyCode = undefined;
    user.emailVerifyExpires = undefined;

    const userUpdated = await user.save();
    return sendResponse(res, { message: 'confirmed', data: userUpdated });
});
/**
 * @description   Resend verify  code to E-mail address.
 * @route {POST} /api/v1/users/resend-verify-code
 */
export const resendEmailVerifyCode = catchError(async (req, res, next) => {
    const { email } = req.body;
    // 1- get user
    const user = await User.findOne({ email, isEmailvalidated: false });
    if (!user) {
        return next(new ApiError('Invalid email or user already confirmed', 400))
    }

    // 2- generate OTP
    const otp = generateOTP();
    user.emailVerifyCode = cryptoHashData(otp.toString());
    user.emailVerifyExpires = new Date(Date.now() + 10 * 60 * 1000);

    // 3- send  OTP via email
    const isEmailSend = await sentOTP({
        to: user.email,
        subject: "E-commerce App - resend your verification code",
        otp,
        userName: user.username,
        textmessage: 'Please use the following OTP to complete your sign-up process. The OTP is valid for 10 minutes.',
    });

    if (isEmailSend?.rejected.length) {
        user.emailVerifyCode = undefined;
        user.emailVerifyExpires = undefined;
        return next(new ApiError('send verification Email is faild', 500, 'resend Verification Code controller'))
    };

    await user.save();
    return sendResponse(res, { message: 'Verification code resent successfully' });
});


// ------------------  Forget Password   ------------------
/**
 * @description   Forgot user Password.
 * @route {POST} /api/v1/users/forgot-password
 */
export const forgotPassword = catchError(async (req, res, next) => {
    const { email } = req.body;
    const user = await User.findOne({ email });

    // 1- Check if user exists and password is correct
    if (!user) {
        return next(new ApiError(`No account found with the provided email.`, 404));
    }

    // 2- Generate OTP && hashing OTP in db
    const resetCode = generateOTP();
    const hashResetCode = cryptoHashData(resetCode.toString());

    user.passwordResetCode = hashResetCode;
    user.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    //  3- Send otp via email
    const isEmailSend = await sentOTP({
        to: user.email,
        subject: "E-commerce App - Password Reset Code",
        otp: resetCode,
        userName: user.username,
        textmessage: 'Use the following code to reset your password. This code is valid for 10 minutes.',
    });

    if (isEmailSend.rejected.length) {
        user.passwordResetCode = undefined;
        user.passwordResetExpires = undefined;
        user.passwordResetVerified = undefined;
        return next(new ApiError('send reset code is faild', 500, 'forgotPassword controller'))
    };

    // 4- save user in DB
    await user.save();
    return sendResponse(res, { message: "A reset code has been sent to your email. Please check your inbox and follow the instructions to reset your password." });
});

/**
 * @description   Verify reset code to change password.
 * @route {POST} /api/v1/users/verify-password-reset-code
 */
export const verifyPassResetCode = catchError(async (req, res, next) => {
    const { resetCode } = req.body;
    const hashResetCode = cryptoHashData(resetCode);
    // 1- get user  based on resetCode
    const user = await User.findOne({
        passwordResetCode: hashResetCode,
        passwordResetExpires: { $gt: Date.now() }
    });

    if (!user) {
        return next(new ApiError(`Reset code invalid or expired`, 400));
    }

    // 2- Reset code valid
    user.passwordResetVerified = true;

    await user.save();
    return sendResponse(res);
});
/**
 * @description   Change password before verify reset code.
 * @route {POST} /api/v1/users/reset-password
 */
export const resetPassword = catchError(async (req, res, next) => {
    const { email, newPassword } = req.body;

    // get user  based on resetCode
    const user = await User.findOne({ email });

    if (!user) {
        return next(new ApiError(`There is not user in this email.`, 404));
    }

    if (!user.passwordResetVerified) {
        return next(new ApiError(`Reset code not verified.`, 400));
    }

    // Generate token for authenticated user
    const token = generateToken(
        { userId: user._id, role: user.role }
        , process.env.JWT_SECRET_KEY
        , process.env.JWT_EXPIRE_TIME);

    user.password = newPassword;
    user.passwordResetVerified = undefined;
    user.passwordResetCode = undefined;
    user.passwordResetExpires = undefined;

    const loggedUser = await user.save();
    return sendResponse(res, { data: loggedUser, token });
});


// ------------------ User data modification   ------------------
/**
 * @description   Update logged user password.
 * @route {POST} /api/v1/users/update-password
 */
export const updatePassword = catchError(async (req, res, next) => {
    const { password, newPassword } = req.body;
    const user = req.user;

    // 1- Check if user password is correct
    if (!bcryptCompare(password, user.password)) {
        return next(new ApiError('Incorrect password', 403));
    }

    // 2- send email to user
    const isEmailSent = await sendMails({
        to: user.email,
        subject: "E-commerce App - change password",
        html: MsgHTML(user.name, 'Your password has been changed successfully.')
    });


    if (isEmailSent?.rejected.length) {
        return next(new ApiError('send change passwoed Email is faild', 500))
    };

    // 3- save updated password
    user.password = newPassword;
    user.passwordChangedAt = new Date();
    await user.save();
    return sendResponse(res, { message: 'password changed successfully, please login again.' });
});

/**
 * @description   Update logged user data.
 * @route {POST} /api/v1/users/update
 */
export const updateLoggedUserData = catchError(async (req, res, next) => {
    const user = req.user;
    const { username, email, age, phone, gender } = req.body;

    if (username) user.username = username;
    if (email) user.email = email;
    if (age) user.age = age;
    if (phone) user.phone = phone;
    if (gender) user.gender = gender;

    const updatedUser = await user.save();

    const token = generateToken(
        { userId: updatedUser._id, role: updatedUser.role },
        process.env.JWT_SECRET_KEY,
        process.env.JWT_EXPIRE_TIME);

    return sendResponse(res, { data: user, token });
});


// ------------------ GET user Data  ------------------
/**
 * @description   Get logged user data.
 * @route {GET} /api/v1/users/logged-user
 */
export const getLoggedUser = catchError(async (req, res, next) => {
    const user = req.user;
    return sendResponse(res, { data: user });
});
