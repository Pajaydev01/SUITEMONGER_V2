import * as mailer from 'nodemailer';
import { config } from "../config/config";
import * as handlebar from "handlebars";
import * as fs from "fs";
import queueService from './queue.service';
import Mail from 'nodemailer/lib/mailer';
import SMTPPool from 'nodemailer/lib/smtp-pool';
interface replacement { }
export type templates = 'emailVerification' | 'notification' | 'mail'
class notifcation {
    public async sendMail(to: string | Array<string>, subject: string, template: templates, replacement: replacement, queue: boolean = true, attachment: string = null): Promise<{}> {
        return new Promise(async (resolve, reject) => {
            try {
                console.log('email receipient', to)
                const res = fs.readFileSync(`email_templates/${template}.html`, 'utf-8').toString();
                const templates = handlebar.compile(res);
                const html = templates(replacement);
                const setup:SMTPPool.Options= {
                    host: config.EMAIL_HOST,
                    port: parseInt(config.EMAIL_PORT),
                    //secure: true,
                    auth: {
                        user: config.EMAIL_USER,
                        pass: config.EMAIL_PASS
                    },
                    pool: true
                };
                const item:Mail.Options = {
                    from: {
                        name: config.EMAIL_NAME,
                        address: config.EMAIL_USER
                    },
                    to: to,
                    html: html,
                    subject: subject,
                }
                attachment ? item['attachments'] = [{ path: attachment }] : ''


                // const send=await setup.sendMail(item);
                //  console.log({ setup})
                if (!queue) {
                    const set = mailer.createTransport(
                        setup
                    )
                    const send = await set.sendMail({ ...item });
                    resolve(send)

                }
                else {
                    const send = await queueService.addQueue('email', { setup, info: item });

                    resolve(send);
                }
            } catch (error) {
                reject(error);
            }
        })
    }
}
export default new notifcation();