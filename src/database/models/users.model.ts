import { Sequelize, DataTypes, Model } from "sequelize";
import connect from "../connection/connect";
// import bank_detail_data from "./bank_detail_data.models";
class users extends Model {
}
const tableName = 'users';
const userModel = {
    id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true
    },
    first_name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    last_name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    salt:{
        type: DataTypes.STRING,
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM,
        values: ['EMAIL_PENDING','PENDING', 'ACTIVE', 'INACTIVE', 'BLOCKED'],
        defaultValue: 'EMAIL_PENDING',
        allowNull: false
    },
}
users.init(
    userModel, {
    timestamps: true,
    sequelize: connect,
    paranoid: true,
    tableName,
    defaultScope: {
        attributes: { exclude: ['password','salt'] }
    },
    scopes: {
        withPassword: {
            attributes: { include: ['password','salt'] }
        }
    }
})


//relationships here


///modifications 
const query = connect.getQueryInterface();
 query.addColumn(tableName, 'salt', userModel.salt).catch(err => console.log('exists'))
 query.changeColumn(tableName, 'status', userModel.status).catch(err => console.log('exists'))




export default users;