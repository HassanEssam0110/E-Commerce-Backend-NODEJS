import { Router } from "express";

import { checkIsExist, checkIsNotExist, multerHost } from "../../Middlewares/index.js";
import { extensions, Fields } from "../../Utils/index.js";
import { SubCategory, Brand } from "../../../DB/Models/index.js";
import * as controller from "./brand.controller.js";

const brandRouter = Router();


brandRouter.post('/create',
    multerHost({ allowedExtensions: extensions.Images }).single('image'),
    checkIsNotExist(SubCategory, [Fields._id], Fields.Category),
    checkIsExist(Brand, Fields.Name),
    controller.createBrand
);

brandRouter.get('/get-brand',
    controller.getBrand
);

brandRouter.get('/',
    controller.getBrandList
);
brandRouter.get('/search',
    controller.searchBrands
);


brandRouter.put('/update/:_id',
    multerHost({ allowedExtensions: extensions.Images }).single('image'),
    checkIsNotExist(Brand, [Fields._id], Fields.Category_SubCategory),
    checkIsExist(Brand, Fields.Name),
    controller.updateBrand
);

brandRouter.delete('/delete/:_id',
    checkIsNotExist(Brand, [Fields._id], Fields.Category_SubCategory),
    controller.deleteBrand
);

export { brandRouter };