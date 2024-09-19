import { DateTime } from 'luxon';
import { Cart, Address, Order, Product } from '../../../DB/Models/index.js'
import { catchError } from './../../Middlewares/index.js';
import { ApiError, OrderSatus, PaymentMethods, sendResponse } from './../../Utils/index.js';
import { calcCartTotal } from '../cart/cart.utils.js';
import { applyCoupon, validateCoupon } from './order.utils.js';
import { ApiFeatures } from './../../Utils/index.js';
import { createCheckoutSession, createStripCoupon } from '../../Payment-handler/stripe.js';


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
});

export const cancelOrder = catchError(async (req, res, next) => {
    const userId = req.user._id;
    const { orderId } = req.params;

    // get order
    const order = await Order.findOne({
        _id: orderId,
        user: userId,
        orderStatus: { $in: [OrderSatus.Placed, OrderSatus.Pending, OrderSatus.Confirmend] }
    });

    if (!order) return next(new ApiError('Order not found.', 404, 'Order not found.'));

    // check if order duration is greater than 3 days.
    const currentDate = DateTime.now();
    const orderDate = DateTime.fromJSDate(order.createdAt);
    const diff = Math.ceil(Number(currentDate.diff(orderDate, 'days').toObject().days).toFixed(2));

    if (diff > 3) {
        return next(new ApiError('cannot cancel order after 3 days.', 400, 'cannot cancel order after 3 days.'));
    }

    // update order status to canceled
    order.orderStatus = OrderSatus.Canceled;
    order.canceledBy = userId;
    order.canceledAt = DateTime.now();

    await Order.updateOne({ _id: orderId }, order);

    // update product model
    for (const product of order.products) {
        await Product.updateOne({ _id: product.productId }, { $inc: { stock: product.quantity } });
    }

    return sendResponse(res, { data: order });
});

export const deliverdOrder = catchError(async (req, res, next) => {
    const userId = req.user._id;
    const { orderId } = req.params;

    // get order
    const order = await Order.findOne({
        _id: orderId,
        orderStatus: { $in: [OrderSatus.Placed, OrderSatus.Pending, OrderSatus.Confirmend] }
    });

    if (!order) return next(new ApiError('Order not found.', 404, 'Order not found.'));

    // update order to deliverd
    order.orderStatus = OrderSatus.Delivered;
    order.deliverdBy = userId;
    order.deliveredAt = DateTime.now();

    await Order.updateOne({ _id: orderId }, order);

    return sendResponse(res, { data: order });
});

export const listOrders = catchError(async (req, res, next) => {
    // 1- Get total document count
    const countDocuments = await Order.countDocuments(); // get total document count

    // 2- Build query using ApiFeatures   
    const apiFeatures = new ApiFeatures(Order.find(), req.query)
        // .search()
        .filter()
        .sort()
        .fields()
        .pagination(countDocuments)

    // 3- Execute query
    const { mongooseQuery, paginationResult } = apiFeatures
    const documents = await mongooseQuery;

    return sendResponse(res, { pagination: paginationResult, count: documents.length, documents });
});

export const paymentWithStripe = catchError(async (req, res, next) => {
    const user = req.user;
    const { orderId } = req.params;

    const order = await Order.findOne({
        _id: orderId,
        user: user._id,
        orderStatus: OrderSatus.Pending
    }).populate('products.productId');

    if (!order) return next(new ApiError('Order not found.', 404, 'Order not found.'));

    const paymentObj = {
        customer_email: user.email,
        metadata: { orderId: order._id.toString() },
        discounts: [],
        line_items: order.products.map((product) => {
            return {
                price_data: {
                    currency: 'egp',
                    product_data: {
                        name: product.productId.title
                    },
                    unit_amount: product.price * 100 // convert price to cents
                },
                quantity: product.quantity
            }
        }),
    };

    if (order.couponId) {

        const stripeCoupon = await createStripCoupon({ couponId: order.couponId });
        if (stripeCoupon.status) {
            return next(new ApiError(stripeCoupon.message, 400, stripeCoupon.message));
        }

        paymentObj.discounts.push({ coupon: stripeCoupon.id });
    }

    const session = await createCheckoutSession(paymentObj);
    return sendResponse(res, { session });
});
