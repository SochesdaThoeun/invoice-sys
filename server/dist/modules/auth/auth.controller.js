"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_service_1 = __importDefault(require("./auth.service"));
const class_validator_1 = require("class-validator");
const auth_dto_1 = require("./auth.dto");
const router = (0, express_1.Router)();
router.route('/login')
    .post(async (req, res) => {
    const dto = Object.assign(new auth_dto_1.LoginDto(), req.body);
    const errors = await (0, class_validator_1.validate)(dto);
    if (errors.length) {
        res.status(400).json({ errors });
        return;
    }
    try {
        const result = await auth_service_1.default.login(dto);
        res.json(result);
    }
    catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        res.status(401).json({ error: message });
    }
});
router.route('/register')
    .post(async (req, res) => {
    const dto = Object.assign(new auth_dto_1.RegisterDto(), req.body);
    const errors = await (0, class_validator_1.validate)(dto);
    if (errors.length) {
        res.status(400).json({ errors });
        return;
    }
    try {
        const result = await auth_service_1.default.register(dto);
        res.json(result);
    }
    catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        res.status(400).json({ error: message });
    }
});
exports.default = router;
