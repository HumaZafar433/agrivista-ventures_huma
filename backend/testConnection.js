const sequelize = require("./config/db");

(async () => {
  try {
    await sequelize.authenticate();
    console.log("PostgreSQL connected successfully");
  } catch (error) {
    console.error("Connection failed:", error.message);
  } finally {
    await sequelize.close();
  }
})();