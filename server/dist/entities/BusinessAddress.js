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
exports.BusinessAddress = void 0;
const typeorm_1 = require("typeorm");
const User_1 = require("./User");
const Customer_1 = require("./Customer");
let BusinessAddress = class BusinessAddress {
};
exports.BusinessAddress = BusinessAddress;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], BusinessAddress.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], BusinessAddress.prototype, "sellerId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'sellerId' }),
    __metadata("design:type", User_1.User)
], BusinessAddress.prototype, "seller", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], BusinessAddress.prototype, "businessId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], BusinessAddress.prototype, "country", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], BusinessAddress.prototype, "state", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], BusinessAddress.prototype, "street", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], BusinessAddress.prototype, "houseNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], BusinessAddress.prototype, "address", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => Customer_1.Customer, customer => customer.businessAddress),
    __metadata("design:type", Customer_1.Customer)
], BusinessAddress.prototype, "customer", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], BusinessAddress.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], BusinessAddress.prototype, "updatedAt", void 0);
exports.BusinessAddress = BusinessAddress = __decorate([
    (0, typeorm_1.Entity)({ name: 'business_addresses' })
], BusinessAddress);
exports.default = BusinessAddress;
