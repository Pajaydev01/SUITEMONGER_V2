import { Request, Response } from "express";
import responseService from "../services/response.service";
import actionService from "../services/action.service";
import AuthService from "../services/Auth.service";
import organization, { organizationtatus } from '../database/models/organization.model';
import users, { userType } from "../database/models/users.model";
import organization_users, { organizationUserRoles } from "../database/models/organization_users.model";
import otps, { otpsType } from "../database/models/otps.model";
import notificationService from "../services/notification.service";

export default class Organization{
    public static CreateOrg=async(req:Request, res:Response)=>{
        try {
            const user=await AuthService.GetAuthUser()
            const body=actionService.getBody(req);
            if(user.dataValues.organization)return responseService.respond(res,{},412,false,'User already belongs to an organization, please create a new user to create an organization')
            //upload cac doc and utility bill
            const path='organization_documents';
            const [cac_doc,utility_bill]=await actionService.UploadMultipleImage([body.cac_document,body.utility_bill],user.dataValues.id,path);
            body['cac_document']=`${path}/${cac_doc}`
            body['utility_bill']=`${path}/${utility_bill}`
            body['user_id']=user.dataValues.id;
            const create = await organization.create(body);
            //convert the user to the part of the organization
            await user.update({
                belongs_to_org:true,
                organization_id:create.dataValues.id
            });
            const org_usr={
                user_id:user.dataValues.id,
                organization_id:create.dataValues.id,
                role:organizationUserRoles.ADMIN
            }
            await organization_users.create(org_usr);
            
            return responseService.respond(res,create,201,true,'Organization created and awaiting approval')
        } catch (error) {
             responseService.respond(res, error.data ? error.data : error, error.code && typeof error.code == 'number' ? error.code : 500, false, error.message ? error.message : 'Server error');
        }
    }

    public static ApproveRejectOrg=async (req:Request, res:Response)=>{
        try {
            const user=await AuthService.GetAuthUser();
            const body=actionService.getBody(req);
            const org=await organization.findOne({where:{id:body.organization_id}});
            if(!org)return responseService.respond(res,{},412,false,'Invalid organization');
            const items={
                status:body.approved_reject==organizationtatus.USER_STATUS_ACTIVE?organizationtatus.USER_STATUS_ACTIVE:organizationtatus.USER_STATUS_INACTIVE,
                approved_by:user.dataValues.id,
                approved_at:new Date()
            }
            items.status==organizationtatus.USER_STATUS_INACTIVE?items['reason']=body.reason:''
            const update=await org.update(items)
            return responseService.respond(res,update,200,true,'Organization updated successfully')
        } catch (error) {
            responseService.respond(res, error.data ? error.data : error, error.code && typeof error.code == 'number' ? error.code : 500, false, error.message ? error.message : 'Server error');  
        }
    }

    public static AddUsersToOrg=async (req:Request, res: Response)=>{
        try {
            const us=await AuthService.GetAuthUser();
            console.log(us)
            if(!us.dataValues.organization)return responseService.respond(res,{},412,false,'Action not permitted')
            const org_user=await organization_users.findOne({where:{organization_id:us.dataValues.organization.dataValues.id,role:organizationUserRoles.ADMIN}});
        if(!org_user) return responseService.respond(res,{},412,false,'User cannot create users')
            const body=await actionService.getBody(req);
            //salt and hash the password
            const pass=actionService.genToken(8)
            const password = await actionService.hasher(pass);
            body.password = password.hash;
            body.salt = password.salt;
            body.belongs_to_org=true;
            body.organization_id=us.dataValues.organization.dataValues.id;
            //create the user
            const user = await users.create(body);
            const org_usr={
                user_id:user.dataValues.id,
                organization_id:us.dataValues.organization.dataValues.id,
                role:body.organization_role
            }
            await organization_users.create(org_usr);
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
            await notificationService.sendMail(user.dataValues.email, 'Welcome to SuiteMonger', 'mail', { name: user.dataValues.first_name, body: `Dear ${user.dataValues.first_name}, welcome to SuiteMonger. Your account has been created successfully, use ${otp} to verify your account, your default password is: ${pass}`, email: user.dataValues.email });
            delete user.dataValues.password;
            delete user.dataValues.salt;
            return responseService.respond(res, user, 201, true, 'User created');
            
        } catch (error) {
            responseService.respond(res, error.data ? error.data : error, error.code && typeof error.code == 'number' ? error.code : 500, false, error.message ? error.message : 'Server error');   
        }
    }
}