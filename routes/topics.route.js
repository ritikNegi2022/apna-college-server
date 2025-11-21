import express from "express";
import verify_tokens from "../middleware/auth.middleware.js";
import {
  add_main_topics,
  add_suptopics,
  get_topics,
} from "../controllers/topics.controller.js";

const Router = express.Router();

Router.use(verify_tokens);
Router.post("/add", add_main_topics);
Router.post("/subtopics/add", add_suptopics);
Router.get("/", get_topics);

export default Router;
