import mongoose from '../global-setup.js';

import { CouponType } from '../../src/Utils/index.js';

const { model, Schema } = mongoose;

const couponSchema = new Schema({
    couponCode: {
        type: String,
        required: true,
        unique: true,
    },
    couponAmount: {
        type: Number,
        required: true,
    },
    couponType: {
        type: String,
        enum: Object.values(CouponType),
        required: true
    },
    from: {
        type: Date,
        required: true
    },
    till: {
        type: Date,
        required: true
    },
    Users: [
        {
            user: {
                type: Schema.Types.ObjectId,
                ref: 'User',
                required: true
            },
            maxCount: {
                type: Number,
                required: true,
                min: 1,
            },
            usageCount: {
                type: Number,
                default: 0
            }
        }
    ],
    isEnabled: {
        type: Boolean,
        default: true
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, { timestamps: true, versionKey: false });


export const Coupon = mongoose.models.Coupon || model('Coupon', couponSchema);

const copuonChangLog = new Schema({
    coupon: {
        type: Schema.Types.ObjectId,
        ref: 'Coupon',
        required: true
    },
    updatedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    changes: {
        type: Object,
        required: true
    }
},
    { timestamps: true, versionKey: false });

export const CouponChangeLog = mongoose.models.CouponChangeLog || model('CouponChangeLog', copuonChangLog);