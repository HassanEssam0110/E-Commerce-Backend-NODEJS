import { Router } from "express";

import { multerHost, checkIsNotExist, checkIsExist, auth } from "../../Middlewares/index.js";
import { extensions, Fields } from "../../Utils/index.js";
import { Category, SubCategory } from "../../../DB/Models/index.js";
import * as controller from "./subcategory.controller.js";

const subcategoryRouter = Router({ mergeParams: true });



subcategoryRouter.get('/get-sub-category',
    controller.getSubCategory
);

subcategoryRouter.get('/',
    controller.getSubCategoryList
);

subcategoryRouter.get('/get-with-brands',
    controller.getSubCategoryListWithBrands
);


subcategoryRouter.post('/create',
    auth,
    multerHost({ allowedExtensions: extensions.Images }).single('image'),
    checkIsNotExist(Category, [Fields._id]),
    checkIsExist(SubCategory, Fields.Name),
    controller.createSubCategory
);

subcategoryRouter.put('/update/:_id',
    multerHost({ allowedExtensions: extensions.Images }).single('image'),
    checkIsNotExist(SubCategory, [Fields._id], Fields.Category),
    checkIsExist(SubCategory, Fields.Name),
    controller.updateSubCategory
);

subcategoryRouter.delete('/delete/:_id',
    checkIsNotExist(SubCategory, [Fields._id], Fields.Category),
    controller.deleteSubCategory
)

export { subcategoryRouter };