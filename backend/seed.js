
require("dotenv").config();

const {
  sequelize,
  User,
  Crop,
  Worker,
  Equipment
} = require("./models/associations");

(async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync();

    await User.findOrCreate({
      where: { username: "admin" },
      defaults: {
        fullName: "Demo Admin",
        email: "admin@agri.com",
        password: "Admin@123",
        role: "admin"
      }
    });

    await User.findOrCreate({
      where: { username: "manager" },
      defaults: {
        fullName: "Demo Manager",
        email: "manager@agri.com",
        password: "Manager@123",
        role: "manager"
      }
    });

    if ((await Crop.count()) === 0) {
      await Crop.bulkCreate([
        {
          name: "Wheat",
          field: "Field A",
          plantingDate: "2026-06-01",
          cuttingDate: "2026-11-15",
          healthScore: 90,
          status: "Healthy",
          expectedQty: 500,
          harvestQty: 350
        },
        {
          name: "Cotton",
          field: "Field B",
          plantingDate: "2026-05-10",
          cuttingDate: "2026-11-05",
          healthScore: 55,
          status: "Needs Attention",
          expectedQty: 300,
          harvestQty: 150
        },
        {
          name: "Rice",
          field: "Field C",
          plantingDate: "2026-06-20",
          cuttingDate: "2026-12-01",
          healthScore: 30,
          status: "Critical",
          expectedQty: 400,
          harvestQty: 0
        }
      ]);
    }

    await Worker.findOrCreate({
      where: { cnic: "35202-1234567-1" },
      defaults: {
        fullName: "Ali Khan",
        phone: "03001234567",
        role: "Farm Hand",
        dailyWage: 1500,
        joinDate: "2026-01-01",
        status: "Active"
      }
    });

    await Equipment.findOrCreate({
      where: { name: "Tractor MF-385" },
      defaults: {
        type: "Tractor",
        purchaseDate: "2024-03-01",
        status: "Active",
        lastServiceDate: "2026-09-01",
        serviceIntervalDays: 60
      }
    });

    console.log("Seed complete!");
    console.log("Admin: admin / Admin@123");
    console.log("Manager: manager / Manager@123");

  } catch (error) {
    console.error("Seed failed:", error.message);
    process.exitCode = 1;
  } finally {
    await sequelize.close();
  }
})();
