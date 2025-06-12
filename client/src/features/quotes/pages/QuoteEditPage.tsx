import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { IconArrowLeft, IconDeviceFloppy as IconSave, IconPlus, IconTrash, IconEye } from '@tabler/icons-react';

import { fetchQuoteById, updateQuote } from '../quoteSlice';
import { fetchCustomers } from '../../customers/customerSlice';
import { fetchProducts } from '../../products/productSlice';
import { fetchTaxCodes } from '../../tax/taxSlice';
import { fetchActivePaymentTypes } from '../../payment-types/paymentTypeSlice';
import { fetchBusinessAddresses, fetchBusinessAddressById } from '../../business-addresses/businessAddressSlice';
import { getUserProfile } from '../../settings/settingsSlice';
import { type Quote, type UpdateQuoteRequest } from '../models/quoteModels';
import { type RootState, type AppDispatch } from '../../../store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

export function QuoteEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { currentQuote, isLoading, error } = useSelector((state: RootState) => state.quotes);
  const { customers } = useSelector((state: RootState) => state.customers);
  const { products } = useSelector((state: RootState) => state.products);
  const { taxCodes } = useSelector((state: RootState) => state.tax);
  const { paymentTypes } = useSelector((state: RootState) => state.paymentTypes);
  const { businessAddresses: _businessAddresses, currentBusinessAddress } = useSelector((state: RootState) => state.businessAddresses);
  const { user: _user } = useSelector((state: RootState) => state.auth);
  const { userProfile: _userProfile } = useSelector((state: RootState) => state.settings);
  
  const [customerId, setCustomerId] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [status, setStatus] = useState<Quote['status']>('DRAFT');
  const [paymentTypeId, setPaymentTypeId] = useState('');
  const [items, setItems] = useState<QuoteItem[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  useEffect(() => {
    if (id) {
      dispatch(fetchQuoteById(id));
    }
    dispatch(fetchCustomers({ page: 1, limit: 100 }));
    dispatch(fetchProducts({ page: 1, limit: 100 }));
    dispatch(fetchTaxCodes({ page: 1, limit: 100 }));
    dispatch(fetchActivePaymentTypes());
    dispatch(fetchBusinessAddresses({ page: 1, limit: 100 }));
    dispatch(getUserProfile());
  }, [dispatch, id]);
  
  useEffect(() => {
    if (currentQuote) {
      setCustomerId(currentQuote.customerId);
      setExpiresAt(currentQuote.expiresAt.split('T')[0]);
      setStatus(currentQuote.status);
      setPaymentTypeId(currentQuote.order?.paymentType?.id || '');
      
      // Transform order.orderCarts to items format
      if (currentQuote.order?.orderCarts) {
        const transformedItems = currentQuote.order.orderCarts.map((cart: any) => {
          const unitPrice = Number(cart.unitPrice) || 0;
          const quantity = Number(cart.quantity) || 0;
          const taxRate = Number(cart.taxRate) || 0;
          const subtotal = quantity * unitPrice;
          const taxAmount = subtotal * (taxRate / 100);
          const total = subtotal + taxAmount;
          
          return {
            productId: cart.productId,
            name: cart.name || cart.product?.name || '',
            quantity: quantity,
            unitPrice: unitPrice,
            description: cart.description,
            taxRate,
            subtotal,
            taxAmount,
            total
          };
        });
        setItems(transformedItems);
      }
    }
  }, [currentQuote]);
  
  // Fetch business address when customer changes
  useEffect(() => {
    if (currentQuote?.customer?.businessAddressId) {
      dispatch(fetchBusinessAddressById(currentQuote.customer.businessAddressId));
    }
  }, [currentQuote?.customer?.businessAddressId, dispatch]);
  
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
  
  const handleSave = async () => {
    if (!customerId.trim()) {
      toast.error('Please select a customer');
      return;
    }
    
    if (items.length === 0) {
      toast.error('At least one product is required');
      return;
    }
    
    // Validate products
    for (const item of items) {
      if (!item.name.trim()) {
        toast.error('Each product must have a name');
        return;
      }
      if (!item.quantity || item.quantity <= 0) {
        toast.error('Each product must have a valid quantity');
        return;
      }
      if (!item.unitPrice || item.unitPrice < 0) {
        toast.error('Each product must have a valid unit price');
        return;
      }
    }

    const quoteData = {
      id: id!,
      customerId,
      totalEstimate: Number(total),
      expiresAt,
      status,
      paymentTypeId: paymentTypeId || undefined,
              orderCarts: items.map(item => ({
          productId: item.productId === 'custom' ? undefined : item.productId,
          name: item.name,
          quantity: parseInt(item.quantity.toString()),
          unitPrice: Number(item.unitPrice),
          description: item.description
        }))
    } as UpdateQuoteRequest;

    setIsSubmitting(true);
    try {
      if (id) {
        await dispatch(updateQuote({ id, quoteData })).unwrap();
        toast.success('Quote updated successfully');
        navigate(`/quotations/${id}`);
      }
    } catch (error: any) {
      console.error('Error updating quote:', error);
      toast.error(error.message || 'Failed to update quote');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedCustomer = customers.find(c => c.id === customerId);

  if (isLoading) {
    return <div className="flex justify-center items-center h-full">Loading...</div>;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <p className="text-red-500">{error}</p>
        <Button variant="outline" onClick={() => navigate('/quotations')} className="mt-4">
          <IconArrowLeft className="mr-2 h-4 w-4" /> Go Back
        </Button>
      </div>
    );
  }

  if (!currentQuote) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <p>Quote not found</p>
        <Button variant="outline" onClick={() => navigate('/quotations')} className="mt-4">
          <IconArrowLeft className="mr-2 h-4 w-4" /> Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 mt-4 sm:mt-8 px-4 sm:px-6 lg:px-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0 h-auto sm:h-10">
        <Button variant="outline" onClick={() => navigate('/quotations')} className="h-10 w-full sm:w-auto">
          <IconArrowLeft className="mr-2 h-4 w-4" /> Back to Quotations
        </Button>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
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
                status={status}
                quoteId={currentQuote.id}
              />
            </DialogContent>
          </Dialog>
          <Button 
            onClick={handleSave}
            disabled={isSubmitting}
            className="h-10 w-full sm:w-auto"
          >
            <IconSave className="mr-2 h-4 w-4" />
            {isSubmitting ? 'Updating...' : 'Update Quote'}
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quote Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Quote Details
                <Badge variant={status === 'DRAFT' ? 'secondary' : status === 'SENT' ? 'default' : status === 'ACCEPTED' ? 'default' : status === 'REJECTED' ? 'destructive' : 'secondary'}>
                  {status}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Customer and Payment Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <span className="h-2 w-2 bg-primary rounded-full"></span>
                    Customer & Payment Information
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pl-4">
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
                      
                      {/* Customer Business Address Display */}
                      {currentBusinessAddress && (
                        <div className="mt-3 p-3 bg-muted/30 rounded-md border">
                          <div className="text-xs font-medium text-muted-foreground mb-2">
                            Business Address:
                          </div>
                          <div className="text-sm space-y-1">
                            <div className="font-medium">
                              {currentBusinessAddress.address}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {currentBusinessAddress.street} {currentBusinessAddress.houseNumber}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {currentBusinessAddress.state}, {currentBusinessAddress.country}
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {currentQuote?.customer?.businessAddressId && !currentBusinessAddress && (
                        <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md border border-blue-200 dark:border-blue-800">
                          <div className="text-xs text-blue-700 dark:text-blue-300">
                            Loading business address...
                          </div>
                        </div>
                      )}
                      
                      {currentQuote?.customer && !currentQuote.customer.businessAddressId && (
                        <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-md border border-yellow-200 dark:border-yellow-800">
                          <div className="text-xs text-yellow-700 dark:text-yellow-300">
                            No business address on file for this customer
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="paymentType" className="text-sm font-medium">
                        Payment Type
                      </Label>
                      <Select value={paymentTypeId} onValueChange={setPaymentTypeId}>
                        <SelectTrigger className="h-11">
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
                </div>
                
                <Separator />
                
                {/* Quote Status and Timeline Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <span className="h-2 w-2 bg-primary rounded-full"></span>
                    Quote Status & Timeline
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pl-4">
                    <div className="space-y-2">
                      <Label htmlFor="expiresAt" className="text-sm font-medium">
                        Expiry Date
                      </Label>
                      <Input 
                        id="expiresAt"
                        type="date"
                        value={expiresAt}
                        onChange={(e) => setExpiresAt(e.target.value)}
                        className="h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="status" className="text-sm font-medium">
                        Status
                      </Label>
                      <Select value={status} onValueChange={(value) => setStatus(value as Quote['status'])}>
                        <SelectTrigger className="h-11">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="DRAFT">
                            <div className="flex items-center gap-2">
                              <span className="h-2 w-2 bg-gray-400 rounded-full"></span>
                              Draft
                            </div>
                          </SelectItem>
                          <SelectItem value="SENT">
                            <div className="flex items-center gap-2">
                              <span className="h-2 w-2 bg-blue-500 rounded-full"></span>
                              Sent
                            </div>
                          </SelectItem>
                          <SelectItem value="ACCEPTED">
                            <div className="flex items-center gap-2">
                              <span className="h-2 w-2 bg-green-500 rounded-full"></span>
                              Accepted
                            </div>
                          </SelectItem>
                          <SelectItem value="REJECTED">
                            <div className="flex items-center gap-2">
                              <span className="h-2 w-2 bg-red-500 rounded-full"></span>
                              Rejected
                            </div>
                          </SelectItem>
                          <SelectItem value="EXPIRED">
                            <div className="flex items-center gap-2">
                              <span className="h-2 w-2 bg-orange-500 rounded-full"></span>
                              Expired
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Total Amount</Label>
                      <div className="h-11 px-4 py-3 border rounded-md bg-muted/50 flex items-center">
                        <span className="text-lg font-bold text-primary">
                          ${total.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Quote Items */}
          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                Quote Items
                <Button size="sm" onClick={handleAddItem}>
                  <IconPlus className="mr-2 h-4 w-4" /> Add Item
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {items.map((item, index) => (
                <Card key={index} className="p-4">
                  {/* Row 1: Product Selection and Name */}
                  <div className="grid grid-cols-1 sm:grid-cols-6 gap-4 mb-4">
                    <div className="sm:col-span-2 space-y-2">
                      <Label>Product (Optional)</Label>
                      <Select 
                        value={item.productId || 'custom'} 
                        onValueChange={(value) => handleItemChange(index, 'productId', value === 'custom' ? undefined : value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select product" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="custom">Custom Item</SelectItem>
                          {products.map((product) => (
                            <SelectItem key={product.id} value={product.id}>
                              {product.name} - ${product.defaultPrice}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="sm:col-span-3 space-y-2">
                      <Label>Item Name *</Label>
                      <Input 
                        value={item.name}
                        onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                        placeholder="Enter item name"
                        disabled={!!item.productId}
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
                        disabled={!!item.productId}
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
                          disabled={!!item.productId}
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
                      placeholder="Enter item description"
                      disabled={!!item.productId}
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
                  <span>Items:</span>
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
                  <Badge variant={status === 'DRAFT' ? 'outline' : status === 'SENT' ? 'secondary' : status === 'ACCEPTED' ? 'default' : 'destructive'}>
                    {status}
                  </Badge>
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
  status: string;
  quoteId: string;
}

function QuotePreview({ customer, items, expiresAt, subtotal, totalTax, total, status, quoteId }: QuotePreviewProps) {
  const { businessAddresses } = useSelector((state: RootState) => state.businessAddresses);
  const primaryBusinessAddress = businessAddresses.find(ba => ba.id) || businessAddresses[0];

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
          <p className="text-gray-600 text-lg">#{quoteId}</p>
        </div>
        <Badge variant={status === 'DRAFT' ? 'outline' : status === 'SENT' ? 'secondary' : status === 'ACCEPTED' ? 'default' : 'destructive'} className="text-base px-4 py-2">
          {status}
        </Badge>
      </div>
      
      <div className="border-t border-gray-200 mb-8" />
      
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 sm:gap-12 mb-10">
        <div>
          <h3 className="text-xl font-semibold mb-4">From</h3>
          <div className="text-base text-gray-600 space-y-2">
            <p className="font-medium text-gray-900">Your Company Name</p>
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
            <p>Your Email</p>
            <p>Your Phone</p>
          </div>
        </div>
        <div>
          <h3 className="text-xl font-semibold mb-4">To</h3>
          {customer ? (
            <div className="text-base text-gray-600 space-y-2">
              <p className="font-medium text-gray-900">{customer.name}</p>
              <p>{customer.email}</p>
              <p>{customer.phone}</p>
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
      
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 sm:gap-12 mb-8">
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
                <td className="py-4 px-6 text-right border border-gray-200">${item.unitPrice.toFixed(2)}</td>
                <td className="py-4 px-6 text-right border border-gray-200">${item.taxAmount.toFixed(2)}</td>
                <td className="py-4 px-6 text-right font-medium border border-gray-200">${item.total.toFixed(2)}</td>
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