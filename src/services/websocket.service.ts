import { Socket, Server } from "socket.io";
import actionService from "./action.service";
import Websocket from "../controllers/websocket.controller";
import users from "../database/models/users.model";
export type types = 'message' | 'face_detection' | 'typing' | 'blur'
class socketIo {
    public static con: Array<{ user: users, con: Socket }> = [];
    public static src: Server;

    public static connect = async (server: any): Promise<void> => {
        const connect = new Server(server, {
            cors: {
                origin: "*",
                methods: ['GET', 'POST'],
                credentials: true
            },
            transports: ['websocket'],
            allowEIO3: true,
            pingTimeout: 19000000,
            allowUpgrades: false
        });

        this.src = connect;
        console.log('Socket listening on port 5000');

        connect.on('connection', async (res: Socket) => {
            console.log('Connection attempt')
            let list = this.con;
            //validate the user
            // const userid= res.handshake.auth.userId;
            const userid = res.handshake.headers['userid'];
            console.log('User id: ', userid)
            if (!userid) {
                console.log('No user id passed')
                res.emit('error', { message: 'No user id passed' });
                res.disconnect();
                return;
            }
            const check = await users.findOne({ where: { id: userid } })
            if (!check) {
                console.log('User not found')
                res.emit('error', { message: 'User not found' });
                res.disconnect();
                return;
            }
            console.log('User found and socket connected')
            const things = {
                user: check,
                con: res
            };
            if (this.con.length > 0) {
                list = this.con.filter(resp => resp.user.dataValues.id != userid);
            }
            this.con = list;
            this.con.push(things);
            //main router to controller
            res.on('message', async (res) => {
                switch (res.type) {
                    case 'message':
                        await Websocket.IncomingMessage(connect, res, things.user)
                        break;

                    case 'typing':
                        await Websocket.Typing(connect, res)
                        break;

                    case 'blur':
                        await Websocket.Blur(connect, res)
                        break;
                }

            })
        });

        connect.on('disconnect', (res: Socket) => {
            console.log('Disconnected')
        })


    }


    public static SendMessage = async (message: any, user: users = null, type: types) => {
        //  message="hollo everyone";
        if (this.con.length > 0) {
            //loop and send to all if no user is passed
            if (user) {
                const check = this.con.filter(resp => resp.user.dataValues.id == user.dataValues.id);
                if (check.length > 0) {
                    // check[0].con.emit('newMessage', JSON.stringify(message));
                    await Websocket.OutgoingMessage(check[0].con, message, type, check[0].user)
                }
            } else {
                this.con.forEach((res, index: number) => {
                    Websocket.OutgoingMessage(this.con[index].con, message, type, this.con[index].user)
                })
            }
            // console.log('total users: ', this.con.length);
            // this.src.emit('newMessage', JSON.stringify(message));
        }
    }
}

export default socketIo;