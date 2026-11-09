
const router = require("express").Router();

const {
  sequelize,
  Inventory
} = require("../models/associations");

const crudFactory = require("../utils/crudFactory");

const {
  protect,
  authorize
} = require("../middleware/authMiddleware");

const { ok, fail } = require("../utils/response");

const c = crudFactory(Inventory, "inventory");

router.use(protect);

router.get("/", c.getAll);
router.get("/:id", c.getOne);
router.post("/", c.create);

router.put(
  "/:id/use",
  authorize("admin"),
  async (req, res) => {
    const amount = Number(req.body?.amount);
    const note = String(req.body?.note || "").trim();

    if (
      !Number.isFinite(amount) ||
      amount <= 0 ||
      Math.round(amount * 100) / 100 !== amount
    ) {
      return fail(
        res,
        "Enter a positive quantity with at most 2 decimal places.",
        400
      );
    }

    try {
      const updatedItem = await sequelize.transaction(
        async (transaction) => {
          const item = await Inventory.findByPk(
            req.params.id,
            {
              transaction,
              lock: transaction.LOCK.UPDATE
            }
          );

          if (!item) {
            const error = new Error(
              "Inventory item not found."
            );
            error.statusCode = 404;
            throw error;
          }

          const available = Number(item.qty);

          if (
            !Number.isFinite(available) ||
            amount > available
          ) {
            const error = new Error(
              "Insufficient stock."
            );
            error.statusCode = 400;
            throw error;
          }

          const oldHistory = Array.isArray(item.history)
            ? item.history
            : [];

          const newEntry = {
            amount,
            note,
            usedAt: new Date().toISOString()
          };

          await item.update(
            {
              qty: Number(
                (available - amount).toFixed(2)
              ),
              history: [...oldHistory, newEntry]
            },
            { transaction }
          );

          return item;
        }
      );
      await crudFactory.logActivity(
        req,
        "edit",
        "inventory",
        updatedItem.id
      );

      return ok(
        res,
        updatedItem,
        "Stock usage recorded successfully."
      );
    } catch (error) {
      console.error(
        "Inventory usage error:",
        error.message
      );

      return fail(
        res,
        error.message,
        error.statusCode || 500
      );
    }
  }
);


router.put("/:id", authorize("admin"), async (req, res) => {
  if (!Array.isArray(req.body.history)) {
    return c.update(req, res);
  }

  try {
    const qty = Number(req.body.qty);

    if (!Number.isFinite(qty) || qty < 0) {
      return fail(res, "Invalid quantity", 400);
    }

    const [rows] = await sequelize.query(
      `UPDATE public.inventory
       SET qty = :qty,
           history = CAST(:history AS jsonb),
           "updatedAt" = NOW()
       WHERE id = CAST(:id AS uuid)
       RETURNING *`,
      {
        replacements: {
          id: req.params.id,
          qty,
          history: JSON.stringify(req.body.history)
        }
      }
    );

    if (!rows.length) {
      return fail(res, "Inventory item not found", 404);
    }

    return ok(res, rows[0], "Inventory updated");
  } catch (error) {
    console.error("Inventory update:", error);
    return fail(res, error.message, 500);
  }
});

router.delete("/:id", authorize("admin"), c.remove);

module.exports = router;
