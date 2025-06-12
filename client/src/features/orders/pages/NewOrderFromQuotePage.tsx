import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { IconArrowLeft, IconShoppingCart, IconUser, IconCreditCard } from '@tabler/icons-react';

import { createOrderFromQuote } from '../orderSlice';
import { fetchQuoteById } from '../../quotes/quoteSlice';
import { type CreateOrderFromQuoteRequest } from '../models/orderModels';
import { type AppDispatch, type RootState } from '../../../store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';

export function NewOrderFromQuotePage() {
  const { quoteId } = useParams<{ quoteId: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  
  const { currentQuote } = useSelector((state: RootState) => state.quotes);
  const { isLoading: isCreating } = useSelector((state: RootState) => state.orders);
  const [createInvoice, setCreateInvoice] = useState(false);

  useEffect(() => {
    if (quoteId) {
      dispatch(fetchQuoteById(quoteId));
    }
  }, [dispatch, quoteId]);

  const handleSubmit = async () => {
    if (!currentQuote || !quoteId) {
      toast.error('Quote not found');
      return;
    }

    if (!currentQuote.order?.orderCarts || currentQuote.order.orderCarts.length === 0) {
      toast.error('No items found in quote');
      return;
    }

    const orderData: CreateOrderFromQuoteRequest = {
      quoteId,
      totalAmount: parseFloat(currentQuote.totalEstimate || '0'),
      createInvoice,
      orderCarts: currentQuote.order.orderCarts.map(cart => ({
        productId: cart.productId,
        quantity: cart.quantity,
        unitPrice: parseFloat(cart.unitPrice || '0')
      }))
    };

    try {
      const result = await dispatch(createOrderFromQuote(orderData)).unwrap();
      toast.success('Order created from quote successfully');
      navigate(`/orders/${result.id}`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to create order from quote');
    }
  };

  if (!currentQuote) {
    return (
      <div className="max-w-6xl mx-auto space-y-6 mt-4 sm:mt-8 px-4 sm:px-6 lg:px-0">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0 h-auto sm:h-10">
          <Button variant="outline" onClick={() => navigate('/quotations')} className="h-10 w-full sm:w-auto">
            <IconArrowLeft className="mr-2 h-4 w-4" /> Back to Quotations
          </Button>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              {quoteId ? 'Loading quote...' : 'Quote not found'}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalAmount = parseFloat(currentQuote.totalEstimate || '0');

  return (
    <div className="max-w-6xl mx-auto space-y-6 mt-4 sm:mt-8 px-4 sm:px-6 lg:px-0">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 lg:gap-0">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
          <Button variant="outline" onClick={() => navigate(`/quotations/${quoteId}`)} className="h-10 w-full sm:w-auto">
            <IconArrowLeft className="mr-2 h-4 w-4" /> Back to Quote
          </Button>
          <div className="text-center sm:text-left">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Create Order from Quote</h2>
            <p className="text-muted-foreground text-sm">
              Quote #{currentQuote.id.slice(0, 8)}...
            </p>
          </div>
        </div>
        <Button 
          onClick={handleSubmit}
          disabled={isCreating || !currentQuote.order?.orderCarts?.length}
          className="h-10 w-full sm:w-auto"
        >
          {isCreating ? 'Creating Order...' : 'Create Order'}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quote Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <IconUser className="h-5 w-5" />
                Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              {currentQuote.customer ? (
                <div className="space-y-2">
                  <div className="flex flex-col sm:flex-row sm:justify-between">
                    <span className="font-medium">Name:</span> 
                    <span className="text-right">{currentQuote.customer.name}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between">
                    <span className="font-medium">Email:</span> 
                    <span className="text-right">{currentQuote.customer.email}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between">
                    <span className="font-medium">Phone:</span> 
                    <span className="text-right">{currentQuote.customer.phone}</span>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">No customer information available</p>
              )}
            </CardContent>
          </Card>

          {/* Quote Items */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <IconShoppingCart className="h-5 w-5" />
                Quote Items
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table className="min-w-[600px]">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead className="text-right">Quantity</TableHead>
                      <TableHead className="text-right">Unit Price</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentQuote.order?.orderCarts?.map((item) => {
                      const unitPrice = parseFloat(item.unitPrice || '0');
                      const lineTotal = parseFloat(item.lineTotal || '0');
                      
                      return (
                        <TableRow key={item.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">
                                {item.product?.name || item.name || 'Unknown Product'}
                              </div>
                              {item.description && (
                                <div className="text-sm text-muted-foreground">
                                  {item.description}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">{item.quantity}</TableCell>
                          <TableCell className="text-right">${unitPrice.toFixed(2)}</TableCell>
                          <TableCell className="text-right">${lineTotal.toFixed(2)}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Order Summary */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quote Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Quote ID:</span>
                  <span className="font-mono text-sm">{currentQuote.id.slice(0, 8)}...</span>
                </div>
                <div className="flex justify-between">
                  <span>Status:</span>
                  <Badge variant="outline">{currentQuote.status}</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Expires:</span>
                  <span className="text-right">{new Date(currentQuote.expiresAt).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Items:</span>
                  <span>{currentQuote.order?.orderCarts?.length || 0}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Order Options */}
          <Card>
            <CardHeader>
              <CardTitle>Order Options</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="create-invoice">Create Invoice</Label>
                <Switch
                  id="create-invoice"
                  checked={createInvoice}
                  onCheckedChange={setCreateInvoice}
                />
              </div>
            </CardContent>
          </Card>

          {/* Total & Create Order */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <IconCreditCard className="h-5 w-5" />
                Order Total
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total:</span>
                  <span>${totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 