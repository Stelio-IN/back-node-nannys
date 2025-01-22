export default (sequelize, DataTypes) => {
  const NannyChildWorkPreference = sequelize.define('NannyChildWorkPreference', {
    nanny_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'Nanny_Profiles',  // Refers to the Nanny_Profiles table
        key: 'nanny_id'
      }
    },
    work_preference: {
      type: DataTypes.ENUM('morning', 'afternoon', 'evening', 'overnight'),
      allowNull: false,
      primaryKey: true,
      validate: {
        isIn: [['morning', 'afternoon', 'evening', 'overnight']]
      }
    }
  }, {
    tableName: 'Nanny_Child_work_preference',
    timestamps: false,  // Set to true if you want timestamps
    underscored: true,
    freezeTableName: true
  });

 

  return NannyChildWorkPreference;
};
