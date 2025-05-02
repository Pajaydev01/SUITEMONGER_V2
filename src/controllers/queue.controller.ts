import * as mailer from 'nodemailer';
import Queue from "bull";
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
}
export default QueueController;