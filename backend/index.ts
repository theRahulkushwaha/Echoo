import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import * as http from "http";
import connectDB from "./config/db.js";
import authRoutes from "./routes/auth.routes.js";
import { initializeSocket } from "./socket/socket.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/auth", authRoutes);

app.get("/", (_req, res) => {
  res.send("Server is running");
});

const PORT = process.env.PORT || 3000;
const server = http.createServer(app);

initializeSocket(server);

connectDB()
  .then(() => {
    console.log("Database Connected");

    server.listen(PORT, () => {
      console.log("Server is running on port", PORT);
    });
  })
  .catch((error) => {
    console.log(
      "Failed to start server due to database connecting error:",
      error,
    );
    process.exit(1);
  });
