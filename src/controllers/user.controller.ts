import { Request, Response } from "express";
import responseService from "../services/response.service";
import AuthService from "../services/Auth.service";
import actionService from "../services/action.service";

class userController {
    // public static revalidate = async (req: Request, res: Response) => {
    //     try {
    //         const body = actionService.getBody(req);
    //         const user = await users.findOne({ where: { id: body.id } });
    //         if (!user) return responseService.respond(res, {}, 412, false, 'Invalid user');
    //         if (user.dataValues.hasWalletPin == 0) {
    //             const otp = actionService.genOTP(4);
    //             //save in otps
    //             await otps.create({
    //                 user_id: user.dataValues.id,
    //                 otp,
    //                 type: 'wallet_pin'
    //             });
    //             console.log('otp', otp)
    //             //send an email
    //             await notificationService.sendMail(user.dataValues.email, 'Pin setup', 'mail', { name: user.dataValues.name, body: `Dear user, kindly use ${otp} to set-up your wallet pin`, email: user.dataValues.email });

    //         }
    //         return responseService.respond(res, { hasWalletPin: user.dataValues.hasWalletPin == 0 ? false : true, hasTransactionPin: user.dataValues.hasTransactionPin == 0 ? false : true }, 200, true, 'Request processed');
    //     } catch (error) {
    //         console.log('error here', error)
    //         //delete files here incase of errors
    //         responseService.respond(res, error.data ? error.data : error, error.code && typeof error.code == 'number' ? error.code : 500, false, error.message ? error.message : 'Server error');
    //     }
    // }

    // public static setWalletPin = async (req: Request, res: Response) => {
    //     try {
    //         const body = actionService.getBody(req);
    //         const checker = await otps.findOne({ where: { otp: body.otp, user_id: body.user_id } });
    //         if (!checker) return responseService.respond(res, {}, 412, false, 'Invalid otp');
    //         //check expiration
    //         const diff = actionService.getTimeDiff(checker.dataValues.updatedAt);
    //         if (diff > 10) return responseService.respond(res, {}, 412, false, 'Token expired, please refresh to generate new otp');
    //         const user = await users.findOne({ where: { id: body.user_id } });
    //         await user.update({ hasWalletPin: 1 });
    //         //save the pin to user pin
    //         const check = await user_pins.findOne({ where: { user_id: user.dataValues.id } });
    //         check !== null ? await check.update({ wallet_pin: body.pin }) : await user_pins.create({ user_id: body.user_id, wallet_pin: body.pin });
    //         //get the user token
    //         const token = await AuthService.generateUserToken(user)
    //         return responseService.respond(res, user, 201, true, 'User wallet pin created', token);
    //     } catch (error) {
    //         console.log('error here', error)
    //         //delete files here incase of errors
    //         responseService.respond(res, error.data ? error.data : error, error.code && typeof error.code == 'number' ? error.code : 500, false, error.message ? error.message : 'Server error');
    //     }
    // }

    // public static walletPinResetInitiate = async (req: Request, res: Response) => {
    //     try {
    //         const user = await AuthService.GetAuthUser();
    //         const code = actionService.genOTP(4);
    //         await otps.create({
    //             type: 'wallet_pin',
    //             otp: code,
    //             user_id: user.dataValues.id
    //         });
    //         //send email
    //         await notificationService.sendMail(user.dataValues.email, 'Wallet pin reset', 'mail', {
    //             name: user.dataValues.name,
    //             body: `Use ${code} as otp to change your wallet pin`
    //         });
    //         return responseService.respond(res, {}, 200, true, 'Otp sent')
    //     } catch (error) {

    //         console.log('error here', error)
    //         //delete fil    es here incase of errors
    //         responseService.respond(res, error.data ? error.data : error, error.code && typeof error.code == 'number' ? error.code : 500, false, error.message ? error.message : 'Server error');

    //     }
    // }

