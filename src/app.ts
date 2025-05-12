import express from 'express';
import cors from 'cors';
const app = express();
import cluster from 'node:cluster';
import * as  os from 'os';
import http from 'node:http';
app.use(express.json({ limit: '5000mb' }));
app.use(express.urlencoded({ limit: '5000mb' }));
app.use(express.json());
import { router } from './router/router';
import { Server, createServer } from 'node:https';
import * as fs from 'fs';
import path from 'node:path';
import websocketService from './services/websocket.service';
app.use(cors({
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: false,
    origin: '*'
}));
app.get('/', (req, res) => {
    res.send('HELLO WORLD FROM HR56, DONT WORRY, WE ARE NOT HACKED');
});


app.use('/api/v1', router);

//use the processes
try {
    const apper = http.createServer(app);
    websocketService.connect(apper);
    // apper.listen(5000, () => {
    //     return console.log(`Express is listening at http://localhost:${5000}`);
    // });
    if (cluster.isPrimary) {
        const cpus = os.cpus().length;
        console.log('No of process to start: ', cpus);
        for (let index = 0; index < cpus; index++) {
            cluster.fork();
        }
        cluster.on('exit', (worker, code, signal) => {
            console.log(`this worker died with process id: ${worker}, code : ${code} and signal: ${signal}`);

            //restart service
            console.log('restarting service');
            setTimeout(() => {
                cluster.fork();
            }, 5000)
        })
    } else {
        const apper = http.createServer(app);
        websocketService.connect(apper);
        apper.listen(5000, () => {
            return console.log(`Express is listening at http://localhost:${5000}`);
        });
    }
} catch (error) {
    console.log('error here', error)
}