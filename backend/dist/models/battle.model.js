"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Battle = void 0;
const typeorm_1 = require("typeorm");
const card_model_1 = require("./card.model");
const user_model_1 = require("./user.model");
let Battle = class Battle {
    id;
    card1;
    card2;
    voter;
    winnerId;
    battleDate;
};
exports.Battle = Battle;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Battle.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => card_model_1.Card),
    __metadata("design:type", card_model_1.Card)
], Battle.prototype, "card1", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => card_model_1.Card),
    __metadata("design:type", card_model_1.Card)
], Battle.prototype, "card2", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_model_1.User),
    __metadata("design:type", user_model_1.User)
], Battle.prototype, "voter", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Battle.prototype, "winnerId", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Battle.prototype, "battleDate", void 0);
exports.Battle = Battle = __decorate([
    (0, typeorm_1.Entity)('battles')
], Battle);
