"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dbConfig = void 0;
const user_model_1 = require("../models/user.model");
const card_model_1 = require("../models/card.model");
const dealt_card_model_1 = require("../models/dealt_card.model");
const battle_model_1 = require("../models/battle.model");
const season_model_1 = require("../models/season.model");
const pack_model_1 = require("../models/pack.model");
const trade_model_1 = require("../models/trade.model");
const quote_model_1 = require("../models/quote.model");
const subject_model_1 = require("../models/subject.model");
const teacher_model_1 = require("../models/teacher.model");
exports.dbConfig = {
    type: 'sqlite',
    database: './db/teacher-card-game.sqlite',
    entities: [user_model_1.User, card_model_1.Card, dealt_card_model_1.DealtCard, battle_model_1.Battle, season_model_1.Season, pack_model_1.Pack, trade_model_1.Trade, quote_model_1.Quote, subject_model_1.Subject, teacher_model_1.Teacher],
    synchronize: true,
    logging: true
};
