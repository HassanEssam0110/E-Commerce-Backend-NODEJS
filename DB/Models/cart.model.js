import mongoose from "mongoose";
import { calcCartTotal } from "../../src/Modules/cart/cart.utils.js";

const { Schema, model } = mongoose;

const cartSchema = new Schema({
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
    subTotal: Number,
}, {
    timestamps: true,
    versionKey: false
});

cartSchema.pre('save', function (next) {
    this.subTotal = calcCartTotal(this.products);
    next();
});

cartSchema.post('save', async function (doc) {
    // check if cart is empty and delete it.
    if (doc.products.length === 0) {
        await Cart.deleteOne({ user: doc.user });
    }

});

export const Cart = mongoose.models.Cart || model('Cart', cartSchema);