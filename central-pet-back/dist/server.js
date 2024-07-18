"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const app = (0, express_1.default)();
// Middleware to parse JSON
app.use(express_1.default.json());
// Connect to MongoDB
mongoose_1.default
    .connect(process.env.MONGOURI)
    .then(() => console.log('MongoDB connected'))
    .catch((err) => console.log(err));
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
// Import routes
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const petRoutes_1 = __importDefault(require("./routes/petRoutes"));
// Use routes
app.use('/api/auth', authRoutes_1.default);
app.use('/api/pets', petRoutes_1.default);
