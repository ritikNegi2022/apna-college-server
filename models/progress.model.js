import mongoose from "mongoose";

const progress_schema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    problem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "problems",
      required: true,
    },
    is_completed: { type: Boolean, default: true },
  },
  { timestamps: true },
);

progress_schema.index({ user: 1, problem: 1 }, { unique: true });

const Progress = mongoose.model("progress", progress_schema);

export default Progress;
