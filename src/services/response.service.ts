import { Request, Response, NextFunction } from "express";
import {  DatabaseError } from 'sequelize';
import { ValidationError } from "yup";
interface data {
}

class handle extends Error {
    public respond = (response: any, data: data, code: number, success: boolean, message: string, token: string = null) => {
        //console.log(data instanceof ValidationError)
        //check if the error is a db error
        if (data instanceof DatabaseError) {
            const resp=this.handleDbErrors(data as DatabaseError)
            return response.status(resp.code).json(resp);
        }
        else if(data instanceof ValidationError){
            const resp=this.handleValidationErrors(data)
            return response.status(resp.code).json(resp);
        }
        const resp = token ? {
            success: success,
            message,
            data,
            token
        } : {
            success: success,
            message,
            data
        }
        return response.status(code).json(resp);
    };


    private handleDbErrors=(error: DatabaseError)=>{
        console.log("db error here",error)
        let response;
        switch (error.name){
            case 'SequelizeUniqueConstraintError':
                response={
                    message:`An error occurred: ${error.parent?error.parent.message:''}`,
                    data:null,
                    code:412,
                    success:false
                }
            break;
            default:
                response={
                    message:`A db error has occured, please try again later`,
                    data:null,
                    code:412,
                    success:false
                }
                break;
        }
        return response
    }

    private handleValidationErrors=(error:ValidationError)=>{
    const errors = error.errors.map(err => err).join(', ');
    return {
        message: `Validation error(s): ${errors}`,
        data: null,
        code: 400,
        success: false
    };
    }

    public premiumcreditresponse = (response: any, data: data, code: number, success: boolean, message: string,) => {
        const resp = {
            status: success,
            message,
            data,
            code
        };
        return response.status(code).json(resp);
    };

}

export default new handle();