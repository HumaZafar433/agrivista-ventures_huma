const jwt = require("jsonwebtoken");

const { User } = require("../models/associations");

const { fail } = require("../utils/response");

exports.protect = async (req, res, next) => {
  try {
    const header = req.headers.authorization || "";

    const token = header.startsWith("Bearer ")
      ? header.split(" ")[1]
      : null;

    if (!token) {
      return fail(res, "Not authorized, token missing", 401);
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    const user = await User.findByPk(decoded.id, {
      attributes: {
        exclude: ["password"],
      },
    });

    if (!user) {
      return fail(res, "User no longer exists", 401);
    }

    req.user = user;

    next();

  } catch (error) {
    return fail(res, "Invalid or expired token", 401);
  }
};

// Check User Role
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (req.user && roles.includes(req.user.role)) {
      return next();
    }

    return fail(
      res,
      "You do not have permission for this action",
      403
    );
  };
};