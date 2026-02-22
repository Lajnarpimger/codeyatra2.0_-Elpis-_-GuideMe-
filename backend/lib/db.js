import { ENV } from "./env.js";
import mongoose from "mongoose";

export const DBConnection = async () => {
  try {
    if (!ENV.MONGO_URL) {
      throw new Error("No mongoDB url");
    }
    const mongoDb = await mongoose.connect(ENV.MONGO_URL);
    console.log("DB connected", mongoDb.connection.host);
  } catch (error) {
    console.error("DB not connected", error);
    process.exit(1);
  }
};
