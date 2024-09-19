import { Router } from "express";

import * as controller from "./order.controller.js";
import { auth } from "../../Middlewares/index.js";

const orderRouter = Router();

orderRouter.post('/create', auth, controller.creatOrder);
orderRouter.put('/cancel/:orderId', auth, controller.cancelOrder);
orderRouter.put('/delivered/:orderId', auth, controller.deliverdOrder);
orderRouter.get('/', auth, controller.listOrders);
orderRouter.post('/stripePay/:orderId', auth, controller.paymentWithStripe);

export { orderRouter }