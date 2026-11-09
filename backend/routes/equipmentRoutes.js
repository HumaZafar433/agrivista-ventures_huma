const router = require("express").Router();
const { Equipment } = require("../models/associations");
const crudFactory = require("../utils/crudFactory");
const { protect, authorize } = require("../middleware/authMiddleware");

const c = crudFactory(Equipment, "equipment");

router.use(protect);

router.get("/", c.getAll);
router.get("/:id", c.getOne);
router.post("/", c.create);
router.put("/:id", authorize("admin"), c.update);
router.delete("/:id", authorize("admin"), c.remove);

module.exports = router;
