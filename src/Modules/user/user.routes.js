import { Router } from "express";

import * as controller from "./user.controller.js";
import { checkIsExist, auth } from "../../Middlewares/index.js";
import { User } from "../../../DB/Models/index.js";
import { Fields } from "../../Utils/enums.utils.js";


const userRouter = Router();

userRouter.post('/register', checkIsExist(User, Fields.Email), controller.register);

userRouter.post('/signin', controller.signin);

userRouter.get('/logged-user', auth, controller.getLoggedUser);

userRouter.put('/update', auth, controller.updateLoggedUserData);

userRouter.patch('/update-password', auth, controller.updatePassword);

userRouter.post('/verify-email', controller.verifyEmail);

userRouter.post('/resend-verify-code', controller.resendEmailVerifyCode);

userRouter.post('/forgot-password', controller.forgotPassword);

userRouter.post('/verify-password-reset-code', controller.verifyPassResetCode);

userRouter.post('/reset-password', controller.resetPassword);

export { userRouter };