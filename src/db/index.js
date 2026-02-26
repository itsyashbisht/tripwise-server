import mongoose from "mongoose";

const connectDb = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGODB_URI}/tripSage`,
    );
    console.log(
      `\n MongoDB connected! DB Host: ${connectionInstance.connection.host}`,
    );
  } catch (error) {
    console.log("MongoDB connection is failed: ", error);
    process.exit(1); // stop server if DB fails
  }
};

export default connectDb;
