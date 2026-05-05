/**
 * ============================================================
 * PROJECT CONTROLLER
 * ============================================================
 * Handles all project-level operations.
 *
 * RBAC rules enforced here:
 *   - Any authenticated user can CREATE a project
 *     → creator is automatically added as ADMIN
 *   - Any project MEMBER (any role) can VIEW the project
 *   - Only project ADMIN can UPDATE, DELETE, ADD/REMOVE members
 *
 * Role assignment:
 *   - Creator     → role: "admin"  (set at creation time)
 *   - Added later → role: "member" (default, set in addMember)
 * ============================================================
 */

const { StatusCodes } = require("http-status-codes");

const Activity = require("../models/Activity");
const Project = require("../models/Project");
const Task = require("../models/Task");
const User = require("../models/User");
const { logActivity } = require("../services/activityService");
const {
  canManageProject,
  getProjectRole,
  isProjectMember,
  toComparableId,
} = require("../services/accessService");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");
const { getPagination } = require("../utils/pagination");

// ----------------------------------------------------------
// Aggregate task counts grouped by status for a list of projects.
// Used to show progress stats on project cards.
// ----------------------------------------------------------
const buildProjectStatsMap = async (projectIds) => {
  if (!projectIds.length) return new Map();

  const rows = await Task.aggregate([
    { $match: { project: { $in: projectIds } } },
    {
      $group: {
        _id: { project: "$project", status: "$status" },
        count: { $sum: 1 },
      },
    },
  ]);

  const stats = new Map();

  rows.forEach((row) => {
    const projectId = row._id.project.toString();
    if (!stats.has(projectId)) {
      stats.set(projectId, { total: 0, todo: 0, "in-progress": 0, done: 0 });
    }
    const current = stats.get(projectId);
    current.total += row.count;
    current[row._id.status] = row.count;
  });

  return stats;
};

// ----------------------------------------------------------
// Shape a project document into the API response format.
//
// RBAC: currentUserRole is derived from the DB role stored in
// the members array (or "admin" if the user is the creator).
// We do NOT override or guess roles here — we trust the DB.
// ----------------------------------------------------------
const formatProject = (project, taskStats, currentUserId) => {
  return {
    ...project,
    memberCount: project.members.length,
    taskStats: taskStats.get(project._id.toString()) || {
      total: 0,
      todo: 0,
      "in-progress": 0,
      done: 0,
    },

    // RBAC VALIDATION: resolve the current user's role for this project.
    // This is what the frontend uses to show/hide admin controls.
    currentUserRole: getProjectRole(project, currentUserId),

    // Return each member with their ACTUAL stored role from the DB.
    // Do NOT override member roles based on who is currently logged in —
    // that was the original bug that made every user appear as admin.
    members: (project.members || []).map((member) => ({
      ...member,
      role: member.role, // "admin" or "member" as stored in DB
    })),
  };
};

// ----------------------------------------------------------
// Fetch a project by ID and populate user references.
// Throws 404 if not found.
// ----------------------------------------------------------
const getProjectOrThrow = async (projectId) => {
  const project = await Project.findById(projectId)
    .populate("createdBy", "name email role")
    .populate("members.user", "name email role");

  if (!project) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Project not found.");
  }

  return project;
};

// ----------------------------------------------------------
// GET /projects
// List all projects the current user is a member of.
// Both ADMINs and MEMBERs can see their own projects.
// ----------------------------------------------------------
const listProjects = asyncHandler(async (req, res) => {
  const { search = "", page = 1, limit = 8 } = req.query;
  const { currentPage, pageSize, skip } = getPagination(page, limit);

  // RBAC VALIDATION: only return projects this user belongs to
  const query = { "members.user": req.user._id };

  if (search.trim()) {
    query.title = { $regex: search.trim(), $options: "i" };
  }

  const [projects, total] = await Promise.all([
    Project.find(query)
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(pageSize)
      .populate("createdBy", "name email role")
      .populate("members.user", "name email role")
      .lean(),
    Project.countDocuments(query),
  ]);

  const taskStats = await buildProjectStatsMap(
    projects.map((project) => project._id)
  );

  res.status(StatusCodes.OK).json({
    success: true,
    data: {
      projects: projects.map((project) =>
        formatProject(project, taskStats, req.user._id)
      ),
      pagination: {
        page: currentPage,
        limit: pageSize,
        total,
        totalPages: Math.ceil(total / pageSize) || 1,
      },
    },
  });
});

// ----------------------------------------------------------
// POST /projects
// Create a new project. The creator is automatically assigned
// the ADMIN role for this project by adding them to members
// with role: "admin". No other user gets admin by default.
// ----------------------------------------------------------
const createProject = asyncHandler(async (req, res) => {
  const project = await Project.create({
    title: req.body.title,
    description: req.body.description || "",
    createdBy: req.user._id,
    members: [
      {
        // RBAC: Creator automatically becomes ADMIN of this project
        user: req.user._id,
        role: "admin",
      },
    ],
  });

  await logActivity({
    actorId: req.user._id,
    projectId: project._id,
    type: "project_created",
    message: `${req.user.name} created ${project.title}.`,
  });

  const hydratedProject = await getProjectOrThrow(project._id);

  res.status(StatusCodes.CREATED).json({
    success: true,
    message: "Project created successfully.",
    data: {
      project: formatProject(
        hydratedProject.toObject(),
        new Map(),
        req.user._id
      ),
    },
  });
});

