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

// SIGNUP
exports.register = async (req, res) => {
  try {
    const { fullName, username, email, password } = req.body;

    if (!fullName || !username || !email || !password) {
      return fail(res, "All fields are required");
    }

    if (password.length < 6) {
      return fail(res, "Password must be at least 6 characters");
    }

    const exists = await User.findOne({
      where: {
        [Op.or]: [{ username }, { email }],
      },
    });

    if (exists) {
      return fail(res, "Username or email already exists", 409);
    }

    const user = await User.create({
      fullName,
      username,
      email,
      password,
      role: "manager",
    });

    return ok(res, safe(user), "Account created successfully", 201);

  } catch (error) {
    return fail(res, error.errors?.[0]?.message || error.message, 500);
  }
};

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

// CREATE USER - ADMIN
exports.createUser = async (req, res) => {
  try {
    const { fullName, username, email, password, role } = req.body;

    const user = await User.create({
      fullName,
      username,
      email,
      password,
      role,
    });

    return ok(res, safe(user), "User created", 201);
  } catch (error) {
    return fail(res, error.errors?.[0]?.message || error.message);
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