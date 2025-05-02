import { Sequelize, DataTypes, Model } from "sequelize";
import connect from "../connection/connect";
// import bank_detail_data from "./bank_detail_data.models";
class otps extends Model {
}
const tableName = 'otps';
const userModel = {
    id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true
    },
    otp: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    type: {
        type: DataTypes.ENUM,
        values: ['SIGNUP', 'FORGOT_PASS'],
        allowNull: false
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
    }
}
otps.init(
    userModel, {
    timestamps: true,
    sequelize: connect,
    paranoid: true,
    tableName
})
//relationships here


///modifications 
const query = connect.getQueryInterface();
// query.addColumn(tableName, 'third_name', userModel.third_name).catch(err => console.log('exists'))
// query.changeColumn(tableName, 'first_name', userModel.first_name).catch(err => console.log('exists'))




export default otps;