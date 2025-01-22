export default (sequelize, DataTypes) => {
  const NannyChildAgeExperience = sequelize.define('NannyChildAgeExperience', {
    nanny_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true, // Parte da chave composta
      references: {
        model: 'Nanny_Profiles',
        key: 'nanny_id'
      }
    },
    age_group: {
      type: DataTypes.ENUM('babies', 'toddlers', 'children', 'teenagers'),
      allowNull: false,
      primaryKey: true, // Parte da chave composta
      validate: {
        isIn: [['babies', 'toddlers', 'children', 'teenagers']]
      }
    }
  }, {
    tableName: 'Nanny_Child_Age_Experience',
    timestamps: false,
    underscored: true,
    freezeTableName: true,
    indexes: [
      {
        unique: true,
        fields: ['nanny_id'] // Adiciona um índice único na coluna nanny_id
      }
    ]
  });

  return NannyChildAgeExperience;
};
