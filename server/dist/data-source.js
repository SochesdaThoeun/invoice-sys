"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppDataSource = void 0;
const typeorm_1 = require("typeorm");
const User_1 = require("./entities/User");
const Product_1 = require("./entities/Product");
const TaxCode_1 = require("./entities/TaxCode");
const Customer_1 = require("./entities/Customer");
const Quote_1 = require("./entities/Quote");
const Order_1 = require("./entities/Order");
const Invoice_1 = require("./entities/Invoice");
const Category_1 = require("./entities/Category");
const LedgerEntry_1 = require("./entities/LedgerEntry");
const AIRequest_1 = require("./entities/AIRequest");
const BusinessAddress_1 = require("./entities/BusinessAddress");
const PaymentType_1 = require("./entities/PaymentType");
const OrderCart_1 = require("./entities/OrderCart");
const dotenv = __importStar(require("dotenv"));
dotenv.config();
exports.AppDataSource = new typeorm_1.DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5458', 10),
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASS || 'password',
    database: process.env.DB_NAME || 'invoice_sys',
    entities: [
        User_1.User,
        Product_1.Product,
        TaxCode_1.TaxCode,
        Customer_1.Customer,
        Quote_1.Quote,
        Order_1.Order,
        Invoice_1.Invoice,
        Category_1.Category,
        LedgerEntry_1.LedgerEntry,
        AIRequest_1.AIRequest,
        BusinessAddress_1.BusinessAddress,
        PaymentType_1.PaymentType,
        OrderCart_1.OrderCart
    ],
    migrations: [__dirname + '/migrations/*.{ts,js}'],
    synchronize: false,
    logging: true,
});
