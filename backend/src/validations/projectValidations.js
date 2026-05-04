const { body } = require("express-validator");

const createProjectValidation = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Project title is required.")
    .isLength({ min: 3, max: 80 })
    .withMessage("Project title must be between 3 and 80 characters."),
  body("description")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Description cannot exceed 500 characters."),
];

const updateProjectValidation = [
  body("title")
    .optional()
    .trim()
    .isLength({ min: 3, max: 80 })
    .withMessage("Project title must be between 3 and 80 characters."),
  body("description")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Description cannot exceed 500 characters."),
];

const addMemberValidation = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Member email is required.")
    .isEmail()
    .withMessage("A valid member email is required.")
    .normalizeEmail(),
];

module.exports = {
  addMemberValidation,
  createProjectValidation,
  updateProjectValidation,
};
