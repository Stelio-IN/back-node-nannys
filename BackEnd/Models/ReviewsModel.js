export default (sequelize, DataTypes) => {
    return sequelize.define('Reviews', {
        review_id: {
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
        reviewer_id: {
            type: DataTypes.INTEGER,
            references: {
                model: 'Users',
                key: 'user_id'
            }
        },
        reviewee_id: {
            type: DataTypes.INTEGER,
            references: {
                model: 'Users',
                key: 'user_id'
            }
        },
        rating: {
            type: DataTypes.DECIMAL(3, 2),
            validate: {
                min: 0,
                max: 5
            }
        },
        review_text: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        review_date: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        }
    }, {
        tableName: 'Reviews',
        timestamps: false
    });
};