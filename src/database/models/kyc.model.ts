import { Sequelize, DataTypes, Model } from "sequelize";
import connect from "../connection/connect";
// import bank_detail_data from "./bank_detail_data.models";
class kyc extends Model {
}
const tableName = 'kyc';
const userModel = {
    id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true
    },
    address: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    country: {
        type: DataTypes.STRING,
        allowNull: false
    },
    state: {
        type: DataTypes.STRING,
        allowNull: false
    },
    proof_of_address: {
        type: DataTypes.STRING,
        allowNull: false
    },
    id_type: {
        type: DataTypes.ENUM,
        values: ['PASSPORT', 'DRIVERS_LICENCE', 'NATIONAL_ID'],
        allowNull: false
    },
    id_number: {
        type: DataTypes.STRING,
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
    },
    status: {
        type: DataTypes.ENUM,
        values: ['PENDING', 'VERIFIED', 'REJECTED'],
        defaultValue: 'PENDING',
        allowNull: false
    },
    reason: {
        type: DataTypes.STRING,
        allowNull: true
    },
    verified_by: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true,
        references: {
            model: 'users',
            key: 'id'
        },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE'
    },
    verified_at: {
        type: DataTypes.DATE,
        allowNull: true
    },
    rejected_at: {
        type: DataTypes.DATE,
        allowNull: true
    },
    facial_photo: {
        type: DataTypes.STRING,
        allowNull: true
    },
    facial_photo_status: {
        type: DataTypes.STRING,
        defaultValue: null,
        allowNull: null
    }
}
kyc.init(
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




export default kyc;