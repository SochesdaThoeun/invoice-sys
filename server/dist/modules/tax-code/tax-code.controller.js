"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaxCodeController = void 0;
const tax_code_service_1 = require("./tax-code.service");
class TaxCodeController {
    constructor() {
        this.getAllTaxCodes = async (req, res) => {
            try {
                const sellerId = req.user.id;
                const page = req.query.page ? parseInt(req.query.page) : 1;
                const limit = req.query.limit ? parseInt(req.query.limit) : 10;
                const taxCodes = await this.taxCodeService.findAll(sellerId, page, limit);
                res.status(200).json(taxCodes);
            }
            catch (error) {
                res.status(500).json({ message: 'Failed to get tax codes', error });
            }
        };
        this.getTaxCodeById = async (req, res) => {
            try {
                const sellerId = req.user.id;
                const taxCode = await this.taxCodeService.findById(req.params.id, sellerId);
                if (!taxCode) {
                    res.status(404).json({ message: 'Tax code not found' });
                    return;
                }
                res.status(200).json(taxCode);
            }
            catch (error) {
                res.status(500).json({ message: 'Failed to get tax code', error });
            }
        };
        this.getTaxCodeByCountryAndRegion = async (req, res) => {
            try {
                const sellerId = req.user.id;
                const { countryCode, region } = req.params;
                const taxCode = await this.taxCodeService.findByCountryAndRegion(countryCode, region || null, sellerId);
                if (!taxCode) {
                    res.status(404).json({ message: 'Tax code not found' });
                    return;
                }
                res.status(200).json(taxCode);
            }
            catch (error) {
                res.status(500).json({ message: 'Failed to get tax code by country and region', error });
            }
        };
        this.createTaxCode = async (req, res) => {
            try {
                const sellerId = req.user.id;
                const { countryCode, region, rate } = req.body;
                const taxCode = await this.taxCodeService.create({
                    sellerId,
                    countryCode,
                    region,
                    rate
                });
                res.status(201).json(taxCode);
            }
            catch (error) {
                res.status(500).json({ message: 'Failed to create tax code', error });
            }
        };
        this.updateTaxCode = async (req, res) => {
            try {
                const sellerId = req.user.id;
                const { countryCode, region, rate } = req.body;
                const updatedTaxCode = await this.taxCodeService.update(req.params.id, sellerId, {
                    countryCode,
                    region,
                    rate
                });
                res.status(200).json(updatedTaxCode);
            }
            catch (error) {
                res.status(500).json({ message: 'Failed to update tax code', error });
            }
        };
        this.deleteTaxCode = async (req, res) => {
            try {
                const sellerId = req.user.id;
                const success = await this.taxCodeService.delete(req.params.id, sellerId);
                if (!success) {
                    res.status(404).json({ message: 'Tax code not found or could not be deleted' });
                    return;
                }
                res.status(204).send();
            }
            catch (error) {
                res.status(500).json({ message: 'Failed to delete tax code', error });
            }
        };
        this.taxCodeService = new tax_code_service_1.TaxCodeService();
    }
}
exports.TaxCodeController = TaxCodeController;
