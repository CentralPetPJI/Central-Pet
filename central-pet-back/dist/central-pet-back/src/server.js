"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const db_1 = __importDefault(require("./config/db"));
const cors_1 = __importDefault(require("cors"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const corsOptions = {
    origin: true,
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true,
    optionsSuccessStatus: 204,
};
app.use((0, cors_1.default)());
// Middleware to parse JSON
app.use(express_1.default.json());
(0, db_1.default)();
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
// Import routes
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const petRoutes_1 = __importDefault(require("./routes/petRoutes"));
// Use routes
app.use("/api/auth", authRoutes_1.default);
app.use("/api/pets", petRoutes_1.default);
