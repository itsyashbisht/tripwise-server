import "./env.js";
import connectDb from "./db/index.js";
import { app } from "./app.js";

const port = process.env.PORT || 8000;

await connectDb()
  .then(() => {
    app.on("error", (error) => {
      console.error("Error: ", error.message);
      throw error;
    });
    app.listen(port, () => {
      console.log("Server is running at port" + port);
    });
  })
  .catch((err) => {
    console.log("MongoDB connection error:", err);
  });
