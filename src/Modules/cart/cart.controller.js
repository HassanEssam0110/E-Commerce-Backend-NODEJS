import { catchError, } from './../../Middlewares/index.js';
import { Product, Cart } from '../../../DB/Models/index.js';
import { ApiError, sendResponse } from '../../Utils/index.js';
import { checkProductStock } from './cart.utils.js';



/**
 * @description   Add product to cart.
 * @route {POST} /api/v1/carts/add/:productId
 * @access Private
 */
export const addToCart = catchError(async (req, res, next) => {
    const { productId } = req.params;
    const { quantity } = req.body;
    const user = req.user;

    const product = await checkProductStock(productId, quantity);
    if (!product) return next(new ApiError('Product not available', 404, 'Product not available', 'addToCart controller.'));

    const cart = await Cart.findOne({ user: user._id });
    if (!cart) {
        const newCart = new Cart({
            user: user._id,
            products: [{ productId: product._id, quantity, price: product.appliedPrice }],
        });

        await newCart.save();
        return sendResponse(res, { message: 'product add to cart.', data: newCart }, 201);
    }

    const productIsExist = cart.products.find(product => product.productId.toString() === productId.toString());
    if (productIsExist) return next(new ApiError('Product already in cart.', 400, 'Product already in cart', 'addToCart controller.'));

    cart.products.push({ productId: product._id, quantity, price: product.appliedPrice });
    await cart.save();

    return sendResponse(res, { message: 'product add to cart.', data: cart });
});

/**
 * @description   remove product from cart.
 * @route {PUT} /api/v1/carts/remove/:productId
  * @access Private
 */
export const removeFromCart = catchError(async (req, res, next) => {
    const { productId } = req.params;
    const user = req.user;

    const cart = await Cart.findOne({ user: user._id, 'products.productId': productId });
    if (!cart) return next(new ApiError('Product not in cart.', 404, 'Product not in cart.', 'addToCart controller.'));

    cart.products = cart.products.filter(p => p.productId != productId);

    const updatedCart = await cart.save();
    return sendResponse(res, { data: updatedCart });
});

/**
 * @description   Update quantity of product in cart.
 * @route {GET} /api/v1/carts/update/:productId
 *  @access Private
 */
export const updateCart = catchError(async (req, res, next) => {
    const { productId } = req.params;
    const { quantity } = req.body;
    const user = req.user;

    const cart = await Cart.findOne({ user: user._id, 'products.productId': productId });
    if (!cart) return next(new ApiError('Product not in cart.', 404, 'Product not in cart.', 'updateCart controller.'));

    const product = await checkProductStock(productId, quantity);;
    if (!product) return next(new ApiError('Product not available', 404, 'Product not available', 'updateCart controller.'));

    const productIndex = cart.products.findIndex(p => p.productId.toString() === product._id.toString());
    cart.products[productIndex].quantity = quantity;

    const updatedCart = await cart.save();
    return sendResponse(res, { data: updatedCart });
});

/**
 * @description   Get logged user cart.
 * @route {GET} /api/v1/carts
 *  @access Private
 */
export const getCart = catchError(async (req, res, next) => {
    const user = req.user;
    const cart = await Cart.findOne({ user: user._id }).populate('products.productId');
    if (!cart) return next(new ApiError('Cart is empty.', 404, 'Cart is empty.'));
    return sendResponse(res, { count: cart.products.length, data: cart });
});