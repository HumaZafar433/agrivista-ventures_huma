const { Op } = require("sequelize");
const { User } = require("../models/associations");
const generateToken = require("../utils/generateToken");
const { ok, fail } = require("../utils/response");

// Return user without password
const safe = (user) => ({
  id: user.id,
  fullName: user.fullName,
  username: user.username,
  email: user.email,
  role: user.role,
});

// LOGIN
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return fail(res, "Username and password are required");
    }

    const user = await User.findOne({
      where: {
        [Op.or]: [
          { username },
          { email: username },
        ],
      },
    });

    if (!user || !(await user.matchPassword(password))) {
      return fail(res, "Invalid username or password", 401);
    }

    const token = generateToken(user);

    return res.json({
      succeeded: true,
      message: "Login successful",
      user: {
        ...safe(user),
        token,
      },
    });

  } catch (error) {
    return fail(res, error.message, 500);
  }
};

// GET LOGGED-IN USER
exports.me = async (req, res) => {
  return ok(res, safe(req.user));
};

// LOGOUT
exports.logout = async (req, res) => {
  return ok(res, null, "Logged out");
};

// GET ALL USERS - ADMIN
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ["password"] },
      order: [["createdAt", "DESC"]],
    });

    return ok(res, { users });
  } catch (error) {
    return fail(res, error.message, 500);
  }
};

// GET ONE USER - ADMIN
exports.getUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);

    if (!user) {
      return fail(res, "User not found", 404);
    }

    return ok(res, safe(user));
  } catch (error) {
    return fail(res, error.message, 500);
  }
};

// CREATE/REGISTER USER - ADMIN
// The User Sequelize model automatically hashes the password in its beforeCreate hook.
// Do not hash the password here again (that would lead to double hashing).
exports.createUser = async (req, res) => {
  try {
    const body = req.body || {};
    const fullName = typeof body.fullName === "string" ? body.fullName.trim() : "";
    const username = typeof body.username === "string" ? body.username.trim() : "";
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body.password === "string" ? body.password : "";
    const role = body.role || "manager";

    if (!fullName || !username || !email || !password) {
      return fail(res, "Name, username, email and password are required", 400);
    }
    if (password.length < 8) {
      return fail(res, "Password must be at least 8 characters", 400);
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return fail(res, "Enter a valid email address", 400);
    }
    if (!["admin", "manager"].includes(role)) {
      return fail(res, "Invalid user role", 400);
    }
    if (fullName.length > 80 || username.length > 40 || email.length > 120) {
      return fail(res, "One or more fields exceed allowed length", 400);
    }

    const exists = await User.findOne({
      where: { [Op.or]: [{ username }, { email }] },
    });
    if (exists) {
      return fail(res, "Username or email already exists", 409);
    }

    const user = await User.create({ fullName, username, email, password, role });
    return ok(res, safe(user), "User registered successfully", 201);
  } catch (error) {
    if (error.name === "SequelizeUniqueConstraintError") {
      return fail(res, "Username or email already exists", 409);
    }
    if (error.name === "SequelizeValidationError") {
      return fail(res, error.errors?.[0]?.message || "Invalid user data", 400);
    }
    console.error("User registration failed:", error);
    return fail(res, "Could not register user", 500);
  }
};

// UPDATE USER - ADMIN
exports.updateUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);

    if (!user) {
      return fail(res, "User not found", 404);
    }

    const { fullName, username, email, password, role } = req.body;

    const changes = {};

    if (fullName !== undefined) changes.fullName = fullName;
    if (username !== undefined) changes.username = username;
    if (email !== undefined) changes.email = email;
    if (password !== undefined) changes.password = password;
    if (role !== undefined) changes.role = role;

    await user.update(changes);

    return ok(res, safe(user), "User updated");

  } catch (error) {
    return fail(res, error.errors?.[0]?.message || error.message);
  }
};

// DELETE USER - ADMIN
exports.removeUser = async (req, res) => {
  try {
    if (req.params.id === req.user.id) {
      return fail(res, "You cannot delete your own account");
    }

    const deleted = await User.destroy({
      where: { id: req.params.id },
    });

    if (!deleted) {
      return fail(res, "User not found", 404);
    }

    return ok(res, { id: req.params.id }, "User removed");

  } catch (error) {
    return fail(res, error.message, 500);
  }
};
// Backward-compatible alias; both routes require admin middleware.
exports.register = exports.createUser;
