const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Expense = sequelize.define("Expense", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },

  cropId: {
    type: DataTypes.UUID,
    allowNull: true,
  },

  category: {
  type: DataTypes.ENUM(
    "Seeds",
    "Fertilizer",
    "Labour",
    "Fuel",
    "Spraying",
    "Repair",
    "Other"
  ),
  allowNull: false,
},

  amount: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
  },

  date: {
    type: DataTypes.DATEONLY,
  },

  note: {
    type: DataTypes.TEXT,
  },

}, {
  tableName: "expenses",
  timestamps: true,
});

module.exports = Expense;