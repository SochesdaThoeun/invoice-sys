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
const User_1 = require("../../entities/User");
const data_source_1 = require("../../data-source");
const bcrypt = __importStar(require("bcryptjs"));
const jwt = __importStar(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET || 'changeme';
class AuthService {
    static async login(dto) {
        const repo = data_source_1.AppDataSource.getRepository(User_1.User);
        const user = await repo.findOne({ where: { email: dto.email } });
        if (!user)
            throw new Error('Invalid credentials');
        const valid = await bcrypt.compare(dto.password, user.passwordHash);
        if (!valid)
            throw new Error('Invalid credentials');
        const token = jwt.sign({ sub: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
        return {
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                businessRegistrationNumber: user.businessRegistrationNumber,
                businessName: user.businessName,
                role: user.role,
                locale: user.locale,
                currency: user.currency
            }
        };
    }
    static async register(dto) {
        const repo = data_source_1.AppDataSource.getRepository(User_1.User);
        const exists = await repo.findOne({ where: { email: dto.email } });
        if (exists)
            throw new Error('Email already in use');
        const passwordHash = await bcrypt.hash(dto.password, 10);
        const user = repo.create({
            name: dto.name,
            email: dto.email,
            phone: dto.phone,
            businessRegistrationNumber: dto.businessRegistrationNumber,
            businessName: dto.businessName,
            passwordHash,
            role: dto.role || User_1.UserRole.SELLER,
            locale: dto.locale,
            currency: dto.currency,
        });
        await repo.save(user);
        const token = jwt.sign({ sub: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
        return {
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                businessRegistrationNumber: user.businessRegistrationNumber,
                businessName: user.businessName,
                role: user.role,
                locale: user.locale,
                currency: user.currency
            }
        };
    }
}
exports.default = AuthService;
