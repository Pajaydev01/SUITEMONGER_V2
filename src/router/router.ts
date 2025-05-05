import express from "express";
const router = express.Router();

import validate from "../validators/validator.request";
import webhookController from "../controllers/webhook.controller";
import userController from "../controllers/user.controller";
import AuthService from "../services/Auth.service";
import Kyccontroller from "../controllers/kyc.controller";

////////////////authentication routes///////
router.post('/auth/signup', validate.validateCreateUser, userController.CreateUser);
router.post('/auth/verify',validate.validateVerifyEmail,userController.VerifyUser);
router.patch('/auth/verify',validate.validateVerifyResendEmail,userController.ResendOTP);
router.post('/auth/login',validate.validateLogin,userController.Login);
router.post('/auth/forgot',validate.validateVerifyResendEmail,userController.ForgotPassword);
router.post('/auth/reset',validate.validateResetPass,userController.ResetPassword);


/////kyc
router.post('/kyc/submit',AuthService.AuthSanctum,validate.validateSubmitKyc,Kyccontroller.SubmitKyc);
router.patch('/kyc/submit',AuthService.AuthSanctum,Kyccontroller.UpdateKyc);
router.get('/kyc',AuthService.AuthSanctum,Kyccontroller.GetKyc);

/////user router
router.get('/user',AuthService.AuthSanctum,userController.GetUser);
export { router };
