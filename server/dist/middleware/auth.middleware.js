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
exports.authMiddleware = void 0;
const jwt = __importStar(require("jsonwebtoken"));
const data_source_1 = require("../data-source");
const User_1 = require("../entities/User");
const JWT_SECRET = process.env.JWT_SECRET || 'changeme';
const authMiddleware = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({ message: 'Unauthorized: No token provided' });
            return;
        }
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, JWT_SECRET);
        // Fetch user in the background and continue with request
        data_source_1.AppDataSource.getRepository(User_1.User)
            .findOneBy({ id: decoded.sub })
            .then(user => {
            if (!user) {
                res.status(401).json({ message: 'Unauthorized: Invalid user' });
                return;
            }
            // Attach user to request object
            req.user = user;
            next();
        })
            .catch(() => {
            res.status(500).json({ message: 'Internal server error' });
        });
    }
    catch (error) {
        if (error instanceof jwt.JsonWebTokenError) {
            res.status(401).json({ message: 'Unauthorized: Invalid token' });
            return;
        }
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.authMiddleware = authMiddleware;
