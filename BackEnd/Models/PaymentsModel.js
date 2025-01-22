export default (sequelize, DataTypes) => {
    return sequelize.define('Payments', {
        payment_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        reservation_id: {
            type: DataTypes.INTEGER,
            references: {
                model: 'Reservations',
                key: 'reservation_id'
            }
        },
        client_id: {
            type: DataTypes.INTEGER,
            references: {
                model: 'Users',
                key: 'user_id'
            }
        },
        amount: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false
        },
        payment_date: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        },
        payment_method: {
            type: DataTypes.STRING(50),
            allowNull: true
        },
        status: {
            type: DataTypes.ENUM('pending', 'completed', 'failed'),
            allowNull: false
        }
    }, {
        tableName: 'Payments',
        timestamps: false
    });
};