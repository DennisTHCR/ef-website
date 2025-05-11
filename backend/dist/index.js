"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const typeorm_1 = require("typeorm");
const dotenv_1 = __importDefault(require("dotenv"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const card_routes_1 = __importDefault(require("./routes/card.routes"));
const battle_routes_1 = __importDefault(require("./routes/battle.routes"));
const trainer_routes_1 = __importDefault(require("./routes/trainer.routes"));
const trade_routes_1 = __importDefault(require("./routes/trade.routes"));
const admin_routes_1 = __importDefault(require("./routes/admin.routes"));
const season_routes_1 = __importDefault(require("./routes/season.routes"));
const error_middleware_1 = require("./middleware/error.middleware");
const database_1 = require("./config/database");
// Load environment variables
dotenv_1.default.config();
// Initialize Express app
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Routes
app.use('/api/auth', auth_routes_1.default);
app.use('/api/cards', card_routes_1.default);
app.use('/api/battles', battle_routes_1.default);
app.use('/api/trainers', trainer_routes_1.default);
app.use('/api/trades', trade_routes_1.default);
app.use('/api/seasons', season_routes_1.default);
app.use('/api/admin', admin_routes_1.default);
// Error handling middleware
app.use(error_middleware_1.errorMiddleware);
// Database connection and server startup
const startServer = async () => {
    try {
        await (0, typeorm_1.createConnection)(database_1.dbConfig);
        console.log('Database connected successfully');
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    }
    catch (error) {
        console.error('Failed to connect to the database:', error);
        process.exit(1);
    }
};
startServer();
