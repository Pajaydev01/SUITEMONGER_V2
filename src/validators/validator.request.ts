import { NextFunction, Request, Response } from 'express';
import * as validator from 'yup';
import responseService from '../services/response.service';
class validate {

    public static validateCreateUser = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const check = validator.object({
                email: validator.string().required(),
                password: validator.string().required(),
                first_name: validator.string().required(),
                last_name: validator.string().required(),
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
}

export default validate;