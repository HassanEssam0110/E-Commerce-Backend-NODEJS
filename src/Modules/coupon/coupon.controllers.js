import { catchError } from "../../Middlewares/index.js";
import { Coupon, User, CouponChangeLog } from "../../../DB/Models/index.js";
import { ApiError, sendResponse } from "../../Utils/index.js";


/**
 * @description  create new coupon 
 * @route {POST} /api/v1/coupons/create
 * @access Private
 */
export const createCoupon = catchError(async (req, res, next) => {
    const { couponCode, couponAmount, couponType, from, till, Users } = req.body;
    const user = req.user;

    // check if coupon already exist
    const isCouponExist = await Coupon.findOne({ couponCode });
    if (isCouponExist) return next(new ApiError('Coupon already exist', 400, 'Coupon already exist'));

    // check if users exist or not
    const users = Users.map(u => u.user); // ex: ['66ce6d78baf01796866883c7','66ce6d6dbaf01796866883c2']
    const validUsers = await User.find({ _id: { $in: users } });
    if (validUsers.length !== users.length) return next(new ApiError('Invalid users', 400, 'Invalid users'));

    const coupon = new Coupon({
        couponCode,
        couponAmount,
        couponType,
        from,
        till,
        Users,
        createdBy: user._id
    });

    const newCoupon = await coupon.save();
    return sendResponse(res, { data: newCoupon }, 201);
});


/**
 * @description   get coupon list
 * @route {GET} /api/v1/coupons/
 * @access Private
 */
export const getCouponlist = catchError(async (req, res, next) => {
    const { isEnabled } = req.query;
    const filterQuery = {};

    if (isEnabled) {
        filterQuery.isEnabled = isEnabled === 'true' ? true : false;
    };

    const coupons = await Coupon.find(filterQuery);
    return sendResponse(res, { count: coupons.length, data: coupons });
});


/**
 * @description    get coupon by id
 * @route {GET} /api/v1/coupons/_id
 * @access Private
 */
export const getCouponById = catchError(async (req, res, next) => {
    const { _id } = req.params;
    const coupon = await Coupon.findById(_id);
    if (!coupon) {
        return next(new ApiError('Coupon not found', 400, 'Coupon not found'));
    };
    return sendResponse(res, { data: coupon });
});


/**
 * @description    update coupon by id
 * @route {PUT} /api/v1/coupons/update/:_id
 * @access Private
 */
export const updateCoupon = catchError(async (req, res, next) => {
    const userId = req.user._id;
    const { couponCode, couponAmount, couponType, from, till, Users } = req.body;
    const coupon = req.document;
    const logUpdatedObject = { coupon: coupon._id, updatedBy: userId, changes: {} };

    if (couponCode) {
        const isCouponExist = await Coupon.findOne({ couponCode });
        if (isCouponExist) return next(new ApiError('Coupon already exist', 400, 'Coupon already exist'));

        coupon.couponCode = couponCode;
        logUpdatedObject.changes.couponCode = couponCode;
    }

    if (couponAmount) {
        coupon.couponAmount = couponAmount;
        logUpdatedObject.changes.couponAmount = couponAmount;
    }

    if (couponType) {
        coupon.couponType = couponType;
        logUpdatedObject.changes.couponType = couponType;
    }

    if (from) {
        coupon.from = from;
        logUpdatedObject.changes.from = from;
    }

    if (till) {
        coupon.till = till;
        logUpdatedObject.changes.till = till;
    }

    if (Users) {
        // check if users exist or not
        const users = Users.map(u => u.user); // ex: ['66ce6d78baf01796866883c7','66ce6d6dbaf01796866883c2']
        const validUsers = await User.find({ _id: { $in: users } });
        if (validUsers.length !== users.length) return next(new ApiError('Invalid users', 400, 'Invalid users'));

        coupon.Users = Users;
        logUpdatedObject.changes.Users = Users;
    }

    await coupon.save();
    const log = await new CouponChangeLog(logUpdatedObject).save();
    return sendResponse(res, { data: log });
});


/**
 * @description    enable or disable coupon by id
 * @route {Patch} /api/v1/coupons/enable/:_id
 * @access Private
 */
export const disableEnableCoupon = catchError(async (req, res, next) => {
    const userId = req.user._id;
    const { enable } = req.body;
    const coupon = req.document;
    const logUpdatedObject = { coupon: coupon._id, updatedBy: userId, changes: {} };

    if (enable === true) {
        coupon.isEnabled = true;
        logUpdatedObject.changes.isEnabled = true;
    }

    if (enable === false) {
        coupon.isEnabled = false;
        logUpdatedObject.changes.isEnabled = false;
    }


    await coupon.save();
    const log = await new CouponChangeLog(logUpdatedObject).save();
    return sendResponse(res, { data: log });
});