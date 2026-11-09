const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Activity = sequelize.define("Activity", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },

  user: {
    type: DataTypes.STRING(100),
  },

  action: {
    type: DataTypes.ENUM(
      "add",
      "edit",
      "delete"
    ),
    allowNull: false,
  },

  entity: {
    type: DataTypes.STRING(100),
  },

  entityId: {
    type: DataTypes.UUID,
  },

  timestamp: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },

}, {
  tableName: "activities",
  timestamps: true,
});

module.exports = Activity;