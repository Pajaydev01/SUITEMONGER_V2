import { Sequelize, DataTypes, Model, ModelAttributeColumnOptions } from "sequelize";
import connect from "../connection/connect";
class subHouse extends Model {
}
const tableName = 'subHouse';
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
    house_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
            model: 'house',
            key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    details: {
        type: DataTypes.STRING,
        allowNull: false
    },
    short_video: {
        type: DataTypes.STRING,
        allowNull: false
    },
    pictures: {
        type: DataTypes.JSON,
        allowNull: false,
        get() {
            const rawValue = this.getDataValue('pictures');
            return rawValue ? JSON.parse(rawValue) : null;
        }
    },
    price: {
        type: DataTypes.BIGINT,
        allowNull: false
    },
    space_available: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    rules: {
        type: DataTypes.JSON,
        allowNull: false,
        get() {
            const rawValue = this.getDataValue('rules');
            return rawValue ? JSON.parse(rawValue) : null;
        }
    },
    amenities: {
        type: DataTypes.JSON,
        allowNull: true,
        get() {
            const rawValue = this.getDataValue('amenities');
            return rawValue ? JSON.parse(rawValue) : null;
        }
    }
}
subHouse.init(
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




export default subHouse;