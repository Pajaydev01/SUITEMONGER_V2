import * as redis from 'ioredis';
import { config } from '../config/config';
import queueService from './queue.service';
class cacher {
    private static connect = (): Promise<redis.Redis> => {
        return new Promise((resolve, reject) => {
            try {
                const con = new redis.Redis({
                    port: parseInt(config.REDIS_PORT),
                    host: config.REDIS_HOST,
                    maxRetriesPerRequest: 5
                });
                con.on('error', (err) => {
                    reject(err)
                })
                resolve(con);
            } catch (error) {
                console.log('error', error)
                reject(error)
            }
        })
    }

    //default duration is one day
    public static addItem = async (name: string, item: any, durationInSeconds: number = 86400): Promise<"OK" | boolean> => {
        return new Promise(async (resolve, reject) => {
            try {
                const save = (await this.connect()).set(name, JSON.stringify(item), 'EX', durationInSeconds);
                //queu to  be deleted
                const ms = durationInSeconds * 1000;
                const lineUp = await queueService.addQueue('removeItem', { name }, ms);
                resolve(save);
            } catch (error) {
                resolve(false)
                //reject(error)
            }
        })
    }


    public static getItem = async (name: string): Promise<any | boolean> => {
        return new Promise(async (resolve, reject) => {
            try {
                const item = await (await this.connect()).get(name);
                if (item) {
                    resolve(JSON.parse(item))
                }
                else {
                    resolve(false)
                }

            } catch (error) {
                resolve(false)
                //reject(error)
            }
        })
    }


    public static deleteItem = async (name: string): Promise<boolean> => {
        return new Promise(async (resolve, reject) => {
            try {
                const job = (await this.connect()).del(name);
                resolve(true);
            } catch (error) {
                reject(error)
            }
        })
    }

    public static flushDB = async (): Promise<boolean> => {
        return new Promise(async (resolve, reject) => {
            try {
                const deleter = (await this.connect()).flushall();
                const rem = (await this.connect()).flushdb();
                resolve(true)
            } catch (error) {
                reject(error)
            }
        })
    }
}
export default cacher;