import axios from "axios";

const baseURL =
  import.meta.env.MODE === "development"
    ? "http://localhost:5011/api/auth"
    : "/api/auth";

export const api = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});
