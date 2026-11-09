const { DataTypes } = require("sequelize");
const bcrypt = require("bcryptjs");
const sequelize = require("../config/db");

const User = sequelize.define("User", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },

  fullName: {
    type: DataTypes.STRING(80),
    allowNull: false,
  },

  username: {
    type: DataTypes.STRING(40),
    allowNull: false,
    unique: true,
  },

  email: {
    type: DataTypes.STRING(120),
    allowNull: false,
    unique: true,
    validate: { isEmail: true },
  },

  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  role: {
    type: DataTypes.ENUM("admin", "manager"),
    defaultValue: "manager",
  },

}, {
  tableName: "users",
  timestamps: true,
});

const hash = async (user) => {
  if (user.changed("password")) {
    user.password = await bcrypt.hash(user.password, 10);
  }
};

User.beforeCreate(hash);
User.beforeUpdate(hash);

User.prototype.matchPassword = function (plain) {
  return bcrypt.compare(plain, this.password);
};

module.exports = User;