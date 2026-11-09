const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Equipment = sequelize.define("Equipment", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },

  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },

  type: {
    type: DataTypes.STRING(50),
  },

  purchaseDate: {
    type: DataTypes.DATEONLY,
  },

  status: {
    type: DataTypes.ENUM(
      "Active",
      "Under Repair",
      "Idle"
    ),
    defaultValue: "Active",
  },

  lastServiceDate: {
    type: DataTypes.DATEONLY,
  },

  serviceIntervalDays: {
    type: DataTypes.INTEGER,
  },

  notes: {
    type: DataTypes.TEXT,
  },

}, {
  tableName: "equipment",
  timestamps: true,
});

module.exports = Equipment;