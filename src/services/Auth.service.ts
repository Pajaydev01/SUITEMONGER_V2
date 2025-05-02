import { Request, Response, NextFunction } from "express";
import responseService from "./response.service";
import users from "../database/models/users.model";
import * as jwt from 'jsonwebtoken';
import { config } from "../config/config";
import { resolve } from "path";
class authservice {
    private user: users = null;
    //authorization for sanctum key
    public AuthSanctum = async (req: Request, res: Response, next: NextFunction) => {
        try {
            //use the helper to talk to db and get the user details
            const token: any = req.headers['authorization'];
            //console.log('headers', req.headers)
            if (!token) return responseService.respond(res, {}, 401, false, 'unauthenticated');
            //trim away the bearer 
            const string = token.replace('Bearer ', '');
            const hash = string.replace(`${string.substring(0, string.indexOf('|'))}|`, '');
            //console.log('hash', hash)
            //decode the hash and get the userid
            const item = await this.decodeToken(hash);
            /// console.log('item', item)
            const user = await users.findOne({ where: { id: item.id } });
            if (!user) return responseService.respond(res, {}, 401, false, 'Invalid user')
            //console.log('user', user)
            this.user = user;
            next();
        } catch (error) {
            responseService.respond(res, error.data ? error.data : error, error.code && typeof error.code == 'number' ? error.code : 500, false, error.message ? error.message : 'Server error');
        }
    }

    public GetAuthUser = async (): Promise<users> => {
        return new Promise(async (resolve, reject) => {
            try {
                if (this.user == null) reject({ code: 412, message: 'invalid user' });
                resolve(this.user);
            } catch (error) {
                reject({ code: 412, message: 'invalid user' });
            }
        })

    }

    public generateUserToken = (user: users): Promise<string> => {
        return new Promise((resolve, reject) => {
            try {
                const duration = config.JWT_DURATION
                const item = {
                    id: user.dataValues.id
                }
                const token = jwt.sign(item, config.JWT_SECRET, {
                    expiresIn: duration  // Token will expire in 1 hour
                })
                resolve(token);
            } catch (error) {
                reject(error)
            }
        })
    }

    private decodeToken = (token: string): Promise<any> => {
        return new Promise((resolve, reject) => {
            try {
                const decode = jwt.verify(token, config.JWT_SECRET);
                resolve(decode)
            } catch (error) {
                reject(error)
            }
        })
    }
}

export default new authservice();