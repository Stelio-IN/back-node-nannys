export default (sequelize, DataTypes) => {
    return sequelize.define('User_Language', {
        user_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            references: {
                model: 'Users',  
                key: 'user_id'   
            }
        },
        language: {
            type: DataTypes.STRING(255),
            primaryKey: true,  
        }
    }, {
        tableName: 'User_Language',  
        timestamps: false,           
        freezeTableName: true        
    });
};
