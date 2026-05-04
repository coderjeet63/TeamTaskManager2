const express = require("express");

const {
  createTask,
  deleteTask,
  getTask,
  listTasks,
  updateTask,
  updateTaskStatus,
} = require("../controllers/taskController");
const { authenticate } = require("../middlewares/authMiddleware");
const { validateObjectId } = require("../middlewares/objectIdMiddleware");
const validateRequest = require("../middlewares/validateRequest");
const {
  createTaskValidation,
  updateTaskStatusValidation,
  updateTaskValidation,
} = require("../validations/taskValidations");

const router = express.Router();

router.use(authenticate);

router.route("/").get(listTasks).post(createTaskValidation, validateRequest, createTask);

router.patch(
  "/:taskId/status",
  validateObjectId("taskId"),
  updateTaskStatusValidation,
  validateRequest,
  updateTaskStatus
);

router
  .route("/:taskId")
  .all(validateObjectId("taskId"))
  .get(getTask)
  .patch(updateTaskValidation, validateRequest, updateTask)
  .delete(deleteTask);

module.exports = router;
