import { Router } from "express";
import * as controller from './address.controller.js';
import { auth, checkIsNotExist } from "../../Middlewares/index.js";
import { Address } from "../../../DB/Models/index.js";
import { Fields } from "../../Utils/index.js";

const addressRouter = Router();

addressRouter.get('/', auth, controller.getAddresses);

addressRouter.post('/add', auth, controller.addAddress);

addressRouter.put('/update/:_id', auth, checkIsNotExist(Address, [Fields._id]), controller.updateAddress);

addressRouter.patch('/delete/:_id', auth, checkIsNotExist(Address, [Fields._id]), controller.deleteAddress);


export { addressRouter };