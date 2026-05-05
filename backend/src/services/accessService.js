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

const memberHasUserId = (member, userId) =>
  toComparableId(member.user) === toComparableId(userId);

const isProjectCreator = (project, userId) =>
  toComparableId(project.createdBy) === toComparableId(userId);

const getProjectMembership = (project, userId) =>
  project.members.find((member) => memberHasUserId(member, userId));

const getProjectRole = (project, userId) => {
  if (isProjectMember(project, userId)) {
    return "admin";
  }

  return "member";
};

const getUserProjectScopes = async (userId) => {
  // RBAC middleware checks whether user is admin or member by loading project membership scopes
  const projects = await Project.find({
    $or: [{ createdBy: userId }, { "members.user": userId }],
  }).select("_id createdBy members");

  const scopes = {
    projectIds: [],
    adminProjectIds: [],
    memberProjectIds: [],
  };

  projects.forEach((project) => {
    const projectId = project._id.toString();
    const role = getProjectRole(project, userId);

    scopes.projectIds.push(projectId);

    if (role === "admin") {
      scopes.adminProjectIds.push(projectId);
      return;
    }

    if (role === "member") {
      scopes.memberProjectIds.push(projectId);
    }
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
  isProjectCreator(project, userId) ||
  project.members.some((member) => memberHasUserId(member, userId));

const canManageProject = (project, userId) =>
  getProjectRole(project, userId) === "admin";

const canManageTask = (task, scopes) =>
  scopes.adminProjectIds.includes(toComparableId(task.project));

const isTaskAssignee = (task, userId) =>
  toComparableId(task.assignedTo) === toComparableId(userId);

module.exports = {
  buildAccessibleTaskFilter,
  canManageProject,
  canManageTask,
  getProjectRole,
  getUserProjectScopes,
  isProjectMember,
  isTaskAssignee,
  toComparableId,
};
