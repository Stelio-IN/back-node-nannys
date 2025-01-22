export default (sequelize, DataTypes) => {
    return sequelize.define('Admin', {
        admin_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        email: {
            type: DataTypes.STRING(255),
            unique: true,
            allowNull: false
        },
        password_hash: {
            type: DataTypes.STRING(255),
            allowNull: false
        }
    }, {
        tableName: 'Admin',
        timestamps: false
    });
};