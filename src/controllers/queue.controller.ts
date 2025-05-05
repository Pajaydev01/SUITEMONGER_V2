import * as mailer from 'nodemailer';
import Queue from "bull";
import cacher from '../services/cache.service';
import actionService from '../services/action.service';
import kyc from '../database/models/kyc.model';
import users, { userStatus } from '../database/models/users.model';
import notificationService from '../services/notification.service';
import socketIo from '../services/websocket.service';
import { json } from 'sequelize';
class QueueController {
    constructor() { }

    // Add your methods and logic here
    public static async ProcessEmailJob(job: Queue.Job, done: Queue.DoneCallback) {
        try {
            // const setup: mailer.Transporter<SMTPTransport.SentMessageInfo> = job.data.items.setup;
            const setup = mailer.createTransport(
                job.data.items.setup
            );
            await setup.sendMail({ ...job.data.items.info });
            //console.log('sender', send)
            await job.releaseLock()
            const finish = await job.isCompleted()
            console.log('email job done', finish)
            job.remove()
            done();
        } catch (error) {
            console.error('Error processing email job:', error);
            await job.releaseLock();
            job.remove()
            done();
        }
    }

    public static async RemoveJob(job:Queue.Job, done:Queue.DoneCallback){
        try {
            const itemDel = job.data.items;
            const deler = await cacher.deleteItem(itemDel.name);
            if (deler) {
                console.log('items removed from cache', itemDel.name)
                await job.releaseLock();
                job.remove()
                done();
                return;
            }
            else {
                console.log('error removing item', deler);
                await job.releaseLock();
                job.remove()
                done();
                return;
            }
        } catch (error) {
            console.error('Error processing email job:', error);
            await job.releaseLock();
            job.remove()
            done();   
        }
    }

    public static async DetectFaceJob(job: Queue.Job, done: Queue.DoneCallback) {
        try {
            const item= job.data.items;
            const checker = await actionService.DetectFaceMesh(item.photo);
            //do the checks and save to the database
            
            if (checker) {
                console.log('face detected', checker);
                if(checker.score<0.7){
                    const kc=await kyc.findOne({where:{id:item.kyc_id}});
                    const user=await users.findOne({where:{id:kc.dataValues.user_id}});
                    await kc.update({
                        facial_photo_status:'NO FACE DETECTED',
                        status:'REJECTED',
                        reason:'NO FACE DETECTED'
                    });
                    //send email to the user
                    await notificationService.sendMail(user.dataValues.email,'Face detection failed','mail',{name:user.dataValues.name,body:`Dear ${user.dataValues.first_name}, your facial photo was not detected, please try again`,email:user.dataValues.email});

                    await socketIo.SendMessage(JSON.stringify({type:'error',message:'Face not detected'}),user,'face_detection');
                }else{
                    const kc=await kyc.findOne({where:{id:item.kyc_id}});
                    const user=await users.findOne({where:{id:kc.dataValues.user_id}});
                    //update the kyc status to verified
                    await kc.update({
                        facial_photo_status:'FACE DETECTED',
                        status:'VERIFIED',
                        reason:'FACE DETECTED'
                    });
                    //update the user status to active
                    await user.update({
                        status:userStatus.USER_STATUS_ACTIVE
                    });
                    //send email to the user
                    await notificationService.sendMail(user.dataValues.email,'Face detection successful','mail',{name:user.dataValues.first_name,body:`Dear ${user.dataValues.first_name}, your facial photo was detected successfully`,email:user.dataValues.email});
                    await socketIo.SendMessage(JSON.stringify({type:'success',message:'FACE DETECTED'}),user,'face_detection');
                }
            } else {
                console.log('error detecting face', checker);
                const kc=await kyc.findOne({where:{id:item.kyc_id}});
                const user=await users.findOne({where:{id:kc.dataValues.user_id}});
                await kc.update({
                    facial_photo_status:'NO FACE DETECTED',
                    status:'REJECTED',
                    reason:'NO FACE DETECTED'
                });
                //send email to the user
                await notificationService.sendMail(user.dataValues.email,'Face detection failed','mail',{name:user.dataValues.name,body:`Dear ${user.dataValues.name}, your facial photo was not detected, please try again`,email:user.dataValues.email}); 
                await socketIo.SendMessage(JSON.stringify({type:'error',message:'No face detected'}),user,'face_detection');
            }
            await job.releaseLock();
            job.remove()
            done();
        } catch (error) {
            console.error('Error processing face detection:', error);
            await job.releaseLock();
            job.remove()
            done();
        }
    }
}
export default QueueController;