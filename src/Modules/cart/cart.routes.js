import { Router } from "express";
import * as controller from './cart.controller.js';
import { auth } from "../../Middlewares/index.js";


const cartRouter = Router();

cartRouter.get('/', auth, controller.getCart);

cartRouter.post('/add/:productId', auth, controller.addToCart);

cartRouter.put('/remove/:productId', auth, controller.removeFromCart);

cartRouter.put('/update/:productId', auth, controller.updateCart);


export {
    cartRouter
}