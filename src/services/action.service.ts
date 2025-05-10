import * as crypto from 'crypto';
import { config } from "../config/config.js";
import * as fs from 'fs';
import mime from 'mime-db';
import { Request } from 'express';
import path from 'path';
import moment from 'moment';
import { exec } from 'child_process';
import axios, { AxiosError } from 'axios';
import FormData from 'form-data';
import { Worker } from 'worker_threads'
import * as faceapi from 'face-api.js';
class action {
    public items: any = {
        connections: []
    };
    async hasher(password: string): Promise<{
        hash: string,
        salt: string
    }> {
        return new Promise(async (resolve, reject) => {
            const salt = crypto.randomBytes(16).toString('hex');
            const hash = crypto.pbkdf2Sync(password, salt,
                1000, 64, `sha512`).toString(`hex`);
            resolve({ hash: hash, salt: salt });
        })
    }

    public async compare(hash: string, password: string, salt: BinaryType): Promise<boolean> {
        const hashed = crypto.pbkdf2Sync(password,
            salt, 1000, 64, `sha512`).toString(`hex`);
        return hash === hashed;
    }

    public async makeRequest(url: string, method: 'POST' | 'GET' | 'PUT' | 'PATCH', data = {}, header: {}, return_type: 'json' | 'buffer' = 'json'): Promise<any> {
        return new Promise(async (resolve, reject) => {
            try {
                const param = {
                    method: method,
                    headers: header
                };
                // console.log('headers', param.headers)
                method != 'GET' ? param['body'] = JSON.stringify(data) : '';
                const { default: fetch } = await import('node-fetch');
                const fetcher = await fetch(url, param);
                //console.log('error here', fetcher)
                if (fetcher.status == 500) { reject({ message: 'Unable to make request' }); return }
                const item = return_type == 'json' ? await fetcher.json() : await fetcher.arrayBuffer()
                resolve(item);
            } catch (error) {
                reject(error)
            }
        });
    }

    public requestAdvanced = async (url: string, method: 'POST' | 'GET' | 'PUT' | 'PATCH', data = {}, header: {}, form: boolean = false) => {
        return new Promise(async (resolve, reject) => {
            try {
                const dat = new FormData()
                if (form) {
                    for (const key in data) {
                        if (Object.prototype.hasOwnProperty.call(data, key)) {
                            const element = data[key];
                            if (typeof element != 'string') {
                                dat.append(key, element.stream, {
                                    filename: element.name,
                                    contentType: element.contentType
                                })
                            }
                            else {
                                dat.append(key, element)
                            }
                        }
                    };
                }
                const payload = {
                    url: url,
                    method: method,
                    data: form ? dat : JSON.stringify(data),
                    headers: header
                };
                form ? delete payload.headers['Content-Type'] : '';
                //console.log('headers', payload.headers)
                //const req = await axios.request(payload);
                import('node-fetch').then(async ({ default: fetch }) => {
                    const req = await fetch(payload.url, { body: payload.data, method: method, headers: payload.headers });
                    resolve(req.json());
                })
                // resolve(req.data)
            } catch (error: AxiosError | any) {
                reject(error)
            }
        })
    }

