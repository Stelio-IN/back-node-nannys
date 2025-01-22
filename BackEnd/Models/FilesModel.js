export default (sequelize, DataTypes) => {
    return sequelize.define('Files', {
        file_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        user_id: {
            type: DataTypes.INTEGER,
            references: {
                model: 'Users',
                key: 'user_id'
            }
        },
        file_name: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        file_path: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        file_type: {
            type: DataTypes.STRING(50),
            allowNull: true
        },
        upload_date: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        }
    }, {
        tableName: 'Files',
        timestamps: false
    });
};