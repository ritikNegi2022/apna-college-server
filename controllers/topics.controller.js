import { Api_Response, async_handler } from "../utils/function_handlers.js";
import Topics from "../models/topics.model.js";
import Problems from "../models/problems.model.js";
import mongoose from "mongoose";

export const add_main_topics = async_handler(async (req, res) => {
  await Topics.create(req.body);
  return res.status(200).json(new Api_Response(200, null, "Topic is saved"));
});

export const add_suptopics = async_handler(async (req, res) => {
  await Problems.create(req.body);
  return res.status(200).json(new Api_Response(200, null, "Subtopic is saved"));
});

export const get_topics = async_handler(async (req, res) => {
  const { _id } = req.user;
  const { page = 1, limit = 10 } = req.query;
  const parsed_user_id = new mongoose.Types.ObjectId(`${_id}`);
  const topics = await Topics.aggregate([
    {
      $lookup: {
        from: "problems",
        localField: "_id",
        foreignField: "topic",
        as: "problems",
      },
    },
    {
      $project: {
        problems: {
          topic: 0,
          createdAt: 0,
          updatedAt: 0,
          __v: 0,
        },
      },
    },
    {
      $unwind: {
        path: "$problems",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: "progresses",
        let: { problemId: "$problems._id" },
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
        "problems.is_completed": {
          $cond: [
            { $gt: [{ $size: "$progressDoc" }, 0] },
            { $arrayElemAt: ["$progressDoc.is_completed", 0] },
            "$$REMOVE",
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
        _id: "$_id",
        title: { $first: "$title" },
        problems: { $push: "$problems" },
      },
    },
    {
      $addFields: {
        problems: {
          $filter: {
            input: "$problems",
            as: "p",
            cond: {
              $and: [
                { $ne: ["$$p", null] },
                { $ne: [{ $type: "$$p._id" }, "missing"] },
              ],
            },
          },
        },
      },
    },
    {
      $addFields: {
        "progress.all.total": { $size: "$problems" },
        "progress.all.completed": {
          $size: {
            $filter: {
              input: "$problems",
              as: "p",
              cond: { $eq: ["$$p.is_completed", true] },
            },
          },
        },
      },
    },
    {
      $addFields: {
        "progress.easy.total": {
          $size: {
            $filter: {
              input: "$problems",
              as: "p",
              cond: { $eq: ["$$p.difficulty", "Easy"] },
            },
          },
        },
        "progress.easy.completed": {
          $size: {
            $filter: {
              input: "$problems",
              as: "p",
              cond: {
                $and: [
                  { $eq: ["$$p.difficulty", "Easy"] },
                  { $eq: ["$$p.is_completed", true] },
                ],
              },
            },
          },
        },

        "progress.medium.total": {
          $size: {
            $filter: {
              input: "$problems",
              as: "p",
              cond: { $eq: ["$$p.difficulty", "Medium"] },
            },
          },
        },
        "progress.medium.completed": {
          $size: {
            $filter: {
              input: "$problems",
              as: "p",
              cond: {
                $and: [
                  { $eq: ["$$p.difficulty", "Medium"] },
                  { $eq: ["$$p.is_completed", true] },
                ],
              },
            },
          },
        },

        "progress.hard.total": {
          $size: {
            $filter: {
              input: "$problems",
              as: "p",
              cond: { $eq: ["$$p.difficulty", "Hard"] },
            },
          },
        },
        "progress.hard.completed": {
          $size: {
            $filter: {
              input: "$problems",
              as: "p",
              cond: {
                $and: [
                  { $eq: ["$$p.difficulty", "Hard"] },
                  { $eq: ["$$p.is_completed", true] },
                ],
              },
            },
          },
        },
      },
    },
    { $sort: { title: 1 } },
    { $skip: ((Number(page) || 1) - 1) * limit },
    { $limit: Number(limit) || 10 },
  ]);
  return res
    .status(200)
    .json(new Api_Response(200, topics, "Topics have been fetched"));
});
