import mongoose from "mongoose";

const topics_schema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
  },
  { timestamps: true },
);

const Topics = mongoose.model("topics", topics_schema);

export default Topics;
