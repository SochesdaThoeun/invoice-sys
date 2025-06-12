import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { IconArrowLeft, IconDeviceFloppy as IconSave, IconPlus, IconTrash, IconEye } from '@tabler/icons-react';
import { format } from 'date-fns';

import { fetchInvoiceById, updateInvoice } from '../invoiceSlice';
import { fetchCustomers } from '../../customers/customerSlice';
import { fetchProducts } from '../../products/productSlice';
import { fetchTaxCodes } from '../../tax/taxSlice';
import { fetchActivePaymentTypes } from '../../payment-types/paymentTypeSlice';
import { fetchBusinessAddresses, fetchBusinessAddressById } from '../../business-addresses/businessAddressSlice';
import { getUserProfile } from '../../settings/settingsSlice';
import { type Invoice, type UpdateInvoiceRequest } from '../models/invoiceModels';
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

interface InvoiceItem {
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

export function InvoiceEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { currentInvoice, isLoading, error } = useSelector((state: RootState) => state.invoices);
  const { customers } = useSelector((state: RootState) => state.customers);
  const { products } = useSelector((state: RootState) => state.products);
  const { taxCodes } = useSelector((state: RootState) => state.tax);
  const { paymentTypes } = useSelector((state: RootState) => state.paymentTypes);
  const { businessAddresses, currentBusinessAddress } = useSelector((state: RootState) => state.businessAddresses);
  const { user } = useSelector((state: RootState) => state.auth);
  const { userProfile } = useSelector((state: RootState) => state.settings);
  
  const [customerId, setCustomerId] = useState('');
  const [language, setLanguage] = useState('en');
  const [governmentTemplate, setGovernmentTemplate] = useState('standard');
  const [status, setStatus] = useState<Invoice['status']>('DRAFT');
  const [paymentTypeId, setPaymentTypeId] = useState('');
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  useEffect(() => {
    if (id) {
      dispatch(fetchInvoiceById(id));
    }
    dispatch(fetchCustomers({ page: 1, limit: 100 }));
    dispatch(fetchProducts({ page: 1, limit: 100 }));
    dispatch(fetchTaxCodes({ page: 1, limit: 100 }));
    dispatch(fetchActivePaymentTypes());
    dispatch(fetchBusinessAddresses({ page: 1, limit: 100 }));
    dispatch(getUserProfile());
  }, [dispatch, id]);
  
  useEffect(() => {
    if (currentInvoice) {
      setCustomerId(currentInvoice.customerId);
      setLanguage(currentInvoice.language || 'en');
      setGovernmentTemplate(currentInvoice.governmentTemplate || 'standard');
      setStatus(currentInvoice.status);
      setPaymentTypeId(currentInvoice.order?.paymentType?.id || '');
      
      // Transform order.orderCarts to items format
      if (currentInvoice.order?.orderCarts) {
        const transformedItems = currentInvoice.order.orderCarts.map((cart) => {
          const unitPrice = Number(cart.unitPrice) || 0;
          const quantity = Number(cart.quantity) || 0;
          const taxRate = Number(cart.taxRate) || 0;
          const subtotal = quantity * unitPrice;
          const taxAmount = subtotal * (taxRate / 100);
          const total = subtotal + taxAmount;
          
          return {
            productId: cart.productId,
            name: cart.name || '',
            quantity: quantity,
            unitPrice: unitPrice,
            description: cart.description || '',
            taxCodeId: cart.taxCodeId || undefined,
            taxRate,
            subtotal,
            taxAmount,
            total
          };
        });
        setItems(transformedItems);
      }
    }
  }, [currentInvoice]);
  
  // Fetch business address when customer changes
  useEffect(() => {
    if (currentInvoice?.customer?.businessAddressId) {
      dispatch(fetchBusinessAddressById(currentInvoice.customer.businessAddressId));
    }
  }, [currentInvoice?.customer?.businessAddressId, dispatch]);
  
