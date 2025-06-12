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
exports.LedgerEntry = exports.SourceType = void 0;
const typeorm_1 = require("typeorm");
const User_1 = require("./User");
const Category_1 = require("./Category");
var SourceType;
(function (SourceType) {
    SourceType["INVOICE"] = "INVOICE";
    SourceType["ORDER"] = "ORDER";
    SourceType["QUOTE"] = "QUOTE";
    SourceType["PAYMENT"] = "PAYMENT";
    SourceType["ADJUSTMENT"] = "ADJUSTMENT";
    SourceType["EXPENSE"] = "EXPENSE";
})(SourceType || (exports.SourceType = SourceType = {}));
let LedgerEntry = class LedgerEntry {
};
exports.LedgerEntry = LedgerEntry;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], LedgerEntry.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], LedgerEntry.prototype, "sellerId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'sellerId' }),
    __metadata("design:type", User_1.User)
], LedgerEntry.prototype, "seller", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], LedgerEntry.prototype, "debit", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], LedgerEntry.prototype, "credit", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], LedgerEntry.prototype, "categoryId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Category_1.Category),
    (0, typeorm_1.JoinColumn)({ name: 'categoryId' }),
    __metadata("design:type", Category_1.Category)
], LedgerEntry.prototype, "category", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: SourceType }),
    __metadata("design:type", String)
], LedgerEntry.prototype, "sourceType", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], LedgerEntry.prototype, "sourceId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], LedgerEntry.prototype, "transactionGroupId", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, type: 'text' }),
    __metadata("design:type", String)
], LedgerEntry.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], LedgerEntry.prototype, "createdAt", void 0);
exports.LedgerEntry = LedgerEntry = __decorate([
    (0, typeorm_1.Entity)({ name: 'ledger_entries' })
], LedgerEntry);
exports.default = LedgerEntry;
