const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Buyer = sequelize.define("Buyer", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },

  name: {
    type: DataTypes.STRING(80),
    allowNull: false,
  },

  cnic: {
    type: DataTypes.STRING(15),
    allowNull: false,
    unique: true,
  },
  phone: {
  type: DataTypes.STRING(11),
  allowNull: true,
},

businessName: {
  type: DataTypes.STRING(120),
  allowNull: true,
},

imageBase64: {
  type: DataTypes.TEXT("long"),
  allowNull: true,
},

  photoUrl: {
    type: DataTypes.STRING,
  },

  cropId: {
    type: DataTypes.UUID,
    allowNull: false,
  },

  quantity: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
  },

  date: {
    type: DataTypes.DATEONLY,
  },

}, {
  tableName: "buyers",
  timestamps: true,
});

module.exports = Buyer;