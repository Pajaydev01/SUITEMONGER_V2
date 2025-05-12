import express from "express";
const router = express.Router();

import validate from "../validators/validator.request";
import webhookController from "../controllers/webhook.controller";
import userController from "../controllers/user.controller";
import AuthService from "../services/Auth.service";
import Kyccontroller from "../controllers/kyc.controller";
import kyc from "../database/models/kyc.model";
import HouseController from "../controllers/house.controller";
import multer from 'multer'
import { config } from "../config/config";
import actionService from "../services/action.service";
////////////////authentication routes///////
router.post('/auth/signup', validate.validateCreateUser, userController.CreateUser);
router.post('/auth/verify',validate.validateVerifyEmail,userController.VerifyUser);
router.patch('/auth/verify',validate.validateVerifyResendEmail,userController.ResendOTP);
router.post('/auth/login',validate.validateLogin,userController.Login);
router.post('/auth/forgot',validate.validateVerifyResendEmail,userController.ForgotPassword);
router.post('/auth/reset',validate.validateResetPass,userController.ResetPassword);


/////kyc
router.post('/kyc/submit',AuthService.AuthSanctumGeneral,validate.validateSubmitKyc,Kyccontroller.SubmitKyc);
router.patch('/kyc/submit',AuthService.AuthSanctumGeneral,Kyccontroller.UpdateKyc);
router.get('/kyc',AuthService.AuthSanctumGeneral,Kyccontroller.GetKyc);


////roles
router.get('/roles',userController.GetUserRoles);

/////user router
router.get('/user',AuthService.AuthSanctumGeneral,userController.GetUser);

const upload=actionService.initMulterMiddleware()
router.post('/listing/create', upload.any(), AuthService.AuthSanctumLister, validate.validateCreateListing, HouseController.CreateListing);


//////admin
router.post("/admin/kyc/approve",AuthService.AuthSanctumAdmin,validate.validateAdminApproveKyc,Kyccontroller.AdminApproveKyc);
export { router };
