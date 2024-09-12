import Joi from "joi";
import { CouponType, generalRules } from "../../Utils/index.js";


export const CreateCouponSchema = {
    body: Joi.object({
        couponCode: Joi.string().required(),
        couponType: Joi.string().valid(...Object.values(CouponType)).required(),
        from: Joi.date().greater(Date.now()).required(),
        till: Joi.date().greater(Joi.ref('from')).required(),
        Users: Joi.array().items(Joi.object({
            user: generalRules._id.required(),
            maxCount: Joi.number().min(1).required(),
        })),
        couponAmount: Joi.number().required().min(1).when('couponType', {
            is: CouponType.Percentage,
            then: Joi.number().max(100).required(),
        }).messages({
            'number.base': 'Coupon amount must be a number',
            'number.max': 'Coupon amount must be less than or equal to 100',
            'number.min': 'Coupon amount must be greater than 0',
        }),
    })
}
export const UpdateCouponSchema = {
    body: Joi.object({
        couponCode: Joi.string().optional(),
        couponType: Joi.string().valid(...Object.values(CouponType)).optional(),
        from: Joi.date().greater(Date.now()).optional(),
        till: Joi.date().greater(Joi.ref('from')).optional(),
        Users: Joi.array().items(Joi.object({
            user: generalRules._id.optional(),
            maxCount: Joi.number().min(1).optional(),
        })).optional(),
        couponAmount: Joi.number().optional().min(1).when('couponType', {
            is: CouponType.Percentage,
            then: Joi.number().max(100).required(),
        }).messages({
            'number.base': 'Coupon amount must be a number',
            'number.max': 'Coupon amount must be less than or equal to 100',
            'number.min': 'Coupon amount must be greater than 0',
        }),
    }),
    params: Joi.object({
        _id: generalRules._id.required()
    }),
}

export const DisableEnableCouponSchema = {
    body: Joi.object({
        enable: Joi.boolean().required()
    }),
    params: Joi.object({
        _id: generalRules._id.required()
    }),
}