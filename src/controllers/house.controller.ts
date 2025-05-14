import { Request, response, Response } from "express";
import responseService from "../services/response.service";
import actionService from "../services/action.service";
import AuthService from "../services/Auth.service";
import { kycStatus } from "../database/models/kyc.model";
import house from "../database/models/house.model";
import subHouse from "../database/models/sub_house.model";
import socketIo from "../services/websocket.service";
import organization, { organizationtatus } from "../database/models/organization.model";
import users from "../database/models/users.model";
import organization_users, { organizationUserRoles } from "../database/models/organization_users.model";
import { Op } from "sequelize";

export default class HouseController {
    public static CreateListing = async (req: Request, res: Response) => {
        try {
            const body = actionService.formDataToObject(req.body);
            const files = actionService.formDataToObject(req.files);
            const user = await AuthService.GetAuthUser();
            let kyc = user.dataValues.kyc
            let org=user.dataValues.organization
            if (!kyc) return responseService.respond(res, {}, 412, false, 'User not verified to list appartment');
            kyc=kyc.dataValues;
            if (kyc.status != kycStatus.KYC_STATUS_VERIFIED) return responseService.respond(res, {}, 412, false, 'User not verified to list appartment');

            if(org){
                if(org.dataValues.status!=organizationtatus.USER_STATUS_ACTIVE) return responseService.respond(res,{},412,false,'The organization is not valid or approved yet to list a product')
                const org_user=await organization_users.findOne({where:{organization_id:org.dataValues.id}})
            if(!org_user)return responseService.respond(res,{},412,false,'User cannot create listing for organization')
            if(org_user.dataValues.role!=organizationUserRoles.ADMIN)return responseService.respond(res,{},412,false,'User cannot create listing for organization')
            //attach org id
            body['organization_id']=org.dataValues.id
            }


            const pictures = files
                .filter((res: { path: string; fieldname: string }) => res.fieldname === "pictures")
                .map((res: { path: string }) => res.path);
            const video = files
                .filter((res: { path: string; fieldname: string }) => res.fieldname === "short_video")
                .map((res: { path: string }) => res.path)[0];
            body.pictures = pictures
            body['short_video'] = video
            body['user_id'] = user.dataValues.id
 
            ///
            body.has_children = body.has_children === 'true';
            if(body.has_children && !body.sub_house)return responseService.respond(res,{},412,false,'If listing has children, ensure to pass the sub houses under or pass false to the has_children value')
            
            const create = await house.create(body);
            const sub_house = body.sub_house;
            if(body.has_children || sub_house){
            for (let index = 0; index < sub_house.length; index++) {
                const element = sub_house[index];
                const pictures = files
                    .filter((res: { path: string; fieldname: string }) => res.fieldname === `sub_house[${index}][pictures]`)
                    .map((res: { path: string }) => res.path);
                const video = files
                    .filter((res: { path: string; fieldname: string }) => res.fieldname === `sub_house[${index}][short_video]`)
                    .map((res: { path: string }) => res.path)[0];
                element['pictures'] = pictures;
                element['short_video'] = video;
                element['house_id'] = create.dataValues.id
                element['user_id'] = user.dataValues.id
                await subHouse.create(element)
            }
        }

            ///send socket to all connected users
            const houses = await house.findAll({ include: [{ model: subHouse, as: 'sub_house' },{model:organization,as:'organization'},{model:users,as:'creator'}] });
            await socketIo.SendMessage(houses, null, 'message')
            return responseService.respond(res, body, 201, true, 'listing successfully added');
        } catch (error) {
            responseService.respond(res, error.data ? error.data : error, error.code && typeof error.code == 'number' ? error.code : 500, false, error.message ? error.message : 'Server error');

        }
    }


    public static UserGetListings = async (req: Request, res: Response) => {
        try {
            const houses = await house.findAll({ include: [{ model: subHouse, as: 'sub_house' },{model:organization,as:'organization'},{model:users,as:'creator'}] });
            return responseService.respond(res, houses, 200, true, 'Listing fetched')
        } catch (error) {
            responseService.respond(res, error.data ? error.data : error, error.code && typeof error.code == 'number' ? error.code : 500, false, error.message ? error.message : 'Server error');
        }
    }


    public static ListerGetListings = async (req: Request, res: Response) => {
        try {
            const user = await AuthService.GetAuthUser()
            const whereClause=user.dataValues.belongs_to_org?{
                [Op.or]: [
                    { user_id: user.dataValues.id },
                    { organization_id: user.dataValues.organization_id }
                  ]
            }:{ user_id: user.dataValues.id };
            const houses = await house.findAll({
            where: whereClause,
            include: [{ model: subHouse, as: 'sub_house' },{model:organization,as:'organization'},{model:users,as:'creator'}]
        });
        const uniqueHouses = Array.from(
            new Map(houses.map(h => [h.dataValues.id, h])).values()
          );
            return responseService.respond(res, uniqueHouses, 200, true, 'Listing fetched')
        } catch (error) {
            responseService.respond(res, error.data ? error.data : error, error.code && typeof error.code == 'number' ? error.code : 500, false, error.message ? error.message : 'Server error');
        }
    }
}