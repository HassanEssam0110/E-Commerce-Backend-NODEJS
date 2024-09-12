import { scheduleJob } from 'node-schedule';
import { DateTime } from 'luxon';
import { Coupon } from '../../DB/Models/index.js';


/**
 * @description A cron job that runs every day at 11:59 PM to disable coupons that have expired.
 */
export const disableCouponsCron = () => {
    // Schedule job to run every day at 11:59 PM
    scheduleJob('0 59 23 * * *', async () => {

        const enabledCoupons = await Coupon.find({ isEnabled: true });

        if (enabledCoupons.length) {
            for (const coupon of enabledCoupons) {
                if (DateTime.now() > DateTime.fromJSDate(coupon?.till)) {
                    coupon.isEnabled = false;
                    await coupon.save();
                }
            }

        }
    });
}