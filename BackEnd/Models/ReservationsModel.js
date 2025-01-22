export default (sequelize, DataTypes) => {
    return sequelize.define('Reservations', {
        reservation_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        client_id: {
            type: DataTypes.INTEGER,
            references: {
                model: 'Users',
                key: 'user_id'
            }
        },
        request_id: {
            type: DataTypes.INTEGER,
            references: {
                model: 'Service_Requests',
                key: 'request_id'
            }
        },
        nanny_id: {
            type: DataTypes.INTEGER,
            references: {
                model: 'Nanny_Profiles',
                key: 'nanny_id'
            }
        },
        status: {
            type: DataTypes.ENUM('booked', 'confirmed', 'completed', 'cancelled'),
            allowNull: false
        },
        value: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true
        },
        
        booking_date: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        }
    }, {
        tableName: 'Reservations',
        timestamps: false
    });
};