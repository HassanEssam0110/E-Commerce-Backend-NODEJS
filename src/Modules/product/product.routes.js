import { Router } from "express";

import { checkIsExist, checkIsNotExist, multerHost } from "../../Middlewares/index.js";
import { extensions, Fields } from "../../Utils/index.js";
// import { SubCategory, Brand } from "../../../DB/Models/index.js";
import * as controller from "./product.controller.js";
import { Brand, Product } from "../../../DB/Models/index.js";

const productRouter = Router();

productRouter.get('/',
    controller.getProductList
)

productRouter.post('/create',
    multerHost({ allowedExtensions: extensions.Images }).array('image', 5),
    checkIsNotExist(Brand, [Fields._id, Fields.Category, Fields.SubCategory], Fields.Category_SubCategory),
    controller.createProduct)

productRouter.put('/update/:_id',
    multerHost({ allowedExtensions: extensions.Images }).array('image', 5),
    checkIsNotExist(Product, [Fields._id], Fields.Category_SubCategory),
    controller.updateProduct
);

export { productRouter };