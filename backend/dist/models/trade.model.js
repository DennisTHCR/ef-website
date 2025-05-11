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
exports.Trade = void 0;
const typeorm_1 = require("typeorm");
const user_model_1 = require("./user.model");
const dealt_card_model_1 = require("./dealt_card.model");
let Trade = class Trade {
    id;
    offeredBy;
    offeredTo;
    offeredCard;
    requestedCard;
    askingPrice;
    status;
    createdAt;
};
exports.Trade = Trade;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Trade.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_model_1.User),
    __metadata("design:type", user_model_1.User)
], Trade.prototype, "offeredBy", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_model_1.User),
    __metadata("design:type", Object)
], Trade.prototype, "offeredTo", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => dealt_card_model_1.DealtCard),
    __metadata("design:type", dealt_card_model_1.DealtCard)
], Trade.prototype, "offeredCard", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => dealt_card_model_1.DealtCard),
    __metadata("design:type", Object)
], Trade.prototype, "requestedCard", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Number)
], Trade.prototype, "askingPrice", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 'pending' }),
    __metadata("design:type", String)
], Trade.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Trade.prototype, "createdAt", void 0);
exports.Trade = Trade = __decorate([
    (0, typeorm_1.Entity)('trades')
], Trade);
