import { Request, response, Response } from "express";
import responseService from "../services/response.service";
import actionService from "../services/action.service";
import AuthService from "../services/Auth.service";
import { kycStatus } from "../database/models/kyc.model";
import { config } from "../config/config";
import house from "../database/models/house.model";
import kyc from '../database/models/kyc.model';
import subHouse from "../database/models/sub_house.model";

export default class HouseController{
public static CreateListing=async  (req:Request, res:Response)=>{
    try {
        const body=actionService.formDataToObject(req.body);
        const files=actionService.formDataToObject(req.files);
        const user=await AuthService.GetAuthUser();
        const kyc=user.dataValues.kyc.dataValues;
        if(!kyc || kyc.status!=kycStatus.KYC_STATUS_VERIFIED)return responseService.respond(res,{},412,false,'User not verified to list appartment');


        const pictures = files
            .filter((res: { path: string; fieldname: string }) => res.fieldname === "pictures")
            .map((res: { path: string }) => res.path);
        const video=files
        .filter((res: { path: string; fieldname: string }) => res.fieldname === "short_video")
        .map((res: { path: string }) => res.path)[0];
        body.pictures=pictures
        body['short_video']=video
        body['user_id']=user.dataValues.id
        const create=await house.create(body);
        const sub_house=body.sub_house;
        for (let index = 0; index < sub_house.length; index++) {
            const element = sub_house[index];
            const test=`sub_house[${index}]pictures`
            const pictures = files
            .filter((res: { path: string; fieldname: string }) => res.fieldname === `sub_house[${index}][pictures]`)
            .map((res: { path: string }) => res.path);
        const video=files
        .filter((res: { path: string; fieldname: string }) => res.fieldname ===`sub_house[${index}][short_video]`)
        .map((res: { path: string }) => res.path)[0];
        element['pictures']=pictures;
        element['short_video']=video;
        element['house_id']=create.dataValues.id
        element['user_id']=user.dataValues.id
        const createor=await subHouse.create(element)
        }
         
        ///save the children
        return responseService.respond(res,body,201,true,'listing successfully added');
    } catch (error) {
     responseService.respond(res, error.data ? error.data : error, error.code && typeof error.code == 'number' ? error.code : 500, false, error.message ? error.message : 'Server error');
                
    }
}
}