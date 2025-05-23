import express from "express";
const router = express.Router();

import validate from "../validators/validator.request";
import userController from "../controllers/user.controller";
import AuthService from "../services/Auth.service";
import Kyccontroller from "../controllers/kyc.controller";
import HouseController from "../controllers/house.controller";
import actionService from "../services/action.service";
import Organization from "../controllers/organization.controller";
////////////////authentication routes///////
router.post('/auth/signup', validate.validateCreateUser, userController.CreateUser);
router.post('/auth/verify', validate.validateVerifyEmail, userController.VerifyUser);
router.patch('/auth/verify', validate.validateVerifyResendEmail, userController.ResendOTP);
router.post('/auth/login', validate.validateLogin, userController.Login);
router.post('/auth/forgot', validate.validateVerifyResendEmail, userController.ForgotPassword);
router.post('/auth/reset', validate.validateResetPass, userController.ResetPassword);


///////////organization //////////
router.post('/org/create',validate.validateCreateOrg,AuthService.AuthSanctumLister,Organization.CreateOrg)
router.post('/org/users/create',validate.validateOrgCreateUser,AuthService.AuthSanctumLister,Organization.AddUsersToOrg)
/////kyc
router.post('/kyc/submit', AuthService.AuthSanctumGeneral, validate.validateSubmitKyc, Kyccontroller.SubmitKyc);
router.patch('/kyc/submit', AuthService.AuthSanctumGeneral, Kyccontroller.UpdateKyc);
router.get('/kyc', AuthService.AuthSanctumGeneral, Kyccontroller.GetKyc);


////roles
router.get('/roles', userController.GetUserRoles);

/////user router
router.get('/user', AuthService.AuthSanctumGeneral, userController.GetUser);
router.get('/listings', AuthService.AuthSanctum, HouseController.UserGetListings)

//init multer middleware for formdata/images
const upload = actionService.initMulterMiddleware()
router.post('/listing/create', upload.any(), AuthService.AuthSanctumLister, validate.validateCreateListing, HouseController.CreateListing);
router.get('/listing/fetch', AuthService.AuthSanctumLister, HouseController.ListerGetListings)


//////admin
router.post("/admin/kyc/approve", AuthService.AuthSanctumAdmin, validate.validateAdminApproveKyc, Kyccontroller.AdminApproveKyc);
router.post("/admin/org/approve",validate.validateAdminApproveOrganization,AuthService.AuthSanctumAdmin,Organization.ApproveRejectOrg)
router.post("/admin/house/approve",validate.validateAdminApproveListing,AuthService.AuthSanctumAdmin,HouseController.AdminApproveListing)
router.get("/admin/house",AuthService.AuthSanctumAdmin,HouseController.AdminGetAllListings)
export { router };

