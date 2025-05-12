import { Sequelize, DataTypes, Model } from "sequelize";
import connect from "../connection/connect";
import kyc from "./kyc.model";
// import bank_detail_data from "./bank_detail_data.models";
export class userStatus{
    public static USER_STATUS_EMAIL_PENDING= 'EMAIL_PENDING';
    public static USER_STATUS_PENDING= 'PENDING';
    public static USER_STATUS_ACTIVE= 'ACTIVE';
    public static USER_STATUS_INACTIVE= 'INACTIVE';
    public static USER_STATUS_BLOCKED= 'BLOCKED';
}

export class userType{
    public static USER_TYPE_USER = 'USER';
    public static USER_TYPE_ADMIN = 'ADMIN';
    public static USER_TYPE_VISITOR = 'VISITOR';
    public static USER_TYPE_EMPLOYEE = 'EMPLOYEE';
    public static USER_TYPE_LISTER= 'LISTER';
}
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
    role:{
        type: DataTypes.ENUM,
        values: ['USER','ADMIN', 'VISITOR', 'EMPLOYEE','LISTER'],
        defaultValue: 'USER',
        allowNull: false
    }
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
users.hasOne(kyc,{sourceKey:'id',foreignKey:'user_id',as:'kyc'});

///modifications 
const query = connect.getQueryInterface();
 query.addColumn(tableName, 'salt', userModel.salt).catch(err => console.log('exists'))
 query.addColumn(tableName, 'role', userModel.role).catch(err => console.log('exists'))
 query.changeColumn(tableName, 'role', userModel.role).catch(err => console.log('exists'))
 query.changeColumn(tableName, 'status', userModel.status).catch(err => console.log('exists'))




export default users;