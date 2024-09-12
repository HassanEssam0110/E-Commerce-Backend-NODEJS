import mongoose from 'mongoose';
import { OrderSatus, PaymentMethods } from '../../src/Utils/index.js';
import { Product, Coupon } from '../Models/index.js';

const { model, Schema } = mongoose;

const orderSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    products: [
        {
            productId: {
                type: Schema.Types.ObjectId,
                ref: "Product",
                required: true
            },
            quantity: {
                type: Number,
                required: true,
                default: 1,
                min: [1, 'Quantity can not be less than 1.']
            },
            price: {
                type: Number,
                required: true
            }
        }
    ],
    address: String,
    addressId: {
        type: Schema.Types.ObjectId,
        ref: 'Address'
    },
    contactNumber: {
        type: String,
        required: true
    },
    subTotal: {
        type: Number,
        required: true
    },
    shippingFee: {
        type: Number,
        required: true
    },
    VAT: {
        type: Number,
        required: true
    },
    couponId: {
        type: Schema.Types.ObjectId,
        ref: 'Coupon'
    },
    total: {
        type: Number,
        required: true
    },
    estimatedDelivery: {
        type: Date,
        required: true
    },
    paymentMethod: {
        type: String,
        required: true,
        enum: Object.values(PaymentMethods),
    },
    orderStatus: {
        type: String,
        required: true,
        enum: Object.values(OrderSatus),
    },
    deliverdBy: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    canceledBy: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    deliveredAt: {
        type: Date
    },
    canceledAt: {
        type: Date
    },

}, { timestamps: true, versionKey: false });


/** 
 * hook to after save order Decrement stock of products and Increment usageCount of coupon
 */
orderSchema.post('save', async function () {
    // decrement stock of products
    for (const product of this.products) {
        await Product.updateOne({ _id: product.productId }, { $inc: { stock: -product.quantity } });
    }

    // increment usageCount of coupon
    if (this.couponId) {
        const coupon = await Coupon.findById(this.couponId);
        coupon.Users.find(u => u.user.toString() === this.user.toString()).usageCount += 1;
        await coupon.save();
    }
})

export const Order = mongoose.models.Order || model('Order', orderSchema);