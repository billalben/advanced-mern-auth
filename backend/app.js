"use strict";

import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

import { connectDB, disconnectDB } from "./config/connectDB.js";

import authRoute from "./routes/auth.route.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5011;

app.use(express.json()); // To parse JSON bodies
app.use(cookieParser()); // To parse cookies in the request headers

app.use("/api/auth", authRoute);

const server = app.listen(PORT, async () => {
  await connectDB(process.env.MONGODB_URI);
  console.log(`Server is running on port http://localhost:${PORT}`);
});

server.on("close", async () => await disconnectDB());