import mongoose from "mongoose";

const connect_to_db = async () => {
  try {
    await mongoose.connect(process.env.DB_URL);
    console.log("Server connecedt to database successfully!!!");
  } catch (err) {
    console.log("Error while connection to db " + err);
    process.exit(1);
  }
};

export default connect_to_db;