// ----------------------------------------------------------
// GET /projects/:projectId
// Any project member (ADMIN or MEMBER) can view the project.
// Non-members get 403 Forbidden.
// ----------------------------------------------------------
const getProject = asyncHandler(async (req, res) => {
  const project = await getProjectOrThrow(req.params.projectId);

  // RBAC VALIDATION: user must belong to this project to view it
  if (!isProjectMember(project, req.user._id)) {
    throw new ApiError(
      StatusCodes.FORBIDDEN,
      "You do not have access to this project."
    );
  }

  const taskStats = await buildProjectStatsMap([project._id]);

  res.status(StatusCodes.OK).json({
    success: true,
    data: {
      project: formatProject(project.toObject(), taskStats, req.user._id),
    },
  });
});

// ----------------------------------------------------------
// PATCH /projects/:projectId
// ADMIN PERMISSION CHECK: Only project ADMIN can update details.
// ----------------------------------------------------------
const updateProject = asyncHandler(async (req, res) => {
  const project = await getProjectOrThrow(req.params.projectId);

  // ADMIN PERMISSION CHECK
  if (!canManageProject(project, req.user._id)) {
    throw new ApiError(
      StatusCodes.FORBIDDEN,
      "Only project admins can update this project."
    );
  }

  if (typeof req.body.title !== "undefined") project.title = req.body.title;
  if (typeof req.body.description !== "undefined") project.description = req.body.description;

  await project.save();

  await logActivity({
    actorId: req.user._id,
    projectId: project._id,
    type: "project_updated",
    message: `${req.user.name} updated project details for ${project.title}.`,
  });

  res.status(StatusCodes.OK).json({
    success: true,
    message: "Project updated successfully.",
    data: {
      project: formatProject(project.toObject(), new Map(), req.user._id),
    },
  });
});

// ----------------------------------------------------------
// DELETE /projects/:projectId
// ADMIN PERMISSION CHECK: Only project ADMIN can delete.
// Also deletes all tasks and activity logs for this project.
// ----------------------------------------------------------
const deleteProject = asyncHandler(async (req, res) => {
  const project = await getProjectOrThrow(req.params.projectId);

  // ADMIN PERMISSION CHECK
  if (!canManageProject(project, req.user._id)) {
    throw new ApiError(
      StatusCodes.FORBIDDEN,
      "Only project admins can delete this project."
    );
  }

  await Promise.all([
    Task.deleteMany({ project: project._id }),
    Activity.deleteMany({ project: project._id }),
    Project.findByIdAndDelete(project._id),
  ]);

  res.status(StatusCodes.OK).json({
    success: true,
    message: "Project deleted successfully.",
  });
});

// ----------------------------------------------------------
// POST /projects/:projectId/members
// ADMIN PERMISSION CHECK: Only project ADMIN can add members.
// New members are always assigned role: "member" by default.
// ----------------------------------------------------------
const addMember = asyncHandler(async (req, res) => {
  const project = await getProjectOrThrow(req.params.projectId);

  // ADMIN PERMISSION CHECK
  if (!canManageProject(project, req.user._id)) {
    throw new ApiError(
      StatusCodes.FORBIDDEN,
      "Only project admins can manage members."
    );
  }

  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    throw new ApiError(StatusCodes.NOT_FOUND, "No user exists with that email address.");
  }

  if (project.members.some((member) => member.user._id.equals(user._id))) {
    throw new ApiError(StatusCodes.CONFLICT, "That user is already in this project.");
  }

  project.members.push({
    user: user._id,
    role: "member", // RBAC: all newly added users get MEMBER role
  });

  await project.save();
  await project.populate("members.user", "name email role");

  await logActivity({
    actorId: req.user._id,
    projectId: project._id,
    type: "member_added",
    message: `${req.user.name} added ${user.name} to ${project.title}.`,
    metadata: { addedUserId: user._id },
  });

  res.status(StatusCodes.OK).json({
    success: true,
    message: "Member added successfully.",
    data: {
      project: formatProject(project.toObject(), new Map(), req.user._id),
    },
  });
});

// ----------------------------------------------------------
// DELETE /projects/:projectId/members/:userId
// ADMIN PERMISSION CHECK: Only project ADMIN can remove members.
// The project creator can never be removed.
// Tasks assigned to removed member are re-assigned to creator.
// ----------------------------------------------------------
const removeMember = asyncHandler(async (req, res) => {
  const project = await getProjectOrThrow(req.params.projectId);

  // ADMIN PERMISSION CHECK
  if (!canManageProject(project, req.user._id)) {
    throw new ApiError(
      StatusCodes.FORBIDDEN,
      "Only project admins can manage members."
    );
  }

  // Protect the project creator from being removed
  if (project.createdBy._id.equals(req.params.userId)) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "The project creator cannot be removed from the project."
    );
  }

  const memberToRemove = project.members.find((member) =>
    member.user._id.equals(req.params.userId)
  );

  if (!memberToRemove) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Member not found in this project.");
  }

  project.members = project.members.filter(
    (member) => !member.user._id.equals(req.params.userId)
  );

  await project.save();

  // Re-assign removed member's tasks to the project creator
  await Task.updateMany(
    { project: project._id, assignedTo: req.params.userId },
    { assignedTo: project.createdBy._id }
  );

  await logActivity({
    actorId: req.user._id,
    projectId: project._id,
    type: "member_removed",
    message: `${req.user.name} removed a member from ${project.title}.`,
    metadata: { removedUserId: req.params.userId },
  });

  res.status(StatusCodes.OK).json({
    success: true,
    message: "Member removed successfully.",
  });
});

module.exports = {
  addMember,
  createProject,
  deleteProject,
  getProject,
  listProjects,
  removeMember,
  updateProject,
};