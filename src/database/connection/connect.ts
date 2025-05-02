import { config } from "../../config/config.js";
import { Model, Sequelize } from 'sequelize';
const connect = new Sequelize(
    config.DATABASE,
    config.USERNAME,
    config.PASSWORD,
    {
        host: config.HOST,
        dialect: 'mysql',
        port: parseInt(config.DB_PORT)
    }
);
export default connect;