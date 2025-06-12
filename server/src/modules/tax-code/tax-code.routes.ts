import { Router } from 'express';
import { TaxCodeController } from './tax-code.controller';
import { authMiddleware } from '../../middleware/auth.middleware';

const router = Router();
const taxCodeController = new TaxCodeController();



// Get all tax codes
router.get('/', authMiddleware, taxCodeController.getAllTaxCodes);

// Get tax code by ID
router.get('/:id', authMiddleware, taxCodeController.getTaxCodeById);

// Get tax code by country and region
router.get('/country/:countryCode/region/:region', authMiddleware, taxCodeController.getTaxCodeByCountryAndRegion);
// Get tax code by country only
router.get('/country/:countryCode', authMiddleware, taxCodeController.getTaxCodeByCountryAndRegion);

// Create new tax code
router.post('/', authMiddleware, taxCodeController.createTaxCode);

// Update tax code
router.put('/:id', authMiddleware, taxCodeController.updateTaxCode);

// Delete tax code
router.delete('/:id', authMiddleware, taxCodeController.deleteTaxCode);

export default router; 