import { Request, Response } from "express";
import responseService from "../services/response.service";
import AuthService from "../services/Auth.service";
import actionService from "../services/action.service";
import users, { userStatus } from "../database/models/users.model";
import notificationService from "../services/notification.service";
import otps, { otpsType } from "../database/models/otps.model";
import kyc from "../database/models/kyc.model";

class userController {
    public static CreateUser = async (req: Request, res: Response) => {
        try {
            const body = actionService.getBody(req);
            const checker = await users.findOne({ where: { email: body.email } });
            if (checker) return responseService.respond(res, {}, 412, false, 'User already exists');
            //salt and hash the password
            const password = await actionService.hasher(body.password);
            body.password = password.hash;
            body.salt = password.salt;
            //create the user
            const user = await users.create(body);
            //get the user token
            //const token=await AuthService.generateUserToken(user);
            const otp = actionService.genOTP(4);
            //save in otps  
            await otps.create({
                user_id: user.dataValues.id,
                otp,
                type: otpsType.OTP_TYPE_SIGNUP
            });
            //send email
            await notificationService.sendMail(user.dataValues.email, 'Welcome to SuiteMonger', 'mail', { name: user.dataValues.first_name, body: `Dear ${user.dataValues.name}, welcome to SuiteMonger. Your account has been created successfully, use ${otp} to verify your account`, email: user.dataValues.email });
            delete user.dataValues.password;
            delete user.dataValues.salt;
            return responseService.respond(res, user, 201, true, 'User created');
        } catch (error) {
            responseService.respond(res, error.data ? error.data : error, error.code && typeof error.code == 'number' ? error.code : 500, false, error.message ? error.message : 'Server error');
        }
    }

    public static Login = async (req: Request, res: Response) => {
        try {
            const body = actionService.getBody(req);
            const user = await users.scope('withPassword').findOne({ where: { email: body.email } });
            if (!user) return responseService.respond(res, {}, 401, false, 'Invalid email');
            //check password
            const check = await actionService.compare(user.dataValues.password, body.password, user.dataValues.salt);
            if (!check) return responseService.respond(res, {}, 401, false, 'Invalid email or password');
            //get the user token
            const token = await AuthService.generateUserToken(user);
            delete user.dataValues.password;
            delete user.dataValues.salt;
            return responseService.respond(res, { user }, 200, true, 'User logged in', token);
        } catch (error) {
            responseService.respond(res, error.data ? error.data : error, error.code && typeof error.code == 'number' ? error.code : 500, false, error.message ? error.message : 'Server error');
        }
    }


    public static GetUser = async (req: Request, res: Response) => {
        try {
            let user = await AuthService.GetAuthUser();
            user = await users.findOne({ where: { id: user.dataValues.id }, include: [{ model: kyc, as: 'kyc' }] });
            return responseService.respond(res, user, 200, true, 'User found');
        } catch (error) {
            responseService.respond(res, error.data ? error.data : error, error.code && typeof error.code == 'number' ? error.code : 500, false, error.message ? error.message : 'Server error');
        }
    }

    public static VerifyUser = async (req: Request, res: Response) => {
        try {
            const body = actionService.getBody(req);
            let user = await users.findOne({ where: { email: body.email } });
            if (!user) return responseService.respond(res, {}, 412, false, 'Invalid email')
            const checker = await otps.findOne({ where: { user_id: user.dataValues.id, otp: body.otp, type: otpsType.OTP_TYPE_SIGNUP } });
            if (!checker) return responseService.respond(res, {}, 401, false, 'Invalid OTP or email');
            //check time diff for expiry
            const timeDiff = actionService.getTimeDiff(checker.dataValues.createdAt);
            console.log('time diff', timeDiff);
            if (timeDiff > 10) return responseService.respond(res, {}, 401, false, 'OTP expired');
            await users.update({ status: userStatus.USER_STATUS_PENDING }, { where: { id: user.dataValues.id } });
            user = await users.findOne({ where: { id: user.dataValues.id } });
            await otps.destroy({ where: { user_id: user.dataValues.id } });
            return responseService.respond(res, user, 200, true, 'User verified');
        } catch (error) {
            responseService.respond(res, error.data ? error.data : error, error.code && typeof error.code == 'number' ? error.code : 500, false, error.message ? error.message : 'Server error');
        }
    }

