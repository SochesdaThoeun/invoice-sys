"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const tax_code_controller_1 = require("./tax-code.controller");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const router = (0, express_1.Router)();
const taxCodeController = new tax_code_controller_1.TaxCodeController();
// Get all tax codes
router.get('/', auth_middleware_1.authMiddleware, taxCodeController.getAllTaxCodes);
// Get tax code by ID
router.get('/:id', auth_middleware_1.authMiddleware, taxCodeController.getTaxCodeById);
// Get tax code by country and region
router.get('/country/:countryCode/region/:region', auth_middleware_1.authMiddleware, taxCodeController.getTaxCodeByCountryAndRegion);
// Get tax code by country only
router.get('/country/:countryCode', auth_middleware_1.authMiddleware, taxCodeController.getTaxCodeByCountryAndRegion);
// Create new tax code
router.post('/', auth_middleware_1.authMiddleware, taxCodeController.createTaxCode);
// Update tax code
router.put('/:id', auth_middleware_1.authMiddleware, taxCodeController.updateTaxCode);
// Delete tax code
router.delete('/:id', auth_middleware_1.authMiddleware, taxCodeController.deleteTaxCode);
exports.default = router;
