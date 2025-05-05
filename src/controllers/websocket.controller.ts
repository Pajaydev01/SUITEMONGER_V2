import { Socket, Server, DefaultEventsMap } from "socket.io";
import users from '../database/models/users.model';
import { types } from "../services/websocket.service";
export default class Websocket{
    public static IncomingMessage= async (connect:Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>,message,user:users) => {
        try {
            console.log('message', message);
            const send=connect.emit(`message/${user.dataValues.id}`, {
                message: message,
                user: user
            });
            console.log('message sent',send);
        } catch (error) {
            
        }
    }

    public static OutgoingMessage= async (connect:Socket,message,type: types,user:users) => {
            try {
                //send message only
                const send=connect.emit(`${type}/${user.dataValues.id}`, {
                    message: message,
                    user: user
                });
                console.log('message sent',send);
            } catch (error) {
                
            }
        }

        public static Typing= async (connect:Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>,message) => {
            try {
                
            } catch (error) {
                
            }
        }

        public static Blur= async (connect:Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>,message) => {
            try {
                
            } catch (error) {
                
            }
        }
}