import Stripe from 'stripe';

import { Coupon } from '../../DB/Models/index.js';
import { ApiError, CouponType } from '../Utils/index.js';


export const createCheckoutSession = async ({ customer_email, metadata, discounts, line_items }) => {

    // creat instance of stripe
    const stripe = new Stripe(process.env.STRIPE_SECRIT_KEY);

    const paymentData = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'payment',
        customer_email,
        metadata,
        line_items,
        success_url: process.env.STRIPE_SUCCESS_URL,
        cancel_url: process.env.STRIPE_CANCEL_URL,
        discounts
    });

    return paymentData;
}

export const createStripCoupon = async ({ couponId }) => {
    // check if coupon exist
    const coupon = await Coupon.findById(couponId);
    if (!coupon) {
        return next(new ApiError('Coupon not found', 404, 'Coupon not found'));
    }

    // create coupon object
    let couponObject = {};

    if (coupon.couponType === CouponType.Fixed) {
        couponObject = {
            name: coupon.couponCode,
            amount_off: coupon.couponAmount * 100,
            currency: 'egp',
        }
    }

    if (coupon.couponType === CouponType.Percentage) {
        couponObject = {
            name: coupon.couponCode,
            percent_off: coupon.couponAmount,
        }
    }


    // creat instance of stripe
    const srtipe = new Stripe(process.env.STRIPE_SECRIT_KEY);

    const stripeCoupon = await srtipe.coupons.create(couponObject);
    return stripeCoupon;
}
