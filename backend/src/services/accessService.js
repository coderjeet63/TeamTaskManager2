const Project = require("../models/Project");

const toComparableId = (value) => {
  if (!value) {
    return "";
  }

  if (typeof value === "string") {
    return value;
  }

  if (value._id) {
    return value._id.toString();
  }

  return value.toString();
};

const getUserProjectScopes = async (userId) => {
  // RBAC middleware checks whether user is admin or member by loading project membership scopes
  const comparableUserId = toComparableId(userId);
  const projects = await Project.find({ "members.user": userId }).select("_id members");

  const scopes = {
    projectIds: [],
    adminProjectIds: [],
    memberProjectIds: [],
  };

  projects.forEach((project) => {
    const projectId = project._id.toString();
    const membership = project.members.find(
      (member) => member.user.toString() === comparableUserId
    );

    scopes.projectIds.push(projectId);

    if (membership?.role === "admin") {
      scopes.adminProjectIds.push(projectId);
      return;
    }

    scopes.memberProjectIds.push(projectId);
  });

  return scopes;
};

const buildAccessibleTaskFilter = (userId, scopes) => {
  if (!scopes.projectIds.length) {
    return { _id: null };
  }

  const conditions = [];

  if (scopes.adminProjectIds.length) {
    conditions.push({ project: { $in: scopes.adminProjectIds } });
  }

  if (scopes.memberProjectIds.length) {
    conditions.push({
      project: { $in: scopes.memberProjectIds },
      assignedTo: toComparableId(userId),
    });
  }

  return conditions.length === 1 ? conditions[0] : { $or: conditions };
};

const isProjectMember = (project, userId) =>
  project.members.some((member) => member.user.toString() === toComparableId(userId));

const canManageProject = (project, userId) =>
  project.members.some(
    (member) =>
      member.user.toString() === toComparableId(userId) && member.role === "admin"
  );

const canManageTask = (task, scopes) =>
  scopes.adminProjectIds.includes(toComparableId(task.project));

const isTaskAssignee = (task, userId) =>
  toComparableId(task.assignedTo) === toComparableId(userId);

module.exports = {
  buildAccessibleTaskFilter,
  canManageProject,
  canManageTask,
  getUserProjectScopes,
  isProjectMember,
  isTaskAssignee,
  toComparableId,
};
