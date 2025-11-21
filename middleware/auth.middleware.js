import Users from "../models/users.model.js";
import { Api_Error, async_handler } from "../utils/function_handlers.js";
import jwt from "jsonwebtoken";

const verify_tokens = async_handler(async (req, _, next) => {
  try {
    const access_token =
      req.cookies?.access_token ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (!access_token) {
      throw new Api_Error(401, "Unauthorized request.");
    }

    const token_data = jwt.verify(
      access_token,
      process.env.ACCESS_TOKEN_SECRET,
    );

    const user = await Users.findById(token_data?._id).select(
      "-password -refresh_token",
    );

    if (!user) {
      throw new Api_Error(401, "Invalid access token.");
    }

    req.user = user;

    next();
  } catch (err) {
    throw new Api_Error(401, err.message);
  }
});

export default verify_tokens;
