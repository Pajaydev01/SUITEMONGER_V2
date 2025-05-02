import express from "express";
const router = express.Router();

import validate from "../validators/validator.request";
import webhookController from "../controllers/webhook.controller";
import userController from "../controllers/user.controller";
import AuthService from "../services/Auth.service";

////////////////authentication routes///////
router.post('/auth/signup', validate.validateCreateUser, userController.CreateUser);
router.post('/auth/verify',validate.validateVerifyEmail,userController.VerifyUser);
router.patch('/auth/verify',validate.validateVerifyResendEmail,userController.ResendOTP);
router.post('/auth/login',validate.validateLogin,userController.Login);

/////user router
router.get('/user',AuthService.AuthSanctum,userController.GetUser);
export { router };
