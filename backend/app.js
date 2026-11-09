
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
require("dotenv").config();

const { sequelize } = require("./models/associations");

const app = express();

app.use(helmet());

app.use(cors({
  origin: [
    "http://localhost:3000",
    "http://localhost:5173"
  ],
}));

app.use(express.json());
app.use(morgan("dev"));

app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/crops", require("./routes/cropRoutes"));
app.use("/api/orders", require("./routes/ordersRoutes"));
app.use("/api/buyers", require("./routes/buyersRoutes"));
app.use("/api/workers", require("./routes/workersRoutes"));
app.use("/api/attendance", require("./routes/attendanceRoutes"));
app.use("/api/equipment", require("./routes/equipmentRoutes"));
app.use("/api/maintenance", require("./routes/maintenanceRoutes"));
app.use("/api/tasks", require("./routes/tasksRoutes"));
app.use("/api/expenses", require("./routes/expensesRoutes"));
app.use("/api/inventory", require("./routes/inventoryRoutes"));

app.use("/api/activities", require("./routes/activityRoutes"));

app.get("/api/health", (req, res) => {
  res.json({
    succeeded: true,
    message: "AgriVista Backend API is running",
  });
});

const PORT = process.env.PORT_NAME || 5000;

sequelize.authenticate()
  .then(() => sequelize.sync({ alter: true }))
  .then(() => {
    console.log("PostgreSQL connected and tables ready");

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Startup failed:", error.message);
  });
