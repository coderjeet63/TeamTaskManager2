const Activity = require("../models/Activity");
const Project = require("../models/Project");
const Task = require("../models/Task");
const {
  buildAccessibleTaskFilter,
  getUserProjectScopes,
} = require("./accessService");

const fillTrendDays = (rows) => {
  const mapped = new Map(rows.map((row) => [row._id, row.completed]));
  const values = [];

  for (let offset = 6; offset >= 0; offset -= 1) {
    const day = new Date();
    day.setHours(0, 0, 0, 0);
    day.setDate(day.getDate() - offset);

    const key = day.toISOString().slice(0, 10);
    values.push({
      date: key,
      completed: mapped.get(key) || 0,
    });
  }

  return values;
};

const getDashboardOverview = async (user) => {
  const scopes = await getUserProjectScopes(user._id);
  const accessibleTaskFilter = buildAccessibleTaskFilter(user._id, scopes);
  const overdueFilter = {
    $and: [
      accessibleTaskFilter,
      {
        dueDate: { $lt: new Date() },
        status: { $ne: "done" },
      },
    ],
  };
  const last7Days = new Date();
  last7Days.setHours(0, 0, 0, 0);
  last7Days.setDate(last7Days.getDate() - 6);

  const [
    totalTasks,
    overdueTasks,
    assignedTasks,
    projectCount,
    completionStats,
    statusBreakdown,
    priorityBreakdown,
    tasksPerUser,
    completionTrend,
    recentActivity,
    overdueSnapshot,
  ] = await Promise.all([
    Task.countDocuments(accessibleTaskFilter),
    Task.countDocuments(overdueFilter),
    Task.countDocuments({
      $and: [accessibleTaskFilter, { assignedTo: user._id }],
    }),
    Project.countDocuments({ _id: { $in: scopes.projectIds } }),
    // Dashboard aggregation pipeline for analytics
    Task.aggregate([
      { $match: accessibleTaskFilter },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          completed: {
            $sum: {
              $cond: [{ $eq: ["$status", "done"] }, 1, 0],
            },
          },
        },
      },
    ]),
    Task.aggregate([
      { $match: accessibleTaskFilter },
      {
        $group: {
          _id: "$status",
          value: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),
    Task.aggregate([
      { $match: accessibleTaskFilter },
      {
        $group: {
          _id: "$priority",
          value: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),
    Task.aggregate([
      { $match: accessibleTaskFilter },
      {
        $group: {
          _id: "$assignedTo",
          value: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      {
        $project: {
          _id: 0,
          label: "$user.name",
          value: 1,
        },
      },
      { $sort: { value: -1 } },
    ]),
    Task.aggregate([
      {
        $match: {
          $and: [
            accessibleTaskFilter,
            {
              status: "done",
              updatedAt: { $gte: last7Days },
            },
          ],
        },
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$updatedAt",
            },
          },
          completed: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),
    Activity.find({ project: { $in: scopes.projectIds } })
      .sort({ createdAt: -1 })
      .limit(8)
      .populate("actor", "name email")
      .populate("project", "title")
      .populate("task", "title"),
    Task.find(overdueFilter)
      .sort({ dueDate: 1 })
      .limit(5)
      .populate("assignedTo", "name email")
      .populate("project", "title"),
  ]);

  const completion = completionStats[0] || { total: 0, completed: 0 };
  const completionRate = completion.total
    ? Math.round((completion.completed / completion.total) * 100)
    : 0;

  return {
    totals: {
      totalTasks,
      overdueTasks,
      assignedTasks,
      projects: projectCount,
      completionRate,
    },
    charts: {
      statusBreakdown,
      priorityBreakdown,
      tasksPerUser,
      completionTrend: fillTrendDays(completionTrend),
    },
    recentActivity,
    overdueSnapshot,
  };
};

module.exports = { getDashboardOverview };
