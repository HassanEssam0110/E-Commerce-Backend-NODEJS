import { Router } from "express";
import { multerHost, checkIsExist, checkIsNotExist } from "../../Middlewares/index.js";
import { extensions, Fields } from "../../Utils/index.js";
import { Category } from "../../../DB/Models/index.js";
import * as controller from "./category.controller.js";

const categoryRouter = Router();

categoryRouter.post('/create',
    multerHost({ allowedExtensions: extensions.Images }).single('image'),
    checkIsExist(Category, Fields.Name),
    controller.createCategory
)


categoryRouter.get('/get-category',
    controller.getCategory
)
categoryRouter.get('/',
    controller.getCategoryList
)

categoryRouter.put('/update/:_id',
    multerHost({ allowedExtensions: extensions.Images }).single('image'),
    checkIsNotExist(Category, [Fields._id]),
    checkIsExist(Category, Fields.Name),
    controller.updateCategory
)
categoryRouter.delete('/delete/:_id',
    checkIsNotExist(Category, [Fields._id]),
    controller.deleteCategory
)


export { categoryRouter };