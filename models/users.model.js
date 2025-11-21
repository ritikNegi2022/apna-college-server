import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const users_schema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: [true, "This email address is already registered."],
    },
    password: {
      type: String,
      required: true,
    },
    refresh_token: {
      type: String,
    },
  },
  { timestamps: true },
);

users_schema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

users_schema.methods.is_password_correct = async function (password) {
  return await bcrypt.compare(password, this.password);
};

users_schema.methods.generate_access_token = function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY },
  );
};

users_schema.methods.generate_refresh_token = function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRY },
  );
};

const Users = mongoose.model("users", users_schema);

export default Users;
