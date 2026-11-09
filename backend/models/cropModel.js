const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Crop = sequelize.define("Crop", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },

  name: {
    type: DataTypes.STRING(80),
    allowNull: false,
  },

  field: {
    type: DataTypes.STRING(80),
    allowNull: false,
  },

  plantingDate: {
    type: DataTypes.DATEONLY,
  },

  cuttingDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },

  healthScore: {
    type: DataTypes.INTEGER,
    defaultValue: 100,
    validate: { min: 0, max: 100 },
  },

  status: {
    type: DataTypes.ENUM(
      "Healthy",
      "Needs Attention",
      "Critical"
    ),
    defaultValue: "Healthy",
  },

  expectedQty: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0,
  },

  harvestQty: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0,
  },

  createdBy: {
    type: DataTypes.UUID,
  },

}, {
  tableName: "crops",
  timestamps: true,
});

module.exports = Crop;