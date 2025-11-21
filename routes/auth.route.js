import express from "express";
import verfiy_token from "../middleware/auth.middleware.js";
import {
  login_user,
  logout_user,
  refresh_access_token,
  register_user,
  session,
} from "../controllers/auth.controller.js";

const Router = express.Router();

Router.post("/register", register_user);
Router.post("/login", login_user);
Router.post("/logout", verfiy_token, logout_user);
Router.post("/token-refresh", refresh_access_token);
Router.get("/session", verfiy_token, session);

export default Router;
