import { DateTime } from 'luxon';
import { Cart, Address, Order } from '../../../DB/Models/index.js'
import { catchError } from './../../Middlewares/index.js';
import { ApiError, OrderSatus, PaymentMethods, sendResponse } from './../../Utils/index.js';
import { calcCartTotal } from '../cart/cart.utils.js';
import { applyCoupon, validateCoupon } from './order.utils.js';

export const creatOrder = catchError(async (req, res, next) => {
    const userId = req.user._id;
    const { address, addressId, contactNumber, VAT, shippingFee, couponCode, paymentMethod } = req.body;

    // find logged in user's cart with products
    const cart = await Cart.findOne({ user: userId }).populate('products.productId');
    if (!cart || !cart.products.length) return next(new ApiError('Cart is empty.', 404, 'Cart is empty.'));

    // check if any product is sold out
    const isSoldOut = cart.products.find(p => p.productId.stock < p.quantity);
    if (isSoldOut) return next(new ApiError(`Product ${isSoldOut.productId.title} is out of stock.`, 404, `Product ${isSoldOut.productId.title} is out of stock.`));

    // ==> Subtotal
    const subTotal = calcCartTotal(cart.products);

    // ==> Coupon 
    let total = subTotal + VAT + shippingFee;
    let coupon = null;
    if (couponCode) {
        const isCouponValid = await validateCoupon(couponCode, userId);
        if (isCouponValid.error) {
            return next(new ApiError(isCouponValid.message, 400, isCouponValid.message));
        }
        coupon = isCouponValid.coupon;
        total = applyCoupon(subTotal, coupon) + VAT + shippingFee;;
    }

    // ==> Address 
    if (!address || addressId) return next(new ApiError('Address is required.', 404, 'Address is required.'));
    if (addressId) {
        //check if address is valid
        const addressInfo = await Address.findOne({ _id: addressId, user: userId });
        if (!addressInfo) return next(new ApiError('Invalid Address.', 404, 'Invalid Address.'));
    }
    // ==> Order Status
    let orderStatus = OrderSatus.Pending;
    if (paymentMethod === PaymentMethods.Cash) {
        orderStatus = OrderSatus.Placed;
    }

    const orderObj = new Order({
        user: userId,
        products: cart.products,
        contactNumber,
        subTotal,
        total,
        VAT,
        shippingFee,
        address,
        addressId,
        couponId: coupon?._id,
        orderStatus,
        paymentMethod,
        estimatedDelivery: DateTime.now().plus({ days: 7 }).toFormat('yyyy-MM-dd')
    });

    await orderObj.save();

    // clear cart
    cart.products = [];
    await cart.save();

    return sendResponse(res, { data: orderObj }, 201);
})



