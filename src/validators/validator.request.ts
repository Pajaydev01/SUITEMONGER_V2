import { NextFunction, Request, Response } from 'express';
import * as validator from 'yup';
import responseService from '../services/response.service';
import { userType } from '../database/models/users.model';
import FormData from 'form-data';
import actionService from '../services/action.service';
import { organizationUserRoles } from '../database/models/organization_users.model';
class validate {

    public static validateCreateUser = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userTyp = [userType.USER_TYPE_ADMIN,userType.USER_TYPE_EMPLOYEE,userType.USER_TYPE_USER,userType.USER_TYPE_VISITOR,userType.USER_TYPE_LISTER]; // Define the allowed user types
            const check = validator.object({
                email: validator.string().required(),
                password: validator.string().required(),
                first_name: validator.string().required(),
                last_name: validator.string().required(),
                role: validator.string().oneOf(userTyp).required() // Ensure role is one of the allowed types
            });
            await check.validate(req.body);
            next();
        } catch (error) {
            responseService.respond(res, error.data ? error.data : error, error.code && typeof error.code == 'number' ? error.code : 500, false, error.message ? error.message : 'Server error');
        }
    }

    public static validateOrgCreateUser = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userTyp = [userType.USER_TYPE_ADMIN,userType.USER_TYPE_EMPLOYEE,userType.USER_TYPE_USER,userType.USER_TYPE_VISITOR,userType.USER_TYPE_LISTER]; // Define the allowed user types
            const orgroleType=[organizationUserRoles.ADMIN,organizationUserRoles.AUTHORIZER,organizationUserRoles.VIEWER]
            const check = validator.object({
                email: validator.string().required(),
                first_name: validator.string().required(),
                last_name: validator.string().required(),
                role: validator.string().oneOf(userTyp).required(),
                organization_role:validator.string().oneOf(orgroleType).required(),
            });
            await check.validate(req.body);
            next();
        } catch (error) {
            responseService.respond(res, error.data ? error.data : error, error.code && typeof error.code == 'number' ? error.code : 500, false, error.message ? error.message : 'Server error');
        }
    }

    public static validateVerifyEmail= async (req: Request, res: Response, next: NextFunction) => {
        try {
            const check = validator.object({
                email: validator.string().required(),
                otp: validator.string().required()
            });
            await check.validate(req.body);
            next();
        } catch (error) {
            responseService.respond(res, error.data ? error.data : error, error.code && typeof error.code == 'number' ? error.code : 500, false, error.message ? error.message : 'Server error');
        }
    }

    public static validateVerifyResendEmail= async (req: Request, res: Response, next: NextFunction) => {
        try {
            const check = validator.object({
                email: validator.string().required()
            });
            await check.validate(req.body);
            next();
        } catch (error) {
            responseService.respond(res, error.data ? error.data : error, error.code && typeof error.code == 'number' ? error.code : 500, false, error.message ? error.message : 'Server error');
        }
    }

    public static validateLogin= async (req: Request, res: Response, next: NextFunction) => {
        try {
            const check = validator.object({
                email: validator.string().required(),
                password: validator.string().required()
            });
            await check.validate(req.body);
            next();
        } catch (error) {
            responseService.respond(res, error.data ? error.data : error, error.code && typeof error.code == 'number' ? error.code : 500, false, error.message ? error.message : 'Server error');
        }
    }

    public static validateResetPass= async (req: Request, res: Response, next: NextFunction) => {
        try {
            const check = validator.object({
                email: validator.string().required(),
                password: validator.string().required(),
            });
            await check.validate(req.body);
            next();
        } catch (error) {
            responseService.respond(res, error.data ? error.data : error, error.code && typeof error.code == 'number' ? error.code : 500, false, error.message ? error.message : 'Server error');
        }
    }

    public static validateSubmitKyc= async (req: Request, res: Response, next: NextFunction) => {
        try {
            const check = validator.object({
                address: validator.string().required(),
                country: validator.string().required(),
                state: validator.string().required(),
                proof_of_address: validator.string().required(),
                id_type: validator.string().required(),
                id_number: validator.string().required(),
                facial_photo: validator.string().required(),
                
            });
            await check.validate(req.body);
            next();
        } catch (error) {
            responseService.respond(res, error.data ? error.data : error, error.code && typeof error.code == 'number' ? error.code : 500, false, error.message ? error.message : 'Server error');
        }
    }

    public static validateCreateOrg= async (req: Request, res: Response, next: NextFunction) => {
        try {
            const check = validator.object({
                director: validator.string().required(),
                cac_document: validator.string().required(),
                name: validator.string().required(),
                address: validator.string().required(),
                business_type: validator.string().required(),
                utility_bill: validator.string().required(),
                
            });
            await check.validate(req.body);
            next();
        } catch (error) {
            responseService.respond(res, error.data ? error.data : error, error.code && typeof error.code == 'number' ? error.code : 500, false, error.message ? error.message : 'Server error');
        }
    }

    public static validateAdminApproveKyc= async (req: Request, res: Response, next: NextFunction) => {
        try {
            const approveType=['APPROVED','REJECTED']
            const check = validator.object({
                user_id: validator.string().required(),
                approved_reject: validator.string().oneOf(approveType).required(),
                reason: validator.string().when('approved_reject', {
                    is:(approved_reject:string)=>{approved_reject=='REJECTED'},
                    then: ()=>validator.string().required(),
                    otherwise: ()=>validator.string().notRequired(),
                    
                }),
            });
            await check.validate(req.body);
            next();
        } catch (error) {
            console.log('error here',error)
            responseService.respond(res, error.data ? error.data : error, error.code && typeof error.code == 'number' ? error.code : 500, false, error.message ? error.message : 'Server error');
        }
    }

    public static validateAdminApproveOrganization= async (req: Request, res: Response, next: NextFunction) => {
        try {
            const approveType=['APPROVED','REJECTED']
            const check = validator.object({
                organization_id: validator.string().required(),
                approved_reject: validator.string().oneOf(approveType).required(),
                reason: validator.string().when('approved_reject', {
                    is:(approved_reject:string)=>{approved_reject=='REJECTED'},
                    then: ()=>validator.string().required(),
                    otherwise: ()=>validator.string().notRequired(),
                    
                }),
            });
            await check.validate(req.body);
            next();
        } catch (error) {
            console.log('error here',error)
            responseService.respond(res, error.data ? error.data : error, error.code && typeof error.code == 'number' ? error.code : 500, false, error.message ? error.message : 'Server error');
        }
    }

    public static validateCreateListing= async (req: Request, res: Response, next: NextFunction) => {
        try {
           //req.body=actionService.formDataToObject(req.body)
            const check = validator.object({
                long: validator.number().required(),
                lat: validator.number().required(),
                address: validator.string().required(),
                name: validator.string().required(),
                details: validator.string().required(),
                //short_video: validator.string().required(),
               // pictures: validator.array().required(),
                has_children: validator.boolean().required(),
                price: validator.number().nullable(),
                space_available: validator.number().nullable(),
                rules: validator.array().of(validator.string()).nullable(),
                amenities: validator.array().of(validator.string()).nullable(),
                
            });
            await check.validate(actionService.formDataToObject(req.body));
            next();
        } catch (error) {
            responseService.respond(res, error.data ? error.data : error, error.code && typeof error.code == 'number' ? error.code : 500, false, error.message ? error.message : 'Server error');
        }
    }
}

export default validate;