    // public static WalletPinReset = async (req: Request, res: Response) => {
    //     try {
    //         const body = actionService.getBody(req);
    //         const user = await AuthService.GetAuthUser()
    //         //get the otp
    //         const checker = await otps.findOne({ where: { otp: body.otp, user_id: user.dataValues.id } });
    //         if (!checker) return responseService.respond(res, {}, 412, false, 'Invalid otp');
    //         const diff = actionService.getTimeDiff(checker.dataValues.updatedAt);
    //         if (diff > 10) return responseService.respond(res, {}, 412, false, 'Token expired, please refresh to generate new otp');
    //         const check = await user_pins.findOne({ where: { user_id: user.dataValues.id } });
    //         check !== null ? await check.update({ wallet_pin: body.pin }) : await user_pins.create({ user_id: body.user_id, wallet_pin: body.pin });
    //         return responseService.respond(res, user, 201, true, 'User wallet pin changed');
    //     } catch (error) {
    //         console.log('error here', error)
    //         //delete fil    es here incase of errors
    //         responseService.respond(res, error.data ? error.data : error, error.code && typeof error.code == 'number' ? error.code : 500, false, error.message ? error.message : 'Server error');

    //     }
    // }
    // public static pinLogin = async (req: Request, res: Response) => {
    //     try {
    //         const body = actionService.getBody(req);
    //         const user = await users.findOne({ where: { id: body.user_id } });
    //         if (!user) return responseService.respond(res, {}, 412, false, 'Invalid user');
    //         const pin = await user_pins.findOne({ where: { user_id: body.user_id } });
    //         if (!pin) return responseService.respond(res, {}, 412, false, 'Invalid user')
    //         if (pin.dataValues.wallet_pin != body.pin) return responseService.respond(res, {}, 412, false, 'Invalid pin');
    //         //get the user token
    //         const token = await AuthService.generateUserToken(user)
    //         return responseService.respond(res, user, 200, true, 'User logged in', token);
    //     } catch (error) {
    //         console.log('error here', error)
    //         //delete fil    es here incase of errors
    //         responseService.respond(res, error.data ? error.data : error, error.code && typeof error.code == 'number' ? error.code : 500, false, error.message ? error.message : 'Server error');
    //     }
    // }

    // public static doTest = async (req: Request, res: Response) => {
    //     try {
    //         //create a sample premium company
    //         // await pcompany.create({
    //         //     company_id: '10',
    //         //     premium_id: '664db49d0475aaaf9efaf548',
    //         //     companyName: 'Hr56',
    //         //     accountNumber: '0070004250'
    //         // })
    //         // ///


    //         // ///update sample user
    //         // await users.update({ utility_bill: 'corporateKyc/TCgGqxNibr5HykLFlWBYNwOVdRfewJLQpsVBSBUL.png', introduction_letter: 'corporateKyc/TCgGqxNibr5HykLFlWBYNwOVdRfewJLQpsVBSBUL.png', signature: 'corporateKyc/TCgGqxNibr5HykLFlWBYNwOVdRfewJLQpsVBSBUL.png', government_id_card: 'corporateKyc/TCgGqxNibr5HykLFlWBYNwOVdRfewJLQpsVBSBUL.png', employee_id_card: 'corporateKyc/TCgGqxNibr5HykLFlWBYNwOVdRfewJLQpsVBSBUL.png' }, { where: { id: req.body.id } });

    //         await users.update({ bvn: '22437561890' }, { where: { id: req.body.id } })
    //         // await premiumWallet.create({
    //         //     premium_id: '10133',
    //         //     accountNumber: '0070005680',
    //         //     accountName: 'Hr56',
    //         //     user_id: req.body.id,
    //         //     balance: 458560,
    //         //     currency: 'NGN',
    //         //     bankName: 'Premium Trust'
    //         // })
    //         return responseService.respond(res, {}, 200, true, 'deleted')
    //     } catch (error) {

    //     }
    // }
}

export default userController;