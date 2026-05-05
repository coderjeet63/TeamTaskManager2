const Project = require("../models/Project");

const toComparableId = (value) => {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (value._id) return value._id.toString();
  return value.toString();
};

const memberHasUserId = (member, userId) =>
  toComparableId(member.user) === toComparableId(userId);

const isProjectCreator = (project, userId) =>
  toComparableId(project.createdBy) === toComparableId(userId);

const getProjectMembership = (project, userId) =>
  project.members.find((member) => memberHasUserId(member, userId));

// ✅ FIXED: returns the actual role stored in DB
// Previously this was broken — it returned "admin" for ALL members
const getProjectRole = (project, userId) => {
  // Creator is always ADMIN
  if (isProjectCreator(project, userId)) {
    return "admin";
  }
  // Read the actual role from the members array in DB
  const membership = getProjectMembership(project, userId);
  if (membership) {
    return membership.role; // "admin" or "member" as stored
  }
  // Not a member of this project at all
  return null;
};

const isProjectMember = (project, userId) =>
  isProjectCreator(project, userId) ||
  project.members.some((member) => memberHasUserId(member, userId));

// Only ADMIN role can manage project (add/remove members, delete, create tasks)
const canManageProject = (project, userId) =>
  getProjectRole(project, userId) === "admin";

// Only ADMIN of the task's project can do full task CRUD
const canManageTask = (task, scopes) =>
  scopes.adminProjectIds.includes(toComparableId(task.project));

// MEMBER can only update status of tasks assigned specifically to them
const isTaskAssignee = (task, userId) =>
  toComparableId(task.assignedTo) === toComparableId(userId);

const getUserProjectScopes = async (userId) => {
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
    } else if (role === "member") {
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
    // ADMIN sees ALL tasks in their projects
    conditions.push({ project: { $in: scopes.adminProjectIds } });
  }

  if (scopes.memberProjectIds.length) {
    // MEMBER sees ONLY tasks assigned to them
    conditions.push({
      project: { $in: scopes.memberProjectIds },
      assignedTo: toComparableId(userId),
    });
  }

  return conditions.length === 1 ? conditions[0] : { $or: conditions };
};

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