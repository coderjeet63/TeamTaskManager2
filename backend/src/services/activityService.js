const Activity = require("../models/Activity");

const logActivity = async ({ actorId, projectId, taskId = null, type, message, metadata }) => {
  try {
    await Activity.create({
      actor: actorId,
      project: projectId,
      task: taskId,
      type,
      message,
      metadata: metadata || {},
    });
  } catch (error) {
    console.error("Failed to store activity log:", error.message);
  }
};

module.exports = { logActivity };