    public async uploadFile(paths: string, user: string, file: string, reduce: boolean = false): Promise<{
        path: string,
        size: number
    }> {
        const decodeBase64 = (dataString: string): Promise<any> => {
            return new Promise((resolve, reject) => {
                let fail = false;
                let matches = dataString.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/),
                    response: any = {};
                if (matches == null) matches = dataString.match(/data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+).*,.*/), fail = true;


                // if (matches.length !== 3) {
                //     reject(new Error('Invalid input string'))
                // }

                // response.type = matches[1];
                // response.data = new Buffer(matches[2], 'base64');

                // resolve(response);
                // const matches2 = dataString.match(/data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+).*,.*/),
                //     response2: any = {};
                // console.log('match: ',dataString.replace(/^data:([A-Za-z-+/]+);base64,/, ''))
                // if (!matches.length) {
                //     reject(new Error('Invalid input string'))
                // }

                response.type = matches[1];
                response.data = !fail ? new Buffer(matches[2], 'base64') : Buffer.from(dataString.replace(/data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,/, ''), 'base64');
                resolve(response);
            })
        }
        return new Promise(async (resolve, reject) => {
            try {
                let decodedImg = await decodeBase64(file);
                //console.log('buffer', decodedImg.data)
                let imageBuffer = decodedImg.data;
                let type = decodedImg.type;
                let extension = mime[type];
                const date = new Date().getTime();
                let fileName = date + user + "upload." + extension.extensions[0];
                const folderPath = path.join(__dirname, '../../public');
                const folderPath2 = path.join(__dirname, `../../public/${paths}`);
                if (!fs.existsSync(folderPath)) {
                    fs.mkdirSync(folderPath);
                    fs.mkdirSync(folderPath2);
                }
                else if (!fs.existsSync(folderPath2)) {
                    fs.mkdirSync(folderPath2);
                }
                const write = fs.writeFileSync('public/' + paths + "/" + fileName, imageBuffer, 'utf8');
                resolve({
                    path: fileName,
                    size: Number((decodedImg.data.length / 1e+6).toFixed(2))
                });
            }
            catch (err) {
                reject(err)
            }
        })
    }

    public async deleteFile(path: string) {
        return new Promise<string>((resolve, reject) => {
            fs.unlinkSync(path)
            resolve('done');
        })
    }

    public loop = async (file: Array<string>, user: string, path: string, url: string): Promise<Array<string>> => {
        return new Promise((resolve, reject) => {
            const data = [];
            file.forEach(async (res, index) => {
                const process = await this.uploadFile(path, user, res);
                const image = url + '/' + path + process;
                data.push(image);
            });
            resolve(data);
        })
    }

    public getTimeDiff(timestamp: string, timestamp2: string = null, inDays: boolean = null): number {
        moment.suppressDeprecationWarnings = true;

        // const now = moment(new Date());
        // const diff = now.diff(moment(timestamp), 'minutes')
        // console.log('moment js diff', diff)
        const time1 = moment(timestamp);
        //  console.log('time1', time1)
        const time2 = timestamp2 == null ? moment(new Date) : moment(timestamp2)

        //  console.log('time2', time2.getUTCDate())
        // let calc = (time2 - time1.getTime()) / 1000;
        // calc /= (60 * 60);
        // return inDays ? (Math.round(calc) / 24) : Math.round(calc);
        return inDays ? time2.diff(time1, 'days') : time2.diff(time1, 'minutes');
    }

    public getBody = (req: Request) => {
        let body;
        if (req.body.constructor === Object && Object.keys(req.body).length === 0) {
            if (req.query.constructor === Object && Object.keys(req.query).length === 0) {
                body = {}
            }
            else {
                body = req.query
            }
        }
        else {
            body = req.body;
        }
        return body;
    }

    public async createFile(name: string, type: 'mp3' | 'json' | 'mp4' | 'jpg', content: string): Promise<boolean> {
        return new Promise((resolve, reject) => {
            try {
                const transcription_folder = '';
                //check and create folder if it doesn't exist
                const folderPath = path.join(__dirname, '../../public');
                const folderPath2 = path.join(__dirname, `../../public/${transcription_folder}`);
                if (!fs.existsSync(folderPath)) {
                    fs.mkdirSync(folderPath);
                    fs.mkdirSync(folderPath2);
                    // console.log(`Folder "${folderPath}" created.`);
                }
                else if (!fs.existsSync(folderPath2)) {
                    fs.mkdirSync(folderPath2);
                }

                const write = fs.writeFileSync(`public/${transcription_folder}/${name}.${type}`, content, 'utf-8');
                resolve(true)
            } catch (error) {
                reject(error)
            }
        })
    }
    public async readFile(file: string, tobase64: boolean = false): Promise<string | Buffer> {
        return new Promise((resolve, reject) => {
            try {
                const read = fs.readFileSync(`${file}`)
                const resp = tobase64 ? Buffer.from(read).toString('base64') : read;
                resolve(resp);
            } catch (error) {
                reject(error)
            }
        })
    }

    public genToken = (length: number = 10): string => {
        return [...Array(length)]
            .map((e) => ((Math.random() * 36) | 0).toString(36))
            .join('');
    }

    public genOTP = (no: number): string => {
        return Math.random().toFixed(no).split('.')[1];
    }
    public saveConnection = async (con: any) => {
        //console.log('new connection',con)
        // await helper.insert('socketConnections',{connection:con})
        console.log('total cons', this.items.connections.length)
        this.items.connections.push(con)
    }

    public createBuffer = async (paths: string, internal: boolean = false, names: string = '', type: string = ''): Promise<{
        name: string,
        stream: Buffer,
        contentType: string
    }> => {
        return new Promise(async (resolve, reject) => {
            try {
                if (internal) {
                    const stream = fs.readFileSync(paths);
                    const item = {
                        name: `${names}.${type}`,
                        stream,
                        contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                    }
                    resolve(item);
                    return
                }
                const item = `${config.BACKEND_URL}${paths}`;
                const name = this.genToken();
                const writer = fs.createWriteStream(path.join(__dirname, `../../public/images/${name}.jpg`));
                const res = await axios({
                    url: item,
                    method: 'GET',
                    responseType: 'stream'
                });
                res.data.pipe(writer);
                writer.on('finish', () => {
                    //console.log('downloaded');
                    const stream = fs.readFileSync(path.join(__dirname, `../../public/images/${name}.jpg`));
                    const item = {
                        name: `${name}.jpg`,
                        stream,
                        contentType: 'application/octet-stream'
                    }
                    resolve(item)
                });

                writer.on('error', reject)

            } catch (error) {
                reject(error)
            }
        })
    }

    public DetectFaceMesh = async (imagePath: string): Promise<faceapi.FaceDetection> => {
        return new Promise(async (resolve, reject) => {
            try {
                ////this job is segregated to a worker thread to not slow anything down
                const worker = new Worker(path.resolve(__dirname, './faceDetection.service.ts'), {
                    workerData: { imagePath: `${imagePath}` }
                })

                worker.on('message', (result) => {
                    console.log('Worker done', result)
                    if (result?.error) return reject(new Error(result.error))
                    const res: faceapi.FaceDetection = result
                    resolve(result)
                })

                worker.on('error', (reason) => {
                    console.log('worker error', reason)
                    reject(reason)
                })
                worker.on('exit', (code) => {
                    console.log('Worjer exited with code', code)
                    if (code !== 0) reject(new Error(`Worker stopped with exit code ${code}`))
                })
            } catch (error) {
                console.log('error final', error)
                reject(error)
            }
        })
    }
}

export default new action();