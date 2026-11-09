
const { Activity } = require("../models/associations");
const { ok, fail } = require("./response");

const logActivity = async (req, action, entity, entityId) => {
  try {
    await Activity.create({
      user:
        req.user?.username ||
        req.user?.name ||
        String(req.user?.id || "Unknown"),
      action,
      entity,
      entityId
    });
  } catch (error) {
    console.error(
      "Activity log failed:",
      error.message
    );
  }
};

const crudFactory = (Model, entity, options = {}) => ({
  getAll: async (req, res) => {
    try {
      const rows = await Model.findAll({
        include: options.include || [],
        order: [["createdAt", "DESC"]]
      });

      return ok(res, rows);
    } catch (error) {
      return fail(res, error.message, 500);
    }
  },

  getOne: async (req, res) => {
    try {
      const row = await Model.findByPk(req.params.id, {
        include: options.include || []
      });

      return row
        ? ok(res, row)
        : fail(res, entity + " not found", 404);
    } catch (error) {
      return fail(res, error.message, 500);
    }
  },

  create: async (req, res) => {
    try {
      const row = await Model.create({
        ...req.body,
        createdBy: req.user.id
      });

      await logActivity(req, "add", entity, row.id);

      return ok(res, row, entity + " added", 201);
    } catch (error) {
      return fail(
        res,
        error.errors?.[0]?.message || error.message
      );
    }
  },

  update: async (req, res) => {
    try {
      const row = await Model.findByPk(req.params.id);

      if (!row) {
        return fail(res, entity + " not found", 404);
      }

      await row.update(req.body);

      await logActivity(req, "edit", entity, row.id);

      return ok(res, row, entity + " updated");
    } catch (error) {
      return fail(
        res,
        error.errors?.[0]?.message || error.message
      );
    }
  },

  remove: async (req, res) => {
    try {
      const row = await Model.findByPk(req.params.id);

      if (!row) {
        return fail(res, entity + " not found", 404);
      }

      await row.destroy();

      await logActivity(
        req,
        "delete",
        entity,
        req.params.id
      );

      return ok(
        res,
        { id: req.params.id },
        entity + " removed"
      );
    } catch (error) {
      return fail(res, error.message, 500);
    }
  }
});

module.exports = crudFactory;
module.exports.logActivity = logActivity;
