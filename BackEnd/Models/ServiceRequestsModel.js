// export default (sequelize, DataTypes) => {
//     return sequelize.define('Service_Requests', {
//         request_id: {
//             type: DataTypes.INTEGER,
//             primaryKey: true,
//             autoIncrement: true
//         },
//         client_id: {
//             type: DataTypes.INTEGER,
//             references: {
//                 model: 'Users',
//                 key: 'user_id'
//             }
//         },
//         num_children: {
//             type: DataTypes.INTEGER,
//             allowNull: false
//         },
//         start_date: {
//             type: DataTypes.DATEONLY,
//             allowNull: false
//         },
//         end_date: {
//             type: DataTypes.DATEONLY,
//             allowNull: false
//         },
//         start_time: {
//             type: DataTypes.TIME,
//             allowNull: false
//         },
//         end_time: {
//             type: DataTypes.TIME,
//             allowNull: false
//         },
//         special_needs: {
//             type: DataTypes.BOOLEAN,
//             allowNull: false
//         },
//         special_requests: {
//             type: DataTypes.TEXT,
//             allowNull: true
//         },
//         status: {
//             type: DataTypes.ENUM('pending', 'in_review', 'matched', 'completed', 'cancelled'),
//             defaultValue: 'pending'
//         },
//         created_at: {
//             type: DataTypes.DATE,
//             defaultValue: DataTypes.NOW
//         }
//     }, {
//         tableName: 'Service_Requests',
//         timestamps: false
//     });
// };

export default (sequelize, DataTypes) => {
    return sequelize.define('Service_Requests', {
        request_id: {
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
        nanny_id: {
            type: DataTypes.INTEGER,
            references: {
                model: 'Users', // Nome da tabela onde as nannies estão armazenadas
                key: 'user_id'  // Chave primária da tabela Nannies
            },
            allowNull: true // Pode ser nulo inicialmente, se uma nanny ainda não foi atribuída
        },
        number_of_people: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false
        },
        nanny_email: {
            type: DataTypes.STRING,
            allowNull: false
        },
        address: {
            type: DataTypes.STRING,
            allowNull: false
        },
        start_date: {
            type: DataTypes.DATEONLY,
            allowNull: false
        },
        end_date: {
            type: DataTypes.DATEONLY,
            allowNull: false
        },
        notes: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        status: {
            type: DataTypes.ENUM('pending', 'approved', 'rejected', 'completed', 'cancelled'),
            defaultValue: 'pending'
        },
        created_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        }
    }, {
        tableName: 'Service_Requests',
        timestamps: false
    });
};
