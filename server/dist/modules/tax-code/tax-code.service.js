"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaxCodeService = void 0;
const data_source_1 = require("../../data-source");
const TaxCode_1 = require("../../entities/TaxCode");
class TaxCodeService {
    constructor() {
        this.taxCodeRepository = data_source_1.AppDataSource.getRepository(TaxCode_1.TaxCode);
        this.findAll = async (sellerId, page = 1, limit = 10) => {
            const [items, total] = await this.taxCodeRepository.findAndCount({
                where: { sellerId },
                skip: (page - 1) * limit,
                take: limit
            });
            return {
                items,
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            };
        };
        this.findById = async (id, sellerId) => {
            return this.taxCodeRepository.findOneBy({ id, sellerId });
        };
        this.findByCountryAndRegion = async (countryCode, region, sellerId) => {
            if (region) {
                return this.taxCodeRepository.findOneBy({ countryCode, region, sellerId });
            }
            else {
                return this.taxCodeRepository.findOneBy({ countryCode, sellerId });
            }
        };
        this.create = async (taxCodeData) => {
            const taxCode = this.taxCodeRepository.create(taxCodeData);
            return this.taxCodeRepository.save(taxCode);
        };
        this.update = async (id, sellerId, taxCodeData) => {
            // First verify this tax code belongs to the seller
            const taxCode = await this.taxCodeRepository.findOneBy({ id, sellerId });
            if (!taxCode) {
                throw new Error('Tax code not found');
            }
            await this.taxCodeRepository.update(id, taxCodeData);
            const updatedTaxCode = await this.taxCodeRepository.findOneBy({ id, sellerId });
            if (!updatedTaxCode) {
                throw new Error('Tax code not found after update');
            }
            return updatedTaxCode;
        };
        this.delete = async (id, sellerId) => {
            // First verify this tax code belongs to the seller
            const taxCode = await this.taxCodeRepository.findOneBy({ id, sellerId });
            if (!taxCode) {
                return false;
            }
            const result = await this.taxCodeRepository.delete({ id, sellerId });
            return result.affected ? result.affected > 0 : false;
        };
    }
}
exports.TaxCodeService = TaxCodeService;
