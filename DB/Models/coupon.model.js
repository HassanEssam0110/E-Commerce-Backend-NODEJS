import mongoose from '../global-setup.js';
const { model, Schema } = mongoose;

const couponSchema = new Schema({
    code: {
        type: String,
        unique: true,
        required: true
    },
    expires: Date,
    discount: Number

}, { timestamps: true, versionKey: false });


export const Coupon = model('Coupon', couponSchema);