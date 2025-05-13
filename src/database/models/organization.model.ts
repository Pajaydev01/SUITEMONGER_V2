import { Sequelize, DataTypes, Model } from "sequelize";
import connect from "../connection/connect";
import users from "./users.model";
// import bank_detail_data from "./bank_detail_data.models";
export class organizationtatus{
    public static USER_STATUS_PENDING= 'PENDING';
    public static USER_STATUS_ACTIVE= 'APPROVED';
    public static USER_STATUS_INACTIVE= 'REJECTED';
    public static USER_STATUS_BLOCKED= 'BLOCKED';
}

class organization extends Model {
}
const tableName = 'organization';
const userModel = {
    id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true
    },
    //owner
    user_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
    },
    director: {
        type: DataTypes.STRING,
        allowNull: false
    },
    cac_document: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique:true
    },
    address:{
        type: DataTypes.STRING,
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM,
        values: ['PENDING', 'APPROVED', 'REJECTED', 'BLOCKED'],
        defaultValue: 'PENDING',
        allowNull: false
    },
    reason:{
        type: DataTypes.STRING,
        allowNull: true
    },
    approved_by:{
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: true,
            references: {
                model: 'users',
                key: 'id'
            },
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE'
    },
    approved_at:{
        type: DataTypes.DATE,
        allowNull: true
    },
    business_type:{
        type: DataTypes.STRING,
        allowNull: false
    },
    utility_bill:{
        type: DataTypes.STRING,
        allowNull: false
    },
    
}
organization.init(
    userModel, {
    timestamps: true,
    sequelize: connect,
    paranoid: true,
    tableName,
})


//relationships here
//organization.hasOne(users,{sourceKey:'user_id',foreignKey:'organization_id',as:'creator'});


///modifications 
const query = connect.getQueryInterface();
query.addColumn(tableName, 'reason', userModel.reason).catch(err => console.log('exists'));
query.addColumn(tableName, 'approved_at', userModel.approved_at).catch(err => console.log('exists'));
query.addColumn(tableName, 'approved_by', userModel.approved_by).catch(err => console.log('exists'));
query.changeColumn(tableName, 'status', userModel.status).catch(err => console.log('exists'))
query.changeColumn(tableName, 'approved_at', userModel.approved_at).catch(err => console.log('exists'))




export default organization;