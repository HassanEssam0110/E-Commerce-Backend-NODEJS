import { Product } from "../../../DB/Models/index.js";

/**
 * Checks if a product has sufficient stock to fulfill an order.
 *
 * @param {ObjectId} productId - The ID of the product to check.
 * @param {Number} quantity - The quantity of the product to check for.
 * @return {Object|null} The product document if it has sufficient stock, otherwise null.
 */
export const checkProductStock = async (productId, quantity) => {
    return await Product.findOne({ _id: productId, stock: { $gte: quantity } })
}



/**
 * Calculates the total price of a cart given an array of product objects.
 *
 * @param {Array<Object>} products - An array of product objects with price and quantity properties.
 * @return {Number} The total price of the cart.
 */
export const calcCartTotal = (products) => {
    let subTotal = 0;
    products.forEach(p => { subTotal += p.price * p.quantity; });
    return subTotal;
}