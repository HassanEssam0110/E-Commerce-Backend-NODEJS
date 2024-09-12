import { Router } from "express";

import * as controller from "./order.controller.js";
import { auth } from "../../Middlewares/index.js";

const orderRouter = Router();

orderRouter.post('/create', auth, controller.creatOrder);

export { orderRouter }