    public static ResendOTP = async (req: Request, res: Response) => {
        try {
            const body = actionService.getBody(req);
            let user = await users.findOne({ where: { email: body.email } });
            if (!user) return responseService.respond(res, {}, 401, false, 'Invalid email');
            const otp = actionService.genOTP(4);
            await otps.create({
                user_id: user.dataValues.id,
                otp,
                type: body.type == 'password' ? otpsType.OTP_TYPE_FORGOT_PASS : otpsType.OTP_TYPE_SIGNUP
            });
            //send email
            await notificationService.sendMail(user.dataValues.email, body.type == 'password' ? 'Password reset' : 'Welcome to SuiteMonger', 'mail', { name: user.dataValues.first_name, body: body.type == 'password' ? `Dear ${user.dataValues.first_name},use ${otp} to reset your password` : `Dear ${user.dataValues.first_name}, welcome to SuiteMonger. Your account has been created successfully, use ${otp} to verify your account`, email: user.dataValues.email });
            return responseService.respond(res, user, 200, true, 'OTP resent');
        } catch (error) {
            responseService.respond(res, error.data ? error.data : error, error.code && typeof error.code == 'number' ? error.code : 500, false, error.message ? error.message : 'Server error');
        }
    }

    public static ForgotPassword = async (req: Request, res: Response) => {
        try {
            const body = actionService.getBody(req);
            let user = await users.findOne({ where: { email: body.email } });
            if (!user) return responseService.respond(res, {}, 401, false, 'Invalid email');
            const otp = actionService.genOTP(4);
            await otps.create({
                user_id: user.dataValues.id,
                otp,
                type: otpsType.OTP_TYPE_FORGOT_PASS
            });
            //send email
            await notificationService.sendMail(user.dataValues.email, 'Password reset', 'mail', { name: user.dataValues.name, body: `Dear ${user.dataValues.first_name}, Kindly use ${otp} to reset your account password`, email: user.dataValues.email });
            return responseService.respond(res, {}, 200, true, 'OTP sent');
        } catch (error) {
            responseService.respond(res, error.data ? error.data : error, error.code && typeof error.code == 'number' ? error.code : 500, false, error.message ? error.message : 'Server error');
        }
    }

    public static ResetPassword = async (req: Request, res: Response) => {
        try {
            const body = actionService.getBody(req);
            let user = await users.findOne({ where: { email: body.email } });
            if (!user) return responseService.respond(res, {}, 401, false, 'Invalid email');
            const checker = await otps.findOne({ where: { user_id: user.dataValues.id, otp: body.otp, type: otpsType.OTP_TYPE_FORGOT_PASS } });
            if (!checker) return responseService.respond(res, {}, 401, false, 'Invalid OTP or email');
            //check time diff for expiry
            const timeDiff = actionService.getTimeDiff(checker.dataValues.createdAt);

            if (timeDiff > 10) return responseService.respond(res, {}, 401, false, 'OTP expired');
            //salt and hash the password
            const password = await actionService.hasher(body.password);
            body.password = password.hash;
            body.salt = password.salt;
            await users.update({ password: body.password, salt: body.salt }, { where: { id: user.dataValues.id } });
            await otps.destroy({ where: { user_id: user.dataValues.id, type: 'FORGOT_PASS' } });
            return responseService.respond(res, {}, 200, true, 'Password reset');
        } catch (error) {
            responseService.respond(res, error.data ? error.data : error, error.code && typeof error.code == 'number' ? error.code : 500, false, error.message ? error.message : 'Server error');
        }
    }
}

export default userController;