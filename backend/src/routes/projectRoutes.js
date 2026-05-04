const express = require("express");

const {
  addMember,
  createProject,
  deleteProject,
  getProject,
  listProjects,
  removeMember,
  updateProject,
} = require("../controllers/projectController");
const { authenticate } = require("../middlewares/authMiddleware");
const { validateObjectId } = require("../middlewares/objectIdMiddleware");
const validateRequest = require("../middlewares/validateRequest");
const {
  addMemberValidation,
  createProjectValidation,
  updateProjectValidation,
} = require("../validations/projectValidations");

const router = express.Router();

router.use(authenticate);

router
  .route("/")
  .get(listProjects)
  .post(createProjectValidation, validateRequest, createProject);

router
  .route("/:projectId")
  .all(validateObjectId("projectId"))
  .get(getProject)
  .patch(updateProjectValidation, validateRequest, updateProject)
  .delete(deleteProject);

router.post(
  "/:projectId/members",
  validateObjectId("projectId"),
  addMemberValidation,
  validateRequest,
  addMember
);

router.delete(
  "/:projectId/members/:userId",
  validateObjectId("projectId"),
  validateObjectId("userId"),
  removeMember
);

module.exports = router;
