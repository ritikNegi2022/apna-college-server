import Users from "../models/users.model.js";
import {
  Api_Error,
  Api_Response,
  async_handler,
} from "../utils/function_handlers.js";
import jwt from "jsonwebtoken";

const generate_access_and_refresh_token = async (user_id) => {
  try {
    const user = await Users.findById(user_id);
    const access_token = await user.generate_access_token();
    const refresh_token = await user.generate_refresh_token();
    user.refresh_token = refresh_token;
    await user.save({ validateBeforeSave: false });
    return { access_token, refresh_token };
  } catch (err) {
    throw new Api_Error(
      500,
      "Something went wrong while generating access token and refresh token",
    );
  }
};

const options = { httpOnly: true, secure: true, sameSite: 'none' };

export const register_user = async_handler(async (req, res) => {
  const { name, email, password } = req.body;
  if ([name, email, password].some((field) => field?.trim() === "")) {
    throw new Api_Error(400, "All fields are required.");
  }
  await Users.create({ name, email, password });
  return res
    .status(201)
    .json(
      new Api_Response(201, null, "User has been registered successfully."),
    );
});

export const login_user = async_handler(async (req, res) => {
  const { email, password } = req.body;

  if (!email) {
    throw new Api_Error(400, "Email is required to login.");
  }

  if (!password) {
    throw new Api_Error(400, "Password is required to login.");
  }

  const user = await Users.findOne({ email });

  if (!user) {
    throw new Api_Error(404, "User not found.");
  }

  const is_password_valid = await user.is_password_correct(password);

  if (!is_password_valid) {
    throw new Api_Error(403, "Inavlid user credentials");
  }

  const { access_token, refresh_token } =
    await generate_access_and_refresh_token(user._id);

  return res
    .status(200)
    .cookie("access_token", access_token, options)
    .cookie("refresh_token", refresh_token, options)
    .json(
      new Api_Response(
        200,
        { name: user.name, email: user.email },
        "User is authenticated.",
      ),
    );
});

export const logout_user = async_handler(async (req, res) => {
  await Users.findByIdAndUpdate(req.user._id, {
    $set: { refresh_token: null },
  });

  return res
    .status(200)
    .clearCookie("access_token", options)
    .clearCookie("refresh_token", options)
    .json(new Api_Response(200, null, "User is logged out."));
});

export const refresh_access_token = async_handler(async (req, res) => {
  const user_refresh_token =
    req.cookies?.refresh_token || req.body?.refresh_token;

  if (!user_refresh_token) {
    throw new Api_Error(401, "Unauthorized request");
  }
  try {
    const decoded_token = jwt.verify(
      user_refresh_token,
      process.env.REFRESH_TOKEN_SECRET,
    );

    const user = await Users.findById(decoded_token?._id);

    if (!user) {
      throw new Api_Error(401, "Invalid refresh token");
    }

    if (user.refresh_token !== user_refresh_token) {
      throw new Api_Error(401, "Invalid refresh token");
    }

    const { refresh_token, access_token } =
      await generate_access_and_refresh_token(user._id);

    return res
      .status(200)
      .cookie("access_token", access_token, options)
      .cookie("refresh_token", refresh_token, options)
      .json(new Api_Response(200, null, "New access token is generated"));
  } catch (err) {
    throw new Api_Error(401, err.message);
  }
});

export const session = async_handler(async (req, res) => {
  return res
    .status(200)
    .json(
      new Api_Response(
        200,
        { name: req.user.name, email: req.user.email },
        "User is already logged in.",
      ),
    );
});
