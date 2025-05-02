import * as mailer from 'nodemailer';
import Queue from "bull";
import cacher from '../services/cache.service';
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
            done(error); // Call done with the error to indicate failure
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
            done(error);    
        }
    }
}
export default QueueController;