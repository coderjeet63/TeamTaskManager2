const { StatusCodes } = require("http-status-codes");

const Project = require("../models/Project");
const Task = require("../models/Task");
const { logActivity } = require("../services/activityService");
const {
  buildAccessibleTaskFilter,
  canManageProject,
  canManageTask,
  getUserProjectScopes,
  isProjectMember,
  isTaskAssignee,
} = require("../services/accessService");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");
const { getPagination } = require("../utils/pagination");

const TASK_POPULATE = [
  // Optimized query using populate for relationships
  { path: "assignedTo", select: "name email role" },
  { path: "createdBy", select: "name email role" },
  { path: "project", select: "title" },
];

const populateTask = async (task) => task.populate(TASK_POPULATE);

const updateTaskStatusFields = (task, status) => {
  // Task status workflow management
  task.status = status;
  task.completedAt = status === "done" ? new Date() : null;
};

const createTask = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.body.project).select("title members");

  if (!project) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Project not found.");
  }

  if (!canManageProject(project, req.user._id)) {
    throw new ApiError(StatusCodes.FORBIDDEN, "Only project admins can create tasks.");
  }

  if (!isProjectMember(project, req.body.assignedTo)) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "Tasks can only be assigned to users within the same project."
    );
  }

  const task = await Task.create({
    title: req.body.title,
    description: req.body.description || "",
    project: req.body.project,
    assignedTo: req.body.assignedTo,
    createdBy: req.user._id,
    dueDate: req.body.dueDate,
    priority: req.body.priority || "medium",
    status: req.body.status || "todo",
    completedAt: req.body.status === "done" ? new Date() : null,
  });

  await logActivity({
    actorId: req.user._id,
    projectId: project._id,
    taskId: task._id,
    type: "task_created",
    message: `${req.user.name} created task ${task.title}.`,
  });

  await populateTask(task);

  res.status(StatusCodes.CREATED).json({
    success: true,
    message: "Task created successfully.",
    data: {
      task,
    },
  });
});

const listTasks = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, projectId, search = "", status, priority, assignedTo } =
    req.query;
  const { currentPage, pageSize, skip } = getPagination(page, limit);
  const scopes = await getUserProjectScopes(req.user._id);
  const filters = [buildAccessibleTaskFilter(req.user._id, scopes)];

  if (projectId) {
    filters.push({ project: projectId });
  }

  if (status) {
    filters.push({ status });
  }

  if (priority) {
    filters.push({ priority });
  }

  if (assignedTo) {
    filters.push({ assignedTo });
  }

  if (search.trim()) {
    filters.push({
      $or: [
        { title: { $regex: search.trim(), $options: "i" } },
        { description: { $regex: search.trim(), $options: "i" } },
      ],
    });
  }

  const query = filters.length === 1 ? filters[0] : { $and: filters };

  const [tasks, total] = await Promise.all([
    Task.find(query)
      .sort({ dueDate: 1, createdAt: -1 })
      .skip(skip)
      .limit(pageSize)
      .populate(TASK_POPULATE),
    Task.countDocuments(query),
  ]);

  res.status(StatusCodes.OK).json({
    success: true,
    data: {
      tasks,
      pagination: {
        page: currentPage,
        limit: pageSize,
        total,
        totalPages: Math.ceil(total / pageSize) || 1,
      },
    },
  });
});

const getTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.taskId).populate(TASK_POPULATE);

  if (!task) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Task not found.");
  }

  const scopes = await getUserProjectScopes(req.user._id);

  if (!canManageTask(task, scopes) && !isTaskAssignee(task, req.user._id)) {
    throw new ApiError(StatusCodes.FORBIDDEN, "You do not have access to this task.");
  }

  res.status(StatusCodes.OK).json({
    success: true,
    data: {
      task,
    },
  });
});

const updateTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.taskId);

  if (!task) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Task not found.");
  }

  const scopes = await getUserProjectScopes(req.user._id);
  const adminAccess = canManageTask(task, scopes);
  const assigneeAccess = isTaskAssignee(task, req.user._id);

  if (!adminAccess && !assigneeAccess) {
    throw new ApiError(StatusCodes.FORBIDDEN, "You do not have permission to update this task.");
  }

  const requestedFields = Object.keys(req.body).filter(
    (field) => typeof req.body[field] !== "undefined"
  );

  if (!adminAccess) {
    const hasRestrictedField = requestedFields.some((field) => field !== "status");

    if (hasRestrictedField) {
      throw new ApiError(
        StatusCodes.FORBIDDEN,
        "Members can only update the status of tasks assigned to them."
      );
    }
  }

  if (adminAccess) {
    if (typeof req.body.title !== "undefined") {
      task.title = req.body.title;
    }

    if (typeof req.body.description !== "undefined") {
      task.description = req.body.description;
    }

    if (typeof req.body.priority !== "undefined") {
      task.priority = req.body.priority;
    }

    if (typeof req.body.dueDate !== "undefined") {
      task.dueDate = req.body.dueDate;
    }

    if (typeof req.body.assignedTo !== "undefined") {
      const project = await Project.findById(task.project).select("members");

      if (!project || !isProjectMember(project, req.body.assignedTo)) {
        throw new ApiError(
          StatusCodes.BAD_REQUEST,
          "Tasks can only be assigned to project members."
        );
      }

      task.assignedTo = req.body.assignedTo;
    }
  }

  if (typeof req.body.status !== "undefined") {
    updateTaskStatusFields(task, req.body.status);
  }

  await task.save();
  await populateTask(task);

  await logActivity({
    actorId: req.user._id,
    projectId: task.project._id,
    taskId: task._id,
    type: "task_updated",
    message: `${req.user.name} updated task ${task.title}.`,
    metadata: {
      status: task.status,
      priority: task.priority,
    },
  });

  res.status(StatusCodes.OK).json({
    success: true,
    message: "Task updated successfully.",
    data: {
      task,
    },
  });
});

const updateTaskStatus = asyncHandler(async (req, res, next) => {
  req.body = { status: req.body.status };
  return updateTask(req, res, next);
});

const deleteTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.taskId);

  if (!task) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Task not found.");
  }

  const scopes = await getUserProjectScopes(req.user._id);

  if (!canManageTask(task, scopes)) {
    throw new ApiError(StatusCodes.FORBIDDEN, "Only project admins can delete tasks.");
  }

  const taskTitle = task.title;
  const projectId = task.project;
  const taskId = task._id;

  await task.deleteOne();

  await logActivity({
    actorId: req.user._id,
    projectId,
    taskId,
    type: "task_deleted",
    message: `${req.user.name} deleted task ${taskTitle}.`,
  });

  res.status(StatusCodes.OK).json({
    success: true,
    message: "Task deleted successfully.",
  });
});

module.exports = {
  createTask,
  deleteTask,
  getTask,
  listTasks,
  updateTask,
  updateTaskStatus,
};
