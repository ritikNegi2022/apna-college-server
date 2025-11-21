import express from "express";
import verify_tokens from "../middleware/auth.middleware.js";
import {
  overall_progress,
  toggle_completed,
} from "../controllers/progress.controller.js";

const Router = express.Router();
Router.use(verify_tokens);
Router.put("/toggle", toggle_completed);
Router.get("/", overall_progress);

export default Router;
