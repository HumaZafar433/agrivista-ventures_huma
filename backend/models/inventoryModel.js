
const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Inventory = sequelize.define("Inventory", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },

  item: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },

  type: {
    type: DataTypes.ENUM(
      "Fertilizer",
      "Pesticide",
      "Seed"
    ),
    allowNull: false,
  },

  qty: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0,
  },

  minQty: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0,
  },

  unit: {
    type: DataTypes.STRING(30),
  },

  history: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: [],
  },

}, {
  tableName: "inventory",
  timestamps: true,
});

module.exports = Inventory;
