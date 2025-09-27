import mongoose from "mongoose";

export const connectToDatabase = async () => {
  try {
    if (!(process.env.MONGO_URI)) {
        console.log("Provide URI for Mongo DB");
        process.exit(1);
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to Mongo DB");
  } catch (err) {
    console.error("Error while connecting to db", err);
    process.exit(1);
  }
};