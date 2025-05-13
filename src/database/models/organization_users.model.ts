import { Sequelize, DataTypes, Model } from "sequelize";
import connect from "../connection/connect";
// import bank_detail_data from "./bank_detail_data.models";
export class organizationUserRoles{
    public static ADMIN = 'ADMIN';
    public static VIEWER = 'VIEWER';
    public static AUTHORIZER = 'AUTHORIZER';
}

class organization_users extends Model {
}
const tableName = 'organization_users';
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
    organization_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
            model: 'organization',
            key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
    },
    role: {
        type: DataTypes.ENUM,
        values: ['ADMIN', 'VIEWER', 'AUTHORIZER'],
        allowNull: false
    }
}
organization_users.init(
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
// query.addColumn(tableName, 'reason', userModel.reason).catch(err => console.log('exists'));
// query.addColumn(tableName, 'approved_at', userModel.approved_at).catch(err => console.log('exists'));
// query.addColumn(tableName, 'approved_by', userModel.approved_by).catch(err => console.log('exists'));
// query.changeColumn(tableName, 'status', userModel.status).catch(err => console.log('exists'))
// query.changeColumn(tableName, 'approved_at', userModel.approved_at).catch(err => console.log('exists'))




export default organization_users;