import { NextFunction, Request, Response } from 'express';
import * as validator from 'yup';
import responseService from '../services/response.service';
class validate {

    public static validateCreatePin = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const check = validator.object({
                pin: validator.string().required(),
                pin_confirmation: validator.string().required(),
                user_id: validator.string().required()
            });
            await check.validate(req.body);
            next();
        } catch (error) {
            responseService.respond(res, error.data ? error.data : error, error.code && typeof error.code == 'number' ? error.code : 500, false, error.message ? error.message : 'Server error');
        }
    }
}

export default validate;