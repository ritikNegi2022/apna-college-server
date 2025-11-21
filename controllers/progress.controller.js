import { Api_Response, async_handler } from "../utils/function_handlers.js";
import Progress from "../models/progress.model.js";
import mongoose from "mongoose";
import Problems from "../models/problems.model.js";

export const toggle_completed = async_handler(async (req, res) => {
  const { problem, is_completed } = req.body;
  await Progress.findOneAndUpdate(
    { user: req.user._id, problem },
    { $set: { is_completed } },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );
  return res
    .status(200)
    .json(new Api_Response(200, null, "Your progress is saved."));
});

export const overall_progress = async_handler(async (req, res) => {
  const { _id } = req.user;
  const parsed_user_id = new mongoose.Types.ObjectId(`${_id}`);
  const progress = await Problems.aggregate([
    {
      $lookup: {
        from: "progresses",
        let: { problemId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$problem", "$$problemId"] },
                  { $eq: ["$user", parsed_user_id] },
                ],
              },
            },
          },
        ],
        as: "progressDoc",
      },
    },

    {
      $addFields: {
        is_completed: {
          $cond: [
            { $gt: [{ $size: "$progressDoc" }, 0] },
            { $arrayElemAt: ["$progressDoc.is_completed", 0] },
            false,
          ],
        },
      },
    },
    {
      $project: {
        progressDoc: 0,
      },
    },

    {
      $group: {
        _id: null,

        totalProblems: { $sum: 1 },
        completedProblems: {
          $sum: {
            $cond: ["$is_completed", 1, 0],
          },
        },

        easyTotal: {
          $sum: {
            $cond: [{ $eq: ["$difficulty", "Easy"] }, 1, 0],
          },
        },
        easyCompleted: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $eq: ["$difficulty", "Easy"] },
                  { $eq: ["$is_completed", true] },
                ],
              },
              1,
              0,
            ],
          },
        },

        mediumTotal: {
          $sum: {
            $cond: [{ $eq: ["$difficulty", "Medium"] }, 1, 0],
          },
        },
        mediumCompleted: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $eq: ["$difficulty", "Medium"] },
                  { $eq: ["$is_completed", true] },
                ],
              },
              1,
              0,
            ],
          },
        },

        hardTotal: {
          $sum: {
            $cond: [{ $eq: ["$difficulty", "Hard"] }, 1, 0],
          },
        },
        hardCompleted: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $eq: ["$difficulty", "Hard"] },
                  { $eq: ["$is_completed", true] },
                ],
              },
              1,
              0,
            ],
          },
        },
      },
    },
    {
      $project: {
        _id: 0,
        all: {
          total: "$totalProblems",
          completed: "$completedProblems",
        },
        easy: {
          total: "$easyTotal",
          completed: "$easyCompleted",
        },
        medium: {
          total: "$mediumTotal",
          completed: "$mediumCompleted",
        },
        hard: {
          total: "$hardTotal",
          completed: "$hardCompleted",
        },
      },
    },
  ]);

  return res
    .status(200)
    .json(new Api_Response(200, progress, "Your progress is fetched."));
});
