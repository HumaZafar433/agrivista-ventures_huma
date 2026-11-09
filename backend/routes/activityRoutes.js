
const express = require("express");
const router = express.Router();

const Activity = require("../models/activityModel");
const { protect } = require("../middleware/authMiddleware");

// GET: Load activity records from PostgreSQL
router.get("/", protect, async (req, res) => {
  try {
    const activities = await Activity.findAll({
      order: [["timestamp", "DESC"]],
      limit: 250
    });

    const formattedActivities = activities.map((item) => {
      const activity = item.toJSON();

      return {
        ...activity,
        by: activity.user || "Unknown",
        role: activity.role || "User",
        when: activity.timestamp,
        description:
          `${activity.action} ${activity.entity || "record"}`
      };
    });

    return res.status(200).json({
      succeeded: true,
      data: formattedActivities
    });

  } catch (error) {
    console.error("Activity GET error:", error);

    return res.status(500).json({
      succeeded: false,
      message: "Failed to load activities"
    });
  }
});

// POST: Save activity record to PostgreSQL
router.post("/", protect, async (req, res) => {
  try {
    const { action, entity, entityId } = req.body;

    if (!["add", "edit", "delete"].includes(action)) {
      return res.status(400).json({
        succeeded: false,
        message: "Invalid activity action"
      });
    }

    if (!entity || typeof entity !== "string") {
      return res.status(400).json({
        succeeded: false,
        message: "Entity is required"
      });
    }

    const user =
      req.user?.name ||
      req.user?.username ||
      String(req.user?.id || "Unknown");

    const activity = await Activity.create({
      user,
      action,
      entity,
      entityId: entityId || null
    });

    const saved = activity.toJSON();

    return res.status(201).json({
      succeeded: true,
      data: {
        ...saved,
        by: saved.user || "Unknown",
        role: req.user?.role || "User",
        when: saved.timestamp,
        description:
          `${saved.action} ${saved.entity || "record"}`
      }
    });

  } catch (error) {
    console.error("Activity POST error:", error);

    return res.status(500).json({
      succeeded: false,
      message: "Failed to save activity"
    });
  }
});

module.exports = router;
