export default (sequelize, DataTypes) => {
    return sequelize.define('Users', {
        user_id: {
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
            allowNull: true
        },
        role: {
            type: DataTypes.ENUM('client', 'nanny'),
            allowNull: false
        },
        first_name: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        last_name: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        contact_phone: {
            type: DataTypes.STRING(20),
            allowNull: true
        },
        id_number: {
            type: DataTypes.STRING(50),
            allowNull: true
        },
        id_copy_file_path: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        background_check_status: {
            type: DataTypes.ENUM('pending', 'approved', 'rejected'),
            defaultValue: 'pending'
        },
        created_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        },
        last_login: {
            type: DataTypes.DATE,
            allowNull: true
        },
        country_name: {
            type: DataTypes.STRING(100),
            allowNull: true
        },
        province_name: {
            type: DataTypes.STRING(100),
            allowNull: true
        }
    }, {
        tableName: 'Users',
        timestamps: false,
        indexes: [
            {
                unique: true,
                fields: ['email']
            }
        ]
    });
};