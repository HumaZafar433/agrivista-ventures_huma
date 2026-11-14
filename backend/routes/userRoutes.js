const router = require("express").Router();

const rateLimit = require("express-rate-limit");

const userController = require("../controllers/userController");

const {
  protect,
  authorize,
} = require("../middleware/authMiddleware");

// Limit login attempts
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: {
    succeeded: false,
    message: "Too many attempts, try again later",
  },
});

// New registrations: Admin only (server-side authorization)
router.post("/register", protect, authorize("admin"), userController.createUser);

// Public login only

router.post("/login", loginLimiter, userController.login);

// Protected Routes
router.post("/logout", protect, userController.logout);

router.get("/me", protect, userController.me);

// Admin Routes
router.get(
  "/",
  protect,
  authorize("admin"),
  userController.getAllUsers
);

router.post(
  "/",
  protect,
  authorize("admin"),
  userController.createUser
);

router.get(
  "/:id",
  protect,
  authorize("admin"),
  userController.getUser
);

router.put(
  "/:id",
  protect,
  authorize("admin"),
  userController.updateUser
);

router.delete(
  "/:id",
  protect,
  authorize("admin"),
  userController.removeUser
);

module.exports = router;