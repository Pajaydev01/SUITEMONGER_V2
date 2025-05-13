import { Sequelize, DataTypes, Model, ModelAttributeColumnOptions } from "sequelize";
import connect from "../connection/connect";
import subHouse from "./sub_house.model";
import users from "./users.model";
import organization from "./organization.model";
class house extends Model {
}
const tableName = 'house';
const userModel = {
    id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true
    },
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
        allowNull: true,
        references: {
            model: 'organization',
            key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
    },
    long:{
        type:DataTypes.DOUBLE,
        allowNull:false,
    },
    lat:{
        type:DataTypes.DOUBLE,
        allowNull:false,
    },
    address:{
        type:DataTypes.STRING,
        allowNull:false,
    },
    name:{
        type:DataTypes.STRING,
        allowNull:false,
        unique:true
    },
    details:{
        type:DataTypes.STRING,
        allowNull:false
    },
    short_video:{
        type:DataTypes.STRING,
        allowNull:false
    },
    pictures:{
        type: DataTypes.JSON,
        allowNull: false,
    },
    has_children:{
        type:DataTypes.BOOLEAN,
        allowNull:false,
        defaultValue:false
    },
    price:{
        type:DataTypes.BIGINT,
        allowNull:true
    },
    space_available:{
        type:DataTypes.INTEGER,
        allowNull:true
    },
    rules:{
        type: DataTypes.JSON,
        allowNull: true,
    },
    amenities:{
        type: DataTypes.JSON,
        allowNull: true,
    }
}
house.init(
    userModel, {
    timestamps: true,
    sequelize: connect,
    paranoid: true,
    tableName
})
//relationships here
house.hasOne(subHouse,{sourceKey:'id',foreignKey:'house_id',as:'sub_house'});
house.hasOne(users,{sourceKey:'user_id',foreignKey:'id',as:'creator'});
house.hasOne(organization,{sourceKey:'organization_id',foreignKey:'id',as:'organization'});


///modifications 
const query = connect.getQueryInterface();
query.addColumn(tableName, 'organization_id', userModel.organization_id).catch(err => console.log('exists'))
query.changeColumn(tableName, 'name', userModel.name).catch(err => console.log('exists'))




export default house;