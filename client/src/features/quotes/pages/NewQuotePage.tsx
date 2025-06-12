import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { IconArrowLeft, IconPlus, IconTrash, IconEye } from '@tabler/icons-react';

import { createQuote } from '../quoteSlice';
import { fetchCustomers } from '../../customers/customerSlice';
import { fetchProducts } from '../../products/productSlice';
import { fetchTaxCodes } from '../../tax/taxSlice';
import { fetchActivePaymentTypes } from '../../payment-types/paymentTypeSlice';
import { fetchBusinessAddresses } from '../../business-addresses/businessAddressSlice';
import { getUserProfile } from '../../settings/settingsSlice';
import { type CreateQuoteRequest } from '../models/quoteModels';
import { type AppDispatch, type RootState } from '../../../store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';

interface QuoteItem {
  productId?: string;
  name: string;
  quantity: number;
  unitPrice: number;
  description?: string;
  taxCodeId?: string;
  taxRate?: number;
  subtotal: number;
  taxAmount: number;
  total: number;
}

export function NewQuotePage() {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  
  const { customers } = useSelector((state: RootState) => state.customers);
  const { products } = useSelector((state: RootState) => state.products);
  const { taxCodes } = useSelector((state: RootState) => state.tax);
  const { paymentTypes } = useSelector((state: RootState) => state.paymentTypes);
  const { businessAddresses } = useSelector((state: RootState) => state.businessAddresses);
  const { isLoading: _isCreating } = useSelector((state: RootState) => state.quotes);
  const { user } = useSelector((state: RootState) => state.auth);
  const { userProfile } = useSelector((state: RootState) => state.settings);
  

  
  // Get one month from today for default expiry date
  const oneMonthFromNow = new Date();
  oneMonthFromNow.setMonth(oneMonthFromNow.getMonth() + 1);
  const defaultExpiryDate = oneMonthFromNow.toISOString().split('T')[0];
  
  const [customerId, setCustomerId] = useState('');
  const [expiresAt, setExpiresAt] = useState(defaultExpiryDate);
  const [paymentTypeId, setPaymentTypeId] = useState('');
  const [items, setItems] = useState<QuoteItem[]>([
    {
      name: '',
      quantity: 1,
      unitPrice: 0,
      subtotal: 0,
      taxAmount: 0,
      total: 0
    }
  ]);
  const [showPreview, setShowPreview] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  
  useEffect(() => {
    dispatch(fetchCustomers({ page: 1, limit: 100 }));
    dispatch(fetchProducts({ page: 1, limit: 100 }));
    dispatch(fetchTaxCodes({ page: 1, limit: 100 }));
    dispatch(fetchActivePaymentTypes());
    dispatch(fetchBusinessAddresses({ page: 1, limit: 100 }));
    dispatch(getUserProfile());
  }, [dispatch]);
  
  const calculateItemTotals = (item: QuoteItem) => {
    const unitPrice = Number(item.unitPrice) || 0;
    const quantity = Number(item.quantity) || 0;
    const taxRate = Number(item.taxRate) || 0;
    
    const subtotal = quantity * unitPrice;
    const taxAmount = subtotal * (taxRate / 100);
    const total = subtotal + taxAmount;
    
    return {
      subtotal,
      taxAmount,
      total
    };
  };
  
  const handleItemChange = (index: number, field: keyof QuoteItem, value: any) => {
    const updatedItems = [...items];
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: value
    };
    
    // If product is selected, populate details
    if (field === 'productId') {
      if (value && value !== 'custom') {
        // Existing product selected - populate details and disable editing
        const selectedProduct = products.find(p => p.id === value);
        if (selectedProduct) {
          updatedItems[index].name = selectedProduct.name;
          updatedItems[index].unitPrice = Number(selectedProduct.defaultPrice) || 0;
          updatedItems[index].description = selectedProduct.description;
          
          // Find and set tax rate if product has tax code
          if (selectedProduct.taxCodeId) {
            const taxCode = taxCodes.find(t => t.id === selectedProduct.taxCodeId);
            if (taxCode) {
              updatedItems[index].taxCodeId = taxCode.id;
              const rate = typeof taxCode.rate === 'string' 
                ? parseFloat(taxCode.rate) 
                : Number(taxCode.rate);
              updatedItems[index].taxRate = isNaN(rate) ? 0 : rate;
            }
          } else {
            // Reset tax rate if no tax code
            updatedItems[index].taxRate = 0;
            updatedItems[index].taxCodeId = undefined;
          }
        }
      } else {
        // Custom product selected - clear product-specific data but keep user input
        updatedItems[index].productId = value === 'custom' ? 'custom' : undefined;
        updatedItems[index].taxCodeId = undefined;
        if (!updatedItems[index].name) {
          updatedItems[index].name = '';
        }
        if (!updatedItems[index].unitPrice) {
          updatedItems[index].unitPrice = 0;
        }
        if (!updatedItems[index].description) {
          updatedItems[index].description = '';
        }
        if (!updatedItems[index].taxRate) {
          updatedItems[index].taxRate = 0;
        }
      }
    }
    
    // Ensure numeric fields are properly converted
    if (field === 'quantity') {
      updatedItems[index].quantity = Number(value) || 0;
    }
    if (field === 'unitPrice') {
      updatedItems[index].unitPrice = Number(value) || 0;
    }
    if (field === 'taxRate') {
      updatedItems[index].taxRate = Number(value) || 0;
    }
    
    // Recalculate totals
    const totals = calculateItemTotals(updatedItems[index]);
    updatedItems[index] = {
      ...updatedItems[index],
      ...totals
    };
    
    setItems(updatedItems);
  };
  
  const handleAddItem = () => {
    setItems([
      ...items,
      {
        name: '',
        quantity: 1,
        unitPrice: 0,
        subtotal: 0,
        taxAmount: 0,
        total: 0
      }
    ]);
  };
  
  const handleRemoveItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };
  
  const calculateQuoteTotals = () => {
    const subtotal = items.reduce((sum, item) => sum + (Number(item.subtotal) || 0), 0);
    const totalTax = items.reduce((sum, item) => sum + (Number(item.taxAmount) || 0), 0);
    const total = subtotal + totalTax;
    
    return { subtotal, totalTax, total };
  };
  
  const { subtotal, totalTax, total } = calculateQuoteTotals();
  
  const handleSubmit = async () => {
    // Clear previous validation errors
    setValidationErrors([]);
    
    // Comprehensive validation with detailed error messages
    const errors: string[] = [];
    
    // Check if required data is loaded
    if (customers.length === 0) {
      errors.push('Customer data not loaded. Please refresh the page and try again.');
    }
    
    // Validate customer selection
    if (!customerId || !customerId.trim()) {
      errors.push('Please select a customer from the dropdown');
    } else {
      // Verify the selected customer still exists
      const customerExists = customers.find(c => c.id === customerId);
      if (!customerExists) {
        errors.push('Selected customer is no longer available. Please select a different customer.');
      }
    }
    
    // Validate products
    if (items.length === 0) {
      errors.push('At least one product is required');
    } else {
      // Check each product item
      items.forEach((item, index) => {
        const itemNumber = index + 1;
        
        // Check if product is selected for existing products
        if (!item.productId && !item.name.trim()) {
          errors.push(`Product ${itemNumber}: Please select a product from the dropdown or choose "Custom Product"`);
        }
        
        // Check product name for custom products
        if (item.productId === 'custom' && !item.name.trim()) {
          errors.push(`Product ${itemNumber}: Custom product name is required when using "Custom Product"`);
        }
        
        // Check if selected product still exists
        if (item.productId && item.productId !== 'custom') {
          const productExists = products.find(p => p.id === item.productId);
          if (!productExists) {
            errors.push(`Product ${itemNumber}: Selected product is no longer available. Please choose a different product.`);
          }
        }
        
        // Check quantity
        if (!item.quantity || item.quantity <= 0 || isNaN(Number(item.quantity))) {
          errors.push(`Product ${itemNumber}: Please enter a valid quantity (must be a number greater than 0)`);
        }
        
        // Check unit price
        if (item.unitPrice < 0 || isNaN(Number(item.unitPrice))) {
          errors.push(`Product ${itemNumber}: Unit price must be a valid number and cannot be negative`);
        }
        
        // Check for reasonable values
        if (item.quantity > 10000) {
          errors.push(`Product ${itemNumber}: Quantity seems unusually high (${item.quantity}). Please verify.`);
        }
        
        if (item.unitPrice > 1000000) {
          errors.push(`Product ${itemNumber}: Unit price seems unusually high ($${item.unitPrice.toFixed(2)}). Please verify.`);
        }
      });
    }
    
    // Set validation errors to show alert
    if (errors.length > 0) {
      setValidationErrors(errors);
      // Scroll to top to show the alert
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    
    const quoteData: CreateQuoteRequest = {
      customerId,
      totalEstimate: Number(total),
      expiresAt,
      status: 'DRAFT',
      paymentTypeId: paymentTypeId || undefined,
      orderCarts: items.map(item => ({
        productId: item.productId === 'custom' ? undefined : item.productId,
        name: item.name,
        quantity: parseInt(item.quantity.toString()),
        unitPrice: Number(item.unitPrice),
        description: item.description
      }))
    };
    
    setIsSubmitting(true);
    try {
      const result = await dispatch(createQuote(quoteData)).unwrap();
      toast.success('Quote created successfully');
      navigate(`/quotations/${result.id}`);
    } catch (error: any) {
      console.error('Error creating quote:', error);
      toast.error(error.message || 'Failed to create quote');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const selectedCustomer = customers.find(c => c.id === customerId);
  
  // Get primary business address
  const primaryBusinessAddress = businessAddresses.find(ba => ba.id) || businessAddresses[0];

  return (
    <div className="max-w-6xl mx-auto space-y-6 mt-4 sm:mt-8 px-4 sm:px-6 lg:px-0">
      {/* Validation Errors Alert */}
      {validationErrors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center">
                <span className="text-red-600 text-sm font-medium">!</span>
              </div>
            </div>
            <div className="ml-3 flex-1">
              <h3 className="text-sm font-medium text-red-800 mb-2">
                Please fix the following issues before creating the quote:
              </h3>
              <ul className="text-sm text-red-700 space-y-1">
                {validationErrors.map((error, index) => (
                  <li key={index} className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>{error}</span>
                  </li>
                ))}
              </ul>
            </div>
            <button
              onClick={() => setValidationErrors([])}
              className="flex-shrink-0 ml-4 text-red-600 hover:text-red-800 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0 h-auto sm:h-10">
        <Button variant="outline" onClick={() => navigate('/quotations')} className="h-10 w-full sm:w-auto">
          <IconArrowLeft className="mr-2 h-4 w-4" /> Back to Quotations
        </Button>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-2 w-full sm:w-auto">
          <Dialog open={showPreview} onOpenChange={setShowPreview}>
                          <DialogTrigger asChild>
                <Button variant="outline" className="h-10 w-full sm:w-auto">
                  <IconEye className="mr-2 h-4 w-4" /> Preview
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-7xl w-[95vw] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Quote Preview</DialogTitle>
                </DialogHeader>
                <QuotePreview 
                  customer={selectedCustomer}
                  items={items}
                  expiresAt={expiresAt}
                  subtotal={subtotal}
                  totalTax={totalTax}
                  total={total}
                  user={user}
                  userProfile={userProfile}
                  primaryBusinessAddress={primaryBusinessAddress}
                />
              </DialogContent>
            </Dialog>
            <Button 
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="h-10 w-full sm:w-auto"
            >
              {isSubmitting ? 'Creating...' : 'Create Quote'}
            </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quote Details */}
          <Card>
            <CardHeader>
              <CardTitle>Quote Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="customer">Customer *</Label>
                  <Select value={customerId} onValueChange={setCustomerId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a customer" />
                    </SelectTrigger>
                    <SelectContent>
                      {customers.map((customer) => (
                        <SelectItem key={customer.id} value={customer.id}>
                          {customer.name} ({customer.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="paymentType">Payment Type</Label>
                  <Select value={paymentTypeId} onValueChange={setPaymentTypeId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select payment type" />
                    </SelectTrigger>
                    <SelectContent>
                      {paymentTypes.map((paymentType) => (
                        <SelectItem key={paymentType.id} value={paymentType.id}>
                          {paymentType.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="expiresAt">Expiry Date</Label>
                  <Input 
                    id="expiresAt"
                    type="date"
                    value={expiresAt}
                    onChange={(e) => setExpiresAt(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Total Amount</Label>
                  <div className="h-10 px-3 py-2 border rounded-md bg-muted text-lg font-bold">
                    ${total.toFixed(2)}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Products */}
          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                Products
                <Button size="sm" onClick={handleAddItem}>
                  <IconPlus className="mr-2 h-4 w-4" /> Add Product
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {items.map((item, index) => (
                <Card key={index} className="p-4">
                  {/* Row 1: Product Selection and Name */}
                  <div className="grid grid-cols-1 sm:grid-cols-6 gap-4 mb-4">
                    <div className="sm:col-span-2 space-y-2">
                      <Label>Product *</Label>
                      <Select 
                        value={item.productId || 'custom'} 
                        onValueChange={(value) => handleItemChange(index, 'productId', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a product or add custom" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="custom">Custom Product</SelectItem>
                          {products.map((product) => (
                            <SelectItem key={product.id} value={product.id}>
                              <div className="flex flex-col items-start">
                                <span className="font-medium">{product.name}</span>
                                <span className="text-xs text-muted-foreground">
                                  ${Number(product.defaultPrice || 0).toFixed(2)}
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="sm:col-span-3 space-y-2">
                      <Label>Product Name *</Label>
                      <Input 
                        value={item.name}
                        onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                        placeholder="Enter product name"
                        disabled={!!item.productId && item.productId !== 'custom'}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>&nbsp;</Label>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleRemoveItem(index)}
                        disabled={items.length === 1}
                      >
                        <IconTrash className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  {/* Row 2: Quantity, Price, Tax, and Totals */}
                  <div className="grid grid-cols-2 sm:grid-cols-6 gap-4">
                    <div className="space-y-2">
                      <Label>Quantity</Label>
                      <Input 
                        type="number"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value) || 0)}
                        min="1"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Unit Price</Label>
                      <Input 
                        type="number"
                        step="0.01"
                        value={item.unitPrice}
                        onChange={(e) => handleItemChange(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                        min="0"
                        disabled={!!item.productId && item.productId !== 'custom'}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Tax Rate</Label>
                      <div className="flex items-center space-x-2">
                        <Input 
                          type="number"
                          step="0.01"
                          value={item.taxRate || 0}
                          onChange={(e) => handleItemChange(index, 'taxRate', parseFloat(e.target.value) || 0)}
                          min="0"
                          max="100"
                          disabled={!!item.productId && item.productId !== 'custom'}
                        />
                        <span className="text-sm text-muted-foreground">%</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Subtotal</Label>
                      <div className="h-10 px-3 py-2 border rounded-md bg-muted text-sm">
                        ${item.subtotal.toFixed(2)}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Tax</Label>
                      <div className="h-10 px-3 py-2 border rounded-md bg-muted text-sm">
                        ${item.taxAmount.toFixed(2)}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Total</Label>
                      <div className="h-10 px-3 py-2 border rounded-md bg-green-50 text-sm font-medium">
                        ${item.total.toFixed(2)}
                      </div>
                    </div>
                  </div>
                  
                  {/* Description */}
                  <div className="mt-4 space-y-2">
                    <Label>Description (Optional)</Label>
                    <Input 
                      value={item.description || ''}
                      onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                      placeholder="Enter product description"
                      disabled={!!item.productId && item.productId !== 'custom'}
                    />
                  </div>
                </Card>
              ))}
            </CardContent>
          </Card>
        </div>
        
        {/* Summary Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quote Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedCustomer && (
                <div className="space-y-2">
                  <h4 className="font-medium">Customer</h4>
                  <div className="text-sm text-muted-foreground">
                    <p>{selectedCustomer.name}</p>
                    <p>{selectedCustomer.email}</p>
                    <p>{selectedCustomer.phone}</p>
                  </div>
                </div>
              )}
              
              <Separator />
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Products:</span>
                  <span>{items.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax:</span>
                  <span>${totalTax.toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total:</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Expires:</span>
                  <span>{new Date(expiresAt).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Payment Type:</span>
                  <span>{paymentTypes.find(pt => pt.id === paymentTypeId)?.name || 'Not selected'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Status:</span>
                  <Badge variant="outline">Draft</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Quote Preview Component
interface QuotePreviewProps {
  customer?: any;
  items: QuoteItem[];
  expiresAt: string;
  subtotal: number;
  totalTax: number;
  total: number;
  user?: any;
  userProfile?: any;
  primaryBusinessAddress?: any;
}

function QuotePreview({ customer, items, expiresAt, subtotal, totalTax, total, user, userProfile, primaryBusinessAddress }: QuotePreviewProps) {

  return (
    <div className="bg-white" style={{ 
      width: '100%', 
      maxWidth: '1000px',
      margin: '0 auto',
      padding: '40px',
      fontSize: '16px',
      lineHeight: '1.6',
      fontFamily: 'Arial, sans-serif',
      color: '#333'
    }}>
      <div className="flex justify-between items-start mb-10">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Quotation</h1>
          <p className="text-gray-600 text-lg">Quote #DRAFT</p>
        </div>
        <Badge variant="outline" className="text-base px-4 py-2">DRAFT</Badge>
      </div>
      
      <div className="border-t border-gray-200 mb-8" />
      
      <div className="grid grid-cols-2 gap-12 mb-10">
        <div>
          <h3 className="text-xl font-semibold mb-4">From</h3>
          <div className="text-base text-gray-600 space-y-2">
            <p className="font-medium text-gray-900">
              {userProfile?.businessName || userProfile?.name || user?.businessName || user?.name || 'Your Company Name'}
            </p>
            {(userProfile?.businessRegistrationNumber || user?.businessRegistrationNumber) && (
              <p className="text-sm">
                Registration: {userProfile?.businessRegistrationNumber || user?.businessRegistrationNumber}
              </p>
            )}
            <p>{userProfile?.email || user?.email || 'Your Email'}</p>
            {(userProfile?.phone || user?.phone) && (
              <p>{userProfile?.phone || user?.phone}</p>
            )}
            {primaryBusinessAddress ? (
              <>
                <p>{primaryBusinessAddress.address}</p>
                <p>{primaryBusinessAddress.street} {primaryBusinessAddress.houseNumber}</p>
                <p>{primaryBusinessAddress.state}, {primaryBusinessAddress.country}</p>
              </>
            ) : (
              <>
                <p>Your Address</p>
                <p>Your City, State</p>
              </>
            )}
          </div>
        </div>
        <div>
          <h3 className="text-xl font-semibold mb-4">To</h3>
          {customer ? (
            <div className="text-base text-gray-600 space-y-2">
              <p className="font-medium text-gray-900">
                {customer.businessName || customer.name}
              </p>
              {customer.businessRegistrationNumber && (
                <p className="text-sm">Registration: {customer.businessRegistrationNumber}</p>
              )}
              <p>{customer.email}</p>
              {customer.phone && <p>{customer.phone}</p>}
              {customer.businessAddress ? (
                <>
                  <div className="mt-3">
                    <p>{customer.businessAddress.address}</p>
                    <p>{customer.businessAddress.street} {customer.businessAddress.houseNumber}</p>
                    <p>{customer.businessAddress.state}, {customer.businessAddress.country}</p>
                  </div>
                </>
              ) : (
                <p className="text-sm text-gray-400 mt-2">No business address on file</p>
              )}
            </div>
          ) : (
            <p className="text-base text-gray-400">No customer selected</p>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-12 mb-8">
        <div>
          <h3 className="text-xl font-semibold mb-4">Quote Details</h3>
          <div className="space-y-3 text-base">
            <p><span className="font-medium">Quote Date:</span> {new Date().toLocaleDateString()}</p>
            <p><span className="font-medium">Expiry Date:</span> {new Date(expiresAt).toLocaleDateString()}</p>
          </div>
        </div>
      </div>
      
      <div className="border-t border-gray-200 mb-8" />
      
      <div className="mb-10">
        <table className="w-full text-base border-collapse border border-gray-200">
          <thead>
            <tr className="bg-gray-50">
              <th className="text-left py-4 px-6 font-medium border border-gray-200">Description</th>
              <th className="text-center py-4 px-6 font-medium border border-gray-200">Qty</th>
              <th className="text-right py-4 px-6 font-medium border border-gray-200">Unit Price</th>
              <th className="text-right py-4 px-6 font-medium border border-gray-200">Tax</th>
              <th className="text-right py-4 px-6 font-medium border border-gray-200">Total</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={index} className="border-b">
                <td className="py-4 px-6 border border-gray-200">
                  <div>
                    <p className="font-medium">{item.name}</p>
                    {item.description && (
                      <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                    )}
                  </div>
                </td>
                <td className="py-4 px-6 text-center border border-gray-200">{item.quantity}</td>
                <td className="py-4 px-6 text-right border border-gray-200">${(Number(item.unitPrice) || 0).toFixed(2)}</td>
                <td className="py-4 px-6 text-right border border-gray-200">${(Number(item.taxAmount) || 0).toFixed(2)}</td>
                <td className="py-4 px-6 text-right font-medium border border-gray-200">${(Number(item.total) || 0).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="flex justify-end mb-10">
        <div className="w-80">
          <div className="space-y-3 text-base">
            <div className="flex justify-between py-2">
              <span className="font-medium">Subtotal:</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="font-medium">Tax:</span>
              <span>${totalTax.toFixed(2)}</span>
            </div>
            <div className="border-t border-gray-200 my-3" />
            <div className="flex justify-between py-2 text-xl font-bold">
              <span>Total:</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-10">
        <h3 className="text-xl font-semibold mb-4">Terms & Conditions</h3>
        <div className="text-base text-gray-600 space-y-3">
          <p>• This quote is valid until {new Date(expiresAt).toLocaleDateString()}.</p>
          <p>• All prices are quoted in USD and are subject to change without notice.</p>
          <p>• Payment terms: Net 30 days from invoice date.</p>
          <p>• Please contact us if you have any questions regarding this quote.</p>
        </div>
      </div>
    </div>
  );
} 