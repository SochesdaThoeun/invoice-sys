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
exports.Quote = void 0;
const typeorm_1 = require("typeorm");
const User_1 = require("./User");
const Customer_1 = require("./Customer");
const Order_1 = require("./Order");
let Quote = class Quote {
};
exports.Quote = Quote;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Quote.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Quote.prototype, "sellerId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'sellerId' }),
    __metadata("design:type", User_1.User)
], Quote.prototype, "seller", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Quote.prototype, "customerId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Customer_1.Customer),
    (0, typeorm_1.JoinColumn)({ name: 'customerId' }),
    __metadata("design:type", Customer_1.Customer)
], Quote.prototype, "customer", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Quote.prototype, "orderId", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => Order_1.Order),
    (0, typeorm_1.JoinColumn)({ name: 'orderId' }),
    __metadata("design:type", Order_1.Order)
], Quote.prototype, "order", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], Quote.prototype, "totalEstimate", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Date)
], Quote.prototype, "expiresAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: ['DRAFT', 'SENT', 'ACCEPTED', 'REJECTED', 'EXPIRED'], default: 'DRAFT' }),
    __metadata("design:type", String)
], Quote.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Quote.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Quote.prototype, "updatedAt", void 0);
exports.Quote = Quote = __decorate([
    (0, typeorm_1.Entity)({ name: 'quotes' })
], Quote);
exports.default = Quote;
