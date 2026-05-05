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

const buildProjectStatsMap = async (projectIds) => {
  if (!projectIds.length) {
    return new Map();
  }

  const rows = await Task.aggregate([
    {
      $match: {
        project: {
          $in: projectIds,
        },
      },
    },
    {
      $group: {
        _id: {
          project: "$project",
          status: "$status",
        },
        count: { $sum: 1 },
      },
    },
  ]);

  const stats = new Map();

  rows.forEach((row) => {
    const projectId = row._id.project.toString();

    if (!stats.has(projectId)) {
      stats.set(projectId, {
        total: 0,
        todo: 0,
        "in-progress": 0,
        done: 0,
      });
    }

    const current = stats.get(projectId);
    current.total += row.count;
    current[row._id.status] = row.count;
  });

  return stats;
};

const formatProject = (project, taskStats, currentUserId) => {
  const comparableUserId = toComparableId(currentUserId);

  return {
    ...project,
    memberCount: project.members.length,
    taskStats: taskStats.get(project._id.toString()) || {
      total: 0,
      todo: 0,
      "in-progress": 0,
      done: 0,
    },
    currentUserRole: getProjectRole(project, currentUserId),
    members: (project.members || []).map((member) => ({
      ...member,
      role:
        toComparableId(member.user?._id || member.user) === comparableUserId
          ? "admin"
          : "member",
    })),
  };
};

const getProjectOrThrow = async (projectId) => {
  const project = await Project.findById(projectId)
    .populate("createdBy", "name email role")
    .populate("members.user", "name email role");

  if (!project) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Project not found.");
  }

  return project;
};

const listProjects = asyncHandler(async (req, res) => {
  const { search = "", page = 1, limit = 8 } = req.query;
  const { currentPage, pageSize, skip } = getPagination(page, limit);

  const query = {
    "members.user": req.user._id,
  };

  if (search.trim()) {
    query.title = {
      $regex: search.trim(),
      $options: "i",
    };
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

  const taskStats = await buildProjectStatsMap(projects.map((project) => project._id));

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

const createProject = asyncHandler(async (req, res) => {
  const project = await Project.create({
    title: req.body.title,
    description: req.body.description || "",
    createdBy: req.user._id,
    members: [
      {
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
      project: formatProject(hydratedProject.toObject(), new Map(), req.user._id),
    },
  });
});

const getProject = asyncHandler(async (req, res) => {
  const project = await getProjectOrThrow(req.params.projectId);

  // Prevent unauthorized project access
  if (!isProjectMember(project, req.user._id)) {
    throw new ApiError(StatusCodes.FORBIDDEN, "You do not have access to this project.");
  }

  const [taskStats] = await Promise.all([
    buildProjectStatsMap([project._id]),
  ]);

  res.status(StatusCodes.OK).json({
    success: true,
    data: {
      project: formatProject(project.toObject(), taskStats, req.user._id),
    },
  });
});

const updateProject = asyncHandler(async (req, res) => {
  const project = await getProjectOrThrow(req.params.projectId);

  if (!canManageProject(project, req.user._id)) {
    throw new ApiError(StatusCodes.FORBIDDEN, "Only project admins can update this project.");
  }

  if (typeof req.body.title !== "undefined") {
    project.title = req.body.title;
  }

  if (typeof req.body.description !== "undefined") {
    project.description = req.body.description;
  }

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

const deleteProject = asyncHandler(async (req, res) => {
  const project = await getProjectOrThrow(req.params.projectId);

  if (!canManageProject(project, req.user._id)) {
    throw new ApiError(StatusCodes.FORBIDDEN, "Only project admins can delete this project.");
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

const addMember = asyncHandler(async (req, res) => {
  const project = await getProjectOrThrow(req.params.projectId);

  if (!canManageProject(project, req.user._id)) {
    throw new ApiError(StatusCodes.FORBIDDEN, "Only project admins can manage members.");
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
    role: "member",
  });

  await project.save();
  await project.populate("members.user", "name email role");

  await logActivity({
    actorId: req.user._id,
    projectId: project._id,
    type: "member_added",
    message: `${req.user.name} added ${user.name} to ${project.title}.`,
    metadata: {
      addedUserId: user._id,
    },
  });

  res.status(StatusCodes.OK).json({
    success: true,
    message: "Member added successfully.",
    data: {
      project: formatProject(project.toObject(), new Map(), req.user._id),
    },
  });
});

const removeMember = asyncHandler(async (req, res) => {
  const project = await getProjectOrThrow(req.params.projectId);

  if (!canManageProject(project, req.user._id)) {
    throw new ApiError(StatusCodes.FORBIDDEN, "Only project admins can manage members.");
  }

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

  await Task.updateMany(
    {
      project: project._id,
      assignedTo: req.params.userId,
    },
    {
      assignedTo: project.createdBy._id,
    }
  );

  await logActivity({
    actorId: req.user._id,
    projectId: project._id,
    type: "member_removed",
    message: `${req.user.name} removed a member from ${project.title}.`,
    metadata: {
      removedUserId: req.params.userId,
    },
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
