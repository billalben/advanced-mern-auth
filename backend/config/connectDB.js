"use strict";

import mongoose from "mongoose";

/**
 * Client options object containing server api configuration.
 * @type {ClientOptions}
 */

const clientOptions = {
  serverApi: {
    version: "1",
    strict: true,
    deprecationErrors: true,
  },
  dbName: "authDB",
};

/**
 * Connects to the MongoDB database using the provided connection string.
 * @param {string} connectionURI - The MongoDB connection string.
 * @returns {Promise<void>} - A promise that resolves when the connection is successfully established.
 * @throws {Error} - If there's an error during the connection process.
 */

const connectDB = async (connectionURI) => {
  try {
    await mongoose.connect(connectionURI, clientOptions);
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Error connecting to MongoDB: ", error?.message);
    throw error;
  }
};

/**
 * Disconnects from the MongoDB database using Mongoose.
 * @async
 * @function disconnectDB
 * @throws {Error} If an error occurs during disconnection.
 * @returns {Promise<void>} A promise that resolves once disconnection is complete.
 */

const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  } catch (error) {
    console.error("Error disconnecting from MongoDB: ", error?.message);
    throw error;
  }
};

export { connectDB, disconnectDB };