  const calculateItemTotals = (item: InvoiceItem) => {
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
  
  const handleItemChange = (index: number, field: keyof InvoiceItem, value: any) => {
    const updatedItems = [...items];
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: value
    };
    
    // If product is selected, populate details
    if (field === 'productId' && value) {
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
  
  const calculateInvoiceTotals = () => {
    const subtotal = items.reduce((sum, item) => sum + (Number(item.subtotal) || 0), 0);
    const totalTax = items.reduce((sum, item) => sum + (Number(item.taxAmount) || 0), 0);
    const total = subtotal + totalTax;
    
    return { subtotal, totalTax, total };
  };
  
  const { subtotal, totalTax, total } = calculateInvoiceTotals();
  
  const handleSave = async () => {
    if (!customerId.trim()) {
      toast.error('Please select a customer');
      return;
    }
    
    if (items.length === 0) {
      toast.error('At least one item is required');
      return;
    }
    
    // Validate items
    for (const item of items) {
      if (!item.name.trim()) {
        toast.error('Each item must have a name');
        return;
      }
      if (!item.quantity || item.quantity <= 0) {
        toast.error('Each item must have a valid quantity');
        return;
      }
      if (item.unitPrice < 0) {
        toast.error('Each item must have a valid unit price');
        return;
      }
    }

    const invoiceData = {
      language: language || undefined,
      governmentTemplate: governmentTemplate || undefined,
      status,
      orderCarts: items.map(item => ({
        productId: item.productId,
        name: item.name,
        quantity: parseInt(item.quantity.toString()),
        unitPrice: Number(item.unitPrice),
        description: item.description
      }))
    } as UpdateInvoiceRequest;

    setIsSubmitting(true);
    try {
      if (id) {
        await dispatch(updateInvoice({ id, invoiceData })).unwrap();
        toast.success('Invoice updated successfully');
        navigate(`/invoices/${id}`);
      }
    } catch (error: any) {
      console.error('Error updating invoice:', error);
      toast.error(error.message || 'Failed to update invoice');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedCustomer = customers.find(c => c.id === customerId);
  
  // Get primary business address
  const primaryBusinessAddress = businessAddresses.find(ba => ba.id) || businessAddresses[0];

  if (isLoading) {
    return <div className="flex justify-center items-center h-full">Loading...</div>;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <p className="text-red-500">{error}</p>
        <Button variant="outline" onClick={() => navigate('/invoices')} className="mt-4">
          <IconArrowLeft className="mr-2 h-4 w-4" /> Go Back
        </Button>
      </div>
    );
  }

  if (!currentInvoice) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <p>Invoice not found</p>
        <Button variant="outline" onClick={() => navigate('/invoices')} className="mt-4">
          <IconArrowLeft className="mr-2 h-4 w-4" /> Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 mt-4 sm:mt-8 px-4 sm:px-6 lg:px-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0 h-auto sm:h-10">
        <Button variant="outline" onClick={() => navigate('/invoices')} className="h-10 w-full sm:w-auto">
          <IconArrowLeft className="mr-2 h-4 w-4" /> Back to Invoices
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
                <DialogTitle>Invoice Preview</DialogTitle>
              </DialogHeader>
              <InvoicePreview 
                customer={selectedCustomer}
                items={items}
                subtotal={subtotal}
                totalTax={totalTax}
                total={total}
                status={status}
                invoiceId={currentInvoice.id}
                language={language}
                governmentTemplate={governmentTemplate}
                user={user}
                userProfile={userProfile}
                primaryBusinessAddress={primaryBusinessAddress}
                customerBusinessAddress={currentBusinessAddress}
              />
            </DialogContent>
          </Dialog>
          <Button 
            onClick={handleSave}
            disabled={isSubmitting}
            className="h-10 w-full sm:w-auto"
          >
            <IconSave className="mr-2 h-4 w-4" />
            {isSubmitting ? 'Updating...' : 'Update Invoice'}
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Invoice Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Invoice Details
                <Badge variant={status === 'DRAFT' ? 'secondary' : status === 'ISSUED' ? 'default' : 'default'}>
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
                              <div className="flex flex-col items-start">
                                <span className="font-medium">{paymentType.name}</span>
                                <span className="text-xs text-muted-foreground">{paymentType.description}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Invoice Settings Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <span className="h-2 w-2 bg-primary rounded-full"></span>
                    Invoice Settings
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pl-4">
                    <div className="space-y-2">
                      <Label htmlFor="language" className="text-sm font-medium">
                        Language
                      </Label>
                      <Select value={language} onValueChange={setLanguage}>
                        <SelectTrigger className="h-11">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="es">Spanish</SelectItem>
                          <SelectItem value="fr">French</SelectItem>
                          <SelectItem value="de">German</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="template" className="text-sm font-medium">
                        Government Template
                      </Label>
                      <Select value={governmentTemplate} onValueChange={setGovernmentTemplate}>
                        <SelectTrigger className="h-11">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="standard">Standard</SelectItem>
                          <SelectItem value="government">Government</SelectItem>
                          <SelectItem value="simplified">Simplified</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="status" className="text-sm font-medium">
                        Status
                      </Label>
                      <Select value={status} onValueChange={(value: Invoice['status']) => setStatus(value)}>
                        <SelectTrigger className="h-11">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="DRAFT">Draft</SelectItem>
                          <SelectItem value="ISSUED">Issued</SelectItem>
                          <SelectItem value="PAID">Paid</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Line Items */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Line Items</CardTitle>
                <Button onClick={handleAddItem} size="sm">
                  <IconPlus className="mr-2 h-4 w-4" />
                  Add Item
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
                          <Label className="text-sm font-medium">Product (Optional)</Label>
                          <Select
                            value={item.productId || ''}
                            onValueChange={(value) => handleItemChange(index, 'productId', value)}
                          >
                            <SelectTrigger className="h-11">
                              <SelectValue placeholder="Select a product" />
                            </SelectTrigger>
                            <SelectContent>
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
                          <Label className="text-sm font-medium">Item Name *</Label>
                          <Input
                            value={item.name}
                            onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                            placeholder="Enter item name"
                            className="h-11"
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Description</Label>
                        <Input
                          value={item.description || ''}
                          onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                          placeholder="Enter item description"
                          className="h-11"
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
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
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Tax Rate %</Label>
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            step="0.01"
                            value={Number(item.taxRate) || 0}
                            onChange={(e) => handleItemChange(index, 'taxRate', parseFloat(e.target.value) || 0)}
                            className="h-11"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Tax Amount</Label>
                          <Input
                            value={`$${(Number(item.taxAmount) || 0).toFixed(2)}`}
                            readOnly
                            className="h-11 bg-muted/50"
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
              <CardTitle>Invoice Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Items:</span>
                  <span className="font-medium">{items.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Status:</span>
                  <Badge variant={status === 'DRAFT' ? 'secondary' : status === 'ISSUED' ? 'default' : 'default'}>
                    {status}
                  </Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Language:</span>
                  <span className="font-medium">{language.toUpperCase()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Template:</span>
                  <span className="font-medium">{governmentTemplate}</span>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal:</span>
                  <span className="font-medium">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax:</span>
                  <span className="font-medium">${totalTax.toFixed(2)}</span>
                </div>
                
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

// Invoice Preview Component
interface InvoicePreviewProps {
  customer?: any;
  items: InvoiceItem[];
  subtotal: number;
  totalTax: number;
  total: number;
  status: string;
  invoiceId: string;
  language: string;
  governmentTemplate: string;
  user?: any;
  userProfile?: any;
  primaryBusinessAddress?: any;
  customerBusinessAddress?: any;
}

function InvoicePreview({ customer, items, subtotal, totalTax, total, status, invoiceId, language, governmentTemplate, user, userProfile, primaryBusinessAddress, customerBusinessAddress }: InvoicePreviewProps) {
  return (
    <div className="bg-white p-8 space-y-8 text-black">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">Invoice</h1>
          <p className="text-lg text-gray-600 mt-1">#{invoiceId}</p>
        </div>
        <div className="text-right">
          <Badge variant={status === 'DRAFT' ? 'secondary' : status === 'ISSUED' ? 'default' : 'default'}>
            {status}
          </Badge>
          <div className="mt-2 text-sm text-gray-600">
            <p>Date: {format(new Date(), 'MMM dd, yyyy')}</p>
            <p>Language: {language.toUpperCase()}</p>
            <p>Template: {governmentTemplate}</p>
          </div>
        </div>
      </div>
      
      <Separator />
      
      {/* Company and Customer Details */}
      <div className="grid grid-cols-2 gap-8">
        <div>
          <h3 className="font-semibold text-lg mb-3">From</h3>
          <div className="text-gray-600 space-y-1">
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
          <h3 className="font-semibold text-lg mb-3">To</h3>
          <div className="text-gray-600 space-y-1">
            <p className="font-medium text-gray-900">
              {customer?.businessName || customer?.name || 'Customer Name'}
            </p>
            {customer?.businessRegistrationNumber && (
              <p className="text-sm">Registration: {customer.businessRegistrationNumber}</p>
            )}
            <p>{customer?.email || 'customer@email.com'}</p>
            {customer?.phone && <p>{customer.phone}</p>}
            {customerBusinessAddress && (
              <>
                <p>{customerBusinessAddress.address}</p>
                <p>{customerBusinessAddress.street} {customerBusinessAddress.houseNumber}</p>
                <p>{customerBusinessAddress.state}, {customerBusinessAddress.country}</p>
              </>
            )}
          </div>
        </div>
      </div>
      
      <Separator />
      
      {/* Items Table */}
      <div>
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-3 font-semibold">Description</th>
              <th className="text-center py-3 font-semibold w-20">Qty</th>
              <th className="text-right py-3 font-semibold w-24">Unit Price</th>
              <th className="text-right py-3 font-semibold w-20">Tax</th>
              <th className="text-right py-3 font-semibold w-24">Total</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={index} className="border-b">
                <td className="py-3">
                  <div>
                    <p className="font-medium">{item.name}</p>
                    {item.description && (
                      <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                    )}
                  </div>
                </td>
                <td className="py-3 text-center">{item.quantity}</td>
                <td className="py-3 text-right">${(Number(item.unitPrice) || 0).toFixed(2)}</td>
                <td className="py-3 text-right">${(Number(item.taxAmount) || 0).toFixed(2)}</td>
                <td className="py-3 text-right font-medium">${(Number(item.total) || 0).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Totals */}
      <div className="flex justify-end">
        <div className="w-64 space-y-2">
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
      </div>
      
      {/* Payment Terms */}
      <div className="mt-8">
        <h3 className="font-semibold text-lg mb-3">Payment Terms</h3>
        <div className="text-sm text-gray-600 space-y-1">
          <p>• Payment is due within 30 days of invoice date.</p>
          <p>• All prices are quoted in USD.</p>
          <p>• Late payments may incur additional charges.</p>
        </div>
      </div>
    </div>
  );
} 