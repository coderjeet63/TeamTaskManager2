const { body } = require("express-validator");

const statusOptions = ["todo", "in-progress", "done"];
const priorityOptions = ["low", "medium", "high"];

const createTaskValidation = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Task title is required.")
    .isLength({ min: 3, max: 120 })
    .withMessage("Task title must be between 3 and 120 characters."),
  body("description")
    .optional()
    .trim()
    .isLength({ max: 1200 })
    .withMessage("Description cannot exceed 1200 characters."),
  body("project")
    .notEmpty()
    .withMessage("Project is required.")
    .isMongoId()
    .withMessage("Project must be a valid identifier."),
  body("assignedTo")
    .notEmpty()
    .withMessage("Assignee is required.")
    .isMongoId()
    .withMessage("Assignee must be a valid identifier."),
  body("dueDate")
    .notEmpty()
    .withMessage("Due date is required.")
    .isISO8601()
    .withMessage("Due date must be a valid date."),
  body("priority")
    .optional()
    .isIn(priorityOptions)
    .withMessage("Priority must be low, medium, or high."),
  body("status")
    .optional()
    .isIn(statusOptions)
    .withMessage("Status must be todo, in-progress, or done."),
];

const updateTaskValidation = [
  body("title")
    .optional()
    .trim()
    .isLength({ min: 3, max: 120 })
    .withMessage("Task title must be between 3 and 120 characters."),
  body("description")
    .optional()
    .trim()
    .isLength({ max: 1200 })
    .withMessage("Description cannot exceed 1200 characters."),
  body("assignedTo")
    .optional()
    .isMongoId()
    .withMessage("Assignee must be a valid identifier."),
  body("dueDate")
    .optional()
    .isISO8601()
    .withMessage("Due date must be a valid date."),
  body("priority")
    .optional()
    .isIn(priorityOptions)
    .withMessage("Priority must be low, medium, or high."),
  body("status")
    .optional()
    .isIn(statusOptions)
    .withMessage("Status must be todo, in-progress, or done."),
];

const updateTaskStatusValidation = [
  body("status")
    .notEmpty()
    .withMessage("Status is required.")
    .isIn(statusOptions)
    .withMessage("Status must be todo, in-progress, or done."),
];

module.exports = {
  createTaskValidation,
  updateTaskStatusValidation,
  updateTaskValidation,
};
