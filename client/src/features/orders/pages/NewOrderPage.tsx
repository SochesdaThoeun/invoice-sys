import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { IconArrowLeft, IconPlus, IconTrash } from '@tabler/icons-react';

import { createOrder } from '../orderSlice';
import { fetchCustomers } from '../../customers/customerSlice';
import { fetchProducts } from '../../products/productSlice';
import { type CreateOrderRequest } from '../models/orderModels';
import { type AppDispatch, type RootState } from '../../../store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';

interface OrderItem {
  productId?: string;
  name: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export function NewOrderPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  
  const { customers } = useSelector((state: RootState) => state.customers);
  const { products } = useSelector((state: RootState) => state.products);
  
  const [customerId, setCustomerId] = useState('');
  const [createQuote, setCreateQuote] = useState(false);
  const [createInvoice, setCreateInvoice] = useState(false);
  const [items, setItems] = useState<OrderItem[]>([
    {
      name: '',
      quantity: 1,
      unitPrice: 0,
      total: 0
    }
  ]);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    dispatch(fetchCustomers({ page: 1, limit: 100 }));
    dispatch(fetchProducts({ page: 1, limit: 100 }));
  }, [dispatch]);

  const calculateItemTotals = (item: OrderItem) => {
    const unitPrice = Number(item.unitPrice) || 0;
    const quantity = Number(item.quantity) || 0;
    const total = quantity * unitPrice;
    return { total };
  };

  const handleItemChange = (index: number, field: keyof OrderItem, value: any) => {
    const updatedItems = [...items];
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: value
    };

    // If product is selected, populate details
    if (field === 'productId') {
      if (value && value !== 'custom') {
        const selectedProduct = products.find(p => p.id === value);
        if (selectedProduct) {
          updatedItems[index].name = selectedProduct.name;
          updatedItems[index].unitPrice = Number(selectedProduct.defaultPrice) || 0;
          updatedItems[index].description = selectedProduct.description;
        }
      } else {
        updatedItems[index].productId = value === 'custom' ? 'custom' : undefined;
        if (!updatedItems[index].name) {
          updatedItems[index].name = '';
        }
        if (!updatedItems[index].unitPrice) {
          updatedItems[index].unitPrice = 0;
        }
        if (!updatedItems[index].description) {
          updatedItems[index].description = '';
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
        total: 0
      }
    ]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const calculateOrderTotals = () => {
    const total = items.reduce((sum, item) => sum + (Number(item.total) || 0), 0);
    return { total };
  };

  const { total } = calculateOrderTotals();

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

    const orderData: CreateOrderRequest = {
      customerId,
      totalAmount: total,
      createQuote,
      createInvoice,
      orderCarts: items.map(item => ({
        productId: item.productId === 'custom' ? undefined : item.productId,
        quantity: parseInt(item.quantity.toString()),
        unitPrice: Number(item.unitPrice)
      }))
    };

    setIsSubmitting(true);
    try {
      const result = await dispatch(createOrder(orderData)).unwrap();
      toast.success('Order created successfully');
      navigate(`/orders/${result.id}`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to create order');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedCustomer = customers.find(c => c.id === customerId);

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
                Please fix the following issues before creating the order:
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
        <Button variant="outline" onClick={() => navigate('/orders')} className="h-10 w-full sm:w-auto">
          <IconArrowLeft className="mr-2 h-4 w-4" /> Back to Orders
        </Button>
        <Button 
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="h-10 w-full sm:w-auto"
        >
          {isSubmitting ? 'Creating...' : 'Create Order'}
        </Button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                New Order
                <Badge variant="secondary">DRAFT</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Customer and Order Options Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <span className="h-2 w-2 bg-primary rounded-full"></span>
                    Customer & Order Information
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-4">
                    <div className="space-y-2">
                      <Label htmlFor="customer" className="text-sm font-medium">
                        Customer *
                      </Label>
                      <Select value={customerId} onValueChange={setCustomerId}>
                        <SelectTrigger className="h-11">
                          <SelectValue placeholder="Select a customer" />
                        </SelectTrigger>
                        <SelectContent>
                          {customers.map((customer) => (
                            <SelectItem key={customer.id} value={customer.id}>
                              <div className="flex flex-col items-start">
                                <span className="font-medium">{customer.name}</span>
                                <span className="text-xs text-muted-foreground">{customer.email}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Total Amount</Label>
                      <div className="h-11 px-3 py-2 border rounded-md bg-muted text-lg font-bold flex items-center">
                        ${total.toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Order Settings Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <span className="h-2 w-2 bg-primary rounded-full"></span>
                    Order Settings
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="create-quote" className="text-sm font-medium">
                        Create Quote
                      </Label>
                      <Switch
                        id="create-quote"
                        checked={createQuote}
                        onCheckedChange={setCreateQuote}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor="create-invoice" className="text-sm font-medium">
                        Create Invoice
                      </Label>
                      <Switch
                        id="create-invoice"
                        checked={createInvoice}
                        onCheckedChange={setCreateInvoice}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Products */}
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0">
                <CardTitle>Products</CardTitle>
                <Button onClick={handleAddItem} size="sm" className="w-full sm:w-auto">
                  <IconPlus className="mr-2 h-4 w-4" />
                  Add Product
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {items.map((item, index) => (
                  <div key={index} className="relative border rounded-lg p-4 hover:bg-muted/30 transition-colors">
                    {items.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveItem(index)}
                        className="absolute top-2 right-2 text-muted-foreground hover:text-destructive"
                      >
                        <IconTrash className="h-4 w-4" />
                      </Button>
                    )}
                    
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Product *</Label>
                          <Select
                            value={item.productId || ''}
                            onValueChange={(value) => handleItemChange(index, 'productId', value)}
                          >
                            <SelectTrigger className="h-11">
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
                        
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Product Name *</Label>
                          <Input
                            value={item.name}
                            onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                            placeholder="Enter product name"
                            className="h-11"
                            disabled={!!item.productId && item.productId !== 'custom'}
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Description</Label>
                        <Input
                          value={item.description || ''}
                          onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                          placeholder="Enter product description"
                          className="h-11"
                          disabled={!!item.productId && item.productId !== 'custom'}
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Quantity *</Label>
                          <Input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value) || 1)}
                            className="h-11"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Unit Price *</Label>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.unitPrice}
                            onChange={(e) => handleItemChange(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                            className="h-11"
                            disabled={!!item.productId && item.productId !== 'custom'}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Total</Label>
                          <Input
                            value={`$${(Number(item.total) || 0).toFixed(2)}`}
                            readOnly
                            className="h-11 bg-muted/50 font-medium"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Summary Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Products:</span>
                  <span className="font-medium">{items.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Status:</span>
                  <Badge variant="secondary">DRAFT</Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Create Quote:</span>
                  <span className="font-medium">{createQuote ? 'Yes' : 'No'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Create Invoice:</span>
                  <span className="font-medium">{createInvoice ? 'Yes' : 'No'}</span>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <Separator />
                
                <div className="flex justify-between font-bold text-lg">
                  <span>Total:</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Customer Details</CardTitle>
            </CardHeader>
            <CardContent>
              {selectedCustomer ? (
                <div className="space-y-2">
                  <p className="font-medium">
                    {selectedCustomer.businessName || selectedCustomer.name}
                  </p>
                  {selectedCustomer.businessRegistrationNumber && (
                    <p className="text-sm text-muted-foreground">
                      Registration: {selectedCustomer.businessRegistrationNumber}
                    </p>
                  )}
                  <p className="text-sm text-muted-foreground">{selectedCustomer.email}</p>
                  {selectedCustomer.phone && (
                    <p className="text-sm text-muted-foreground">{selectedCustomer.phone}</p>
                  )}
                  {selectedCustomer.businessAddress && (
                    <div className="mt-2 pt-2 border-t border-muted">
                      <p className="text-xs text-muted-foreground font-medium">Business Address:</p>
                      <p className="text-xs text-muted-foreground">{selectedCustomer.businessAddress.address}</p>
                      <p className="text-xs text-muted-foreground">
                        {selectedCustomer.businessAddress.street} {selectedCustomer.businessAddress.houseNumber}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {selectedCustomer.businessAddress.state}, {selectedCustomer.businessAddress.country}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-muted-foreground">No customer selected</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 