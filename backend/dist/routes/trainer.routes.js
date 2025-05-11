"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const trainer_controller_1 = require("../controllers/trainer.controller");
const router = express_1.default.Router();
const trainerController = new trainer_controller_1.TrainerController();
router.get('/top', trainerController.getTopTrainers);
exports.default = router;
