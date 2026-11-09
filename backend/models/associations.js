const sequelize = require("../config/db");

const User = require("./userModel");
const Crop = require("./cropModel");
const Order = require("./orderModel");
const Buyer = require("./buyerModel");

const Worker = require("./workerModel");
const Attendance = require("./attendanceModel");
const Equipment = require("./equipmentModel");
const Maintenance = require("./maintenanceModel");

const Task = require("./taskModel");
const Expense = require("./expenseModel");
const Inventory = require("./inventoryModel");
const Activity = require("./activityModel");

User.hasMany(Crop, {
  foreignKey: "createdBy",
});

Crop.belongsTo(User, {
  foreignKey: "createdBy",
});
Buyer.hasMany(Order, {
  foreignKey: "buyerId",
  onDelete: "SET NULL",
});

Order.belongsTo(Buyer, {
  foreignKey: "buyerId",
});

Crop.hasMany(Order, {
  foreignKey: "cropId",
  onDelete: "CASCADE",
});

Order.belongsTo(Crop, {
  foreignKey: "cropId",
});

Crop.hasMany(Buyer, {
  foreignKey: "cropId",
  onDelete: "CASCADE",
});

Buyer.belongsTo(Crop, {
  foreignKey: "cropId",
});

Crop.hasMany(Task, {
  foreignKey: "cropId",
  onDelete: "SET NULL",
});

Task.belongsTo(Crop, {
  foreignKey: "cropId",
});

Crop.hasMany(Expense, {
  foreignKey: "cropId",
  onDelete: "SET NULL",
});

Expense.belongsTo(Crop, {
  foreignKey: "cropId",
});

Worker.hasMany(Attendance, {
  foreignKey: "workerId",
  onDelete: "CASCADE",
});

Attendance.belongsTo(Worker, {
  foreignKey: "workerId",
});

Equipment.hasMany(Maintenance, {
  foreignKey: "equipmentId",
  onDelete: "CASCADE",
});

Maintenance.belongsTo(Equipment, {
  foreignKey: "equipmentId",
});

module.exports = {
  sequelize,
  User,
  Crop,
  Order,
  Buyer,
  Worker,
  Attendance,
  Equipment,
  Maintenance,
  Task,
  Expense,
  Inventory,
  Activity,
};