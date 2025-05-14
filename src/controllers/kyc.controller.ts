import { Request, Response } from "express";
import responseService from "../services/response.service";
import actionService from "../services/action.service";
import AuthService from "../services/Auth.service";
import queueService from "../services/queue.service";
import kyc, { kycStatus } from '../database/models/kyc.model';
import { userStatus } from "../database/models/users.model";

export default class Kyccontroller {
    public static SubmitKyc=async (req:Request, res: Response)=>{
        try {
            const body=actionService.getBody(req);
            const user=await AuthService.GetAuthUser();
            if(user.dataValues.status!=userStatus.USER_STATUS_PENDING) return responseService.respond(res,{},412,false,'User not active');
            const kc=user.dataValues.kyc;
            if(kc) return responseService.respond(res,{},412,false,'KYC already submitted');
            //upload proof of address and validate facial photo uplodaded
            const proof_of_address=await actionService.uploadFile('p_o_a',user.dataValues.id,body.proof_of_address);
            const facial_photo=await actionService.uploadFile('face_photo',user.dataValues.id,body.facial_photo);
            body.proof_of_address=`p_o_a/${proof_of_address.path}`
            body.facial_photo=`face_photo/${facial_photo.path}`
            body.status='PENDING';
            //create the kyc
            const create=await kyc.create({
                ...body,
                user_id:user.dataValues.id
            });
            //submit facial photo for verification to queue
            await queueService.addQueue('facedetection',{kyc_id:create.dataValues.id,photo:`face_photo/${facial_photo.path}`});
            return responseService.respond(res,{},201,true,'KYC submitted');
        } catch (error) {
            responseService.respond(res, error.data ? error.data : error, error.code && typeof error.code == 'number' ? error.code : 500, false, error.message ? error.message : 'Server error');
        }
    }

    public static UpdateKyc=async (req:Request, res: Response)=>{
        try {
            const body=actionService.getBody(req);
            const user=await AuthService.GetAuthUser();
            const kc=user.dataValues.kyc;
            if(!kc) return responseService.respond(res,{},412,false,'KYC not previously submitted');
            if(kc.dataValues.status!=kycStatus.KYC_STATUS_REJECTED) return responseService.respond(res,{},412,false,'Kyc can not be updated for this user');
            //upload proof of address and validate facial photo uplodaded
            if(body.proof_of_address){
                const proof_of_address=await actionService.uploadFile('p_o_a',user.dataValues.id,body.proof_of_address);
                body.proof_of_address=`p_o_a/${proof_of_address.path}`
            }
            if(body.facial_photo){
                const facial_photo=await actionService.uploadFile('face_photo',user.dataValues.id,body.facial_photo);
                await queueService.addQueue('facedetection',{kyc_id:kc.dataValues.id,photo:`face_photo/${facial_photo.path}`});
                body.facial_photo=`face_photo/${facial_photo.path}`
            }
            //update the kyc
            await kc.update({
                ...body,
                user_id:user.dataValues.id,
                status:kycStatus.KYC_STATUS_PENDING
            });
            return responseService.respond(res,{},201,true,'KYC updated');
        } catch (error) {
            responseService.respond(res, error.data ? error.data : error, error.code && typeof error.code == 'number' ? error.code : 500, false, error.message ? error.message : 'Server error');
        }
    }

    public static GetKyc=async (req:Request, res: Response)=>{
        try {
            const user=await AuthService.GetAuthUser();
            const kc=user.dataValues.kyc;
            if(!kc) return responseService.respond(res,{},412,false,'KYC not previously submitted');
            return responseService.respond(res,kc,200,true,'KYC retrieved');
        } catch (error) {
            responseService.respond(res, error.data ? error.data : error, error.code && typeof error.code == 'number' ? error.code : 500, false, error.message ? error.message : 'Server error');
        }
    }

    public static AdminApproveKyc=async (req:Request, res:Response)=>{
        try {
            const user=await AuthService.GetAuthUser()
            const body=actionService.getBody(req);
            const user_id=body.user_id
            //approve and update the user
            const ky=await kyc.findOne({where:{user_id}});
            if(!ky) return responseService.respond(res,{},412,false,"User does not have a valid kyc submitted");
            const items={status:body.approved_reject=="APPROVED"?kycStatus.KYC_STATUS_VERIFIED:kycStatus.KYC_STATUS_REJECTED, verified_at:new Date(), verified_by:user.dataValues.id}
            items.status==kycStatus.KYC_STATUS_REJECTED?items['reason']=body.reason:'';
            await ky.update(items)
            return responseService.respond(res,{},200,true,'User successfully approved')
        } catch (error) {
            responseService.respond(res, error.data ? error.data : error, error.code && typeof error.code == 'number' ? error.code : 500, false, error.message ? error.message : 'Server error');    
        }
    }
}