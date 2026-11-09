
const { Op } = require("sequelize");
const { Crop } = require("../models/associations");
const { ok, fail } = require("../utils/response");
const { logActivity } = require("../utils/crudFactory");

exports.getAll = async (req, res) => {
  try {
    const {
      status,
      search,
      sort = "createdAt",
      order = "DESC"
    } = req.query;

    const where = {};

    if (status) where.status = status;

    if (search) {
      where.name = { [Op.iLike]: `%${search}%` };
    }

    const crops = await Crop.findAll({
      where,
      order: [[sort, order]]
    });

    return ok(res, crops);
  } catch (error) {
    return fail(res, error.message, 500);
  }
};

exports.getOne = async (req, res) => {
  try {
    const crop = await Crop.findByPk(req.params.id);

    if (!crop) return fail(res, "Crop not found", 404);

    return ok(res, crop);
  } catch (error) {
    return fail(res, error.message, 500);
  }
};

// ADD CROP
exports.create = async (req, res) => {
  try {
    const crop = await Crop.create({
      ...req.body,
      createdBy: req.user.id
    });

    logActivity(req, "add", "crop", crop.id);

    return ok(res, crop, "Crop added", 201);
  } catch (error) {
    return fail(res, error.errors?.[0]?.message || error.message);
  }
};

// UPDATE CROP
exports.update = async (req, res) => {
  try {
    const crop = await Crop.findByPk(req.params.id);

    if (!crop) return fail(res, "Crop not found", 404);

    await crop.update(req.body);

    logActivity(req, "edit", "crop", crop.id);

    return ok(res, crop, "Crop updated");
  } catch (error) {
    return fail(res, error.errors?.[0]?.message || error.message);
  }
};

// DELETE CROP
exports.remove = async (req, res) => {
  try {
    const crop = await Crop.findByPk(req.params.id);

    if (!crop) return fail(res, "Crop not found", 404);

    await crop.destroy();

    logActivity(req, "delete", "crop", req.params.id);

    return ok(res, { id: req.params.id }, "Crop removed");
  } catch (error) {
    return fail(res, error.message, 500);
  }
};
