import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import db from "./cofig/db.js";
import cookieParser from "cookie-parser";
import routes from "./routes/index.js";
import { error_handler } from "./utils/function_handlers.js";

dotenv.config();
const app = express();
const whitelist = ["http://localhost:3000", "https://apna-college-client.vercel.app"];
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) {
      callback(null, true);
    } else if (whitelist.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS for " + origin));
    }
  },
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json({ limit: "2mb" }));
app.use(cookieParser());

app.get("/api/v1/status", (_, res) => {
  return res
    .status(200)
    .json({ status: "OK", message: "Server is up and running." });
});

routes.forEach(({ route, router }) => {
  try {
    app.use("/api/v1/" + route, router);
  } catch (err) {
    console.log("Error while registering ", route, " ", err);
  }
});

app.use((_, res) => {
  return res.status(404).json({ success: false, message: "Not found!!!" });
});

app.use(error_handler);

const PORT = process.env.PORT || 5006;
db().then(() => {
  app.listen(PORT, () => {
    console.log(`Backend is running on port: ${PORT}`);
  });
});
