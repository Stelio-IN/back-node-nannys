export default (sequelize, DataTypes) => {
    const ServiceRequestChildAges = sequelize.define(
      'Service_Request_Child_Ages',
      {
        request_id: {
          type: DataTypes.INTEGER,
          primaryKey: true, // Parte da chave composta
          references: {
            model: 'Service_Requests',
            key: 'request_id',
          },
        },
        age_group: {
          type: DataTypes.ENUM('babies', 'toddlers', 'children', 'teenagers'),
          primaryKey: true, // Parte da chave composta
          allowNull: false,
        },
      },
      {
        tableName: 'Service_Request_Child_Ages',
        timestamps: false,
        indexes: [
          {
            unique: true,
            fields: ['request_id'], // Índice único para `request_id`
          },
        ],
      }
    );
  
    return ServiceRequestChildAges;
  };
  