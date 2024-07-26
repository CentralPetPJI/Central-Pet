import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db";
import cors from "cors";

dotenv.config();

const app = express();

const corsOptions = {
  origin: true,
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
  optionsSuccessStatus: 204,
};

app.use(cors());

// Middleware to parse JSON
app.use(express.json());

connectDB();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Import routes
import authRoutes from "./routes/authRoutes";
import petRoutes from "./routes/petRoutes";

// Use routes
app.use("/api/auth", authRoutes);
app.use("/api/pets", petRoutes);
