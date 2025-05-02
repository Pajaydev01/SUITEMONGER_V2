///////queue job here ////////////////////
import { config } from "../config/config";
import Queue from "bull";
import cacher from "./cache.service";
import QueueController from "../controllers/queue.controller";
type jobType = 'save' | 'payroll' | 'removeItem' | 'retryFailed' | 'email';
class queue {
    private queueJob = (): Promise<Queue.Queue<any>> => {
        return new Promise((resolve, reject) => {
            const qeue = new Queue('transcriptionQueue', {
                redis: {
                    host: config.REDIS_HOST,
                    port: parseInt(config.REDIS_PORT),
                    maxRetriesPerRequest: 5
                }
            })
            qeue.on('error', (error) => {
                //   console.log('redis error', error)
                reject(error.message)
            });
            qeue.process(async (job, done) => {
                // console.log(job.remove)
                this.processJob(job, done)
            });
            resolve(qeue);
        })
    }


    public addQueue = async (type: jobType, items: any, delay: number = null): Promise<Queue.Job> => {
        //delay is in milleseconds
        return new Promise(async (resolve, reject) => {
            try {
                const item = { type, items }
                const add = delay == null ? await (await this.queueJob()).add(item) : await (await this.queueJob()).add(item, {
                    delay
                })
                resolve(add);
            } catch (error) {
                reject(error)
            }
        })
    };


    private processJob = async (job: Queue.Job, done: Queue.DoneCallback) => {
        //let slip: final_payslip[];
        try {
            ///console.log('items:', job.data)
            console.log('process job', job.data.type)
            const job_type: jobType = job.data.type;
            if (job_type) {
                switch (job_type) {
                    case 'removeItem':
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
                        break;
                    case 'email':
                        await QueueController.ProcessEmailJob(job, done)
                        break
                    default:
                        break;
                }
            }
        } catch (error) {
            await job.releaseLock();
            job.remove()
            done();
            //for failure set status back to failed
            //slip.forEach((res: final_payslip) => res.update({ status: 3 }));
            console.log('error here', error)
        }
    }
}
export default new queue();