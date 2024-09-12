import { Router } from "express";

import * as controller from './coupon.controllers.js';
import * as validations from './coupon.validations.js';
import { auth, checkIsExist, checkIsNotExist, validatorMiddleware } from "../../Middlewares/index.js";
import { Coupon } from "../../../DB/Models/index.js";
import { Fields } from "../../Utils/index.js";


const couponRouter = Router();

couponRouter.post('/create',
    auth,
    validatorMiddleware(validations.CreateCouponSchema),
    checkIsExist(Coupon, Fields.Coupon_Code),
    controller.createCoupon
);


couponRouter.get('/', auth,
    controller.getCouponlist
);

couponRouter.get('/:_id', auth,
    controller.getCouponById
);

couponRouter.put('/update/:_id', auth,
    validatorMiddleware(validations.UpdateCouponSchema),
    checkIsNotExist(Coupon, [Fields._id]),
    checkIsExist(Coupon, Fields.Coupon_Code),
    controller.updateCoupon
);


couponRouter.patch('/enable/:_id', auth,
    validatorMiddleware(validations.DisableEnableCouponSchema),
    checkIsNotExist(Coupon, [Fields._id]),
    controller.disableEnableCoupon
);


export {
    couponRouter
}