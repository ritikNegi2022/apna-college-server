import mongoose from "mongoose";

const problems_schema = new mongoose.Schema(
  {
    topic: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "topics",
      required: true,
    },
    title: { type: String, required: true },
    youtube: { type: String, required: true },
    practice: { type: String, required: true },
    reference: { type: String, required: true },
    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard"],
      required: true,
    },
  },
  { timestamps: true },
);

const Problems = mongoose.model("problems", problems_schema);
export default Problems;
