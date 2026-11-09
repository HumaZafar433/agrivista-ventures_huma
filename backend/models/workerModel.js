const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Worker = sequelize.define("Worker", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },

  fullName: {
    type: DataTypes.STRING(80),
    allowNull: false,
  },

  cnic: {
    type: DataTypes.STRING(15),
    allowNull: false,
    unique: true,
  },

  phone: {
    type: DataTypes.STRING(20),
  },

  role: {
    type: DataTypes.STRING(50),
  },

  dailyWage: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0,
  },

  joinDate: {
    type: DataTypes.DATEONLY,
  },

  status: {
    type: DataTypes.ENUM("Active", "Inactive"),
    defaultValue: "Active",
  },

}, {
  tableName: "workers",
  timestamps: true,
});

module.exports = Worker;