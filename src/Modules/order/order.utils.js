import { DateTime } from 'luxon';
import { Coupon } from '../../../DB/Models/index.js'
import { DiscountType } from '../../Utils/enums.utils.js';

/** 
 * @param {*} couponCode
 * @param {*} userId
 * @returns { message: String, error: Boolean, coupon: Object } 
*/
export const validateCoupon = async (couponCode, userId) => {
    const coupon = await Coupon.findOne({ couponCode });

    if (!coupon) {
        return { message: 'Invalid Coupon code.', error: true }
    };

    // check if coupon is enabled
    if (!coupon.isEnabled || DateTime.now() > DateTime.fromJSDate(coupon?.till)) {
        return { message: 'This Coupon is disabled.', error: true }
    };

    //check if coupon not started yet
    if (DateTime.now() < DateTime.fromJSDate(coupon?.from)) {
        return { message: `Coupon not started yet, will start on ${coupon.from}.`, error: true }
    }

    // check if user not eligible for to use coupon
    const isUserEligible = coupon.Users.some(u => u.user.toString() !== userId.toString() || (u.user.toString() === userId.toString() && u.maxCount > u.usageCount));
    if (!isUserEligible) {
        return { message: 'User is not eligible for this coupon or you reedem all your tries.', error: true }
    }


    return { error: false, coupon }
}


export const applyCoupon = (subTotal, coupon) => {
    let total = subTotal;
    const { couponAmount: discountAmount, couponType: discountType } = coupon;

    if (discountAmount && discountType) {
        if (discountType === DiscountType.Percentage) {
            total = subTotal - (subTotal * discountAmount / 100);
        }
        else if (discountType === DiscountType.Fixed) {
            if (discountAmount > subTotal) {
                return total;
            }
            total = subTotal - discountAmount;
        }
    }

    return total;
}