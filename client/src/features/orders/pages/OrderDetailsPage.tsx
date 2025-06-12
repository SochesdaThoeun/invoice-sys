import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { IconArrowLeft, IconEdit, IconFileInvoice, IconFileText, IconTrash } from '@tabler/icons-react';

import { fetchOrderById, deleteOrder, convertOrderToInvoice, clearCurrentOrder } from '../orderSlice';
import { type AppDispatch, type RootState } from '../../../store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

export function OrderDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  
  const { currentOrder, isLoading, error } = useSelector((state: RootState) => state.orders);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [convertDialogOpen, setConvertDialogOpen] = useState(false);
  const [language, setLanguage] = useState('en-US');
  const [governmentTemplate, setGovernmentTemplate] = useState('standard');

  useEffect(() => {
    if (id) {
      dispatch(fetchOrderById(id));
    }
    
    return () => {
      dispatch(clearCurrentOrder());
    };
  }, [dispatch, id]);

  const handleDelete = async () => {
    if (!currentOrder) return;
    
    try {
      await dispatch(deleteOrder(currentOrder.id)).unwrap();
      toast.success('Order deleted successfully');
      navigate('/orders');
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete order');
    }
  };

  const handleConvertToInvoice = async () => {
    if (!currentOrder) return;
    
    try {
      await dispatch(convertOrderToInvoice({
        id: currentOrder.id,
        data: { language, governmentTemplate }
      })).unwrap();
      toast.success('Order converted to invoice successfully');
      setConvertDialogOpen(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to convert order to invoice');
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto space-y-6 mt-4 sm:mt-8 px-4 sm:px-6 lg:px-0">
        <div className="flex items-center justify-center h-32">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600"></div>
        </div>
      </div>
    );
  }

  if (error || !currentOrder) {
    return (
      <div className="max-w-6xl mx-auto space-y-6 mt-4 sm:mt-8 px-4 sm:px-6 lg:px-0">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0 h-auto sm:h-10">
          <Button variant="outline" onClick={() => navigate('/orders')} className="h-10 w-full sm:w-auto">
            <IconArrowLeft className="mr-2 h-4 w-4" /> Back to Orders
          </Button>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-red-600">
              {error || 'Order not found'}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalAmount = parseFloat(currentOrder.totalAmount || '0');

  return (
    <>
      <div className="max-w-6xl mx-auto space-y-6 mt-4 sm:mt-8 px-4 sm:px-6 lg:px-0">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 lg:gap-0">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
            <Button variant="outline" onClick={() => navigate('/orders')} className="h-10 w-full sm:w-auto">
              <IconArrowLeft className="mr-2 h-4 w-4" /> Back to Orders
            </Button>
            <div className="text-center sm:text-left">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Order Details</h2>
              <p className="text-muted-foreground text-sm">
                Order #{currentOrder.id.slice(0, 8)}...
              </p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
            {currentOrder.quote && (
              <Button
                variant="outline"
                onClick={() => navigate(`/quotations/${currentOrder.quote?.id}`)}
                className="h-10 w-full sm:w-auto"
              >
                <IconFileText className="mr-2 h-4 w-4" />
                View Quote
              </Button>
            )}
            {currentOrder.invoice && (
              <Button
                variant="outline"
                onClick={() => navigate(`/invoices/${currentOrder.invoice?.id}`)}
                className="h-10 w-full sm:w-auto"
              >
                <IconFileInvoice className="mr-2 h-4 w-4" />
                View Invoice
              </Button>
            )}
            {!currentOrder.invoice && (
              <Button
                variant="outline"
                onClick={() => setConvertDialogOpen(true)}
                className="h-10 w-full sm:w-auto"
              >
                <IconFileInvoice className="mr-2 h-4 w-4" />
                Convert to Invoice
              </Button>
            )}
            <Button
              variant="outline"
              onClick={() => navigate(`/orders/${currentOrder.id}/edit`)}
              className="h-10 w-full sm:w-auto"
            >
              <IconEdit className="mr-2 h-4 w-4" />
              Edit
            </Button>
            <Button
              variant="destructive"
              onClick={() => setShowDeleteDialog(true)}
              className="h-10 w-full sm:w-auto"
            >
              <IconTrash className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Order Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Customer Information */}
            <Card>
              <CardHeader>
                <CardTitle>Customer Information</CardTitle>
              </CardHeader>
              <CardContent>
                {currentOrder.customer ? (
                  <div className="space-y-2">
                    <div className="flex flex-col sm:flex-row sm:justify-between">
                      <span className="font-medium">Name:</span> 
                      <span className="text-right">{currentOrder.customer.name}</span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:justify-between">
                      <span className="font-medium">Email:</span> 
                      <span className="text-right">{currentOrder.customer.email}</span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:justify-between">
                      <span className="font-medium">Phone:</span> 
                      <span className="text-right">{currentOrder.customer.phone}</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground">No customer information available</p>
                )}
              </CardContent>
            </Card>

            {/* Order Items */}
            <Card>
              <CardHeader>
                <CardTitle>Order Items</CardTitle>
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
                      {currentOrder.orderCarts.map((item) => {
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
                                {item.sku && (
                                  <div className="text-xs text-muted-foreground">
                                    SKU: {item.sku}
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
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Order ID:</span>
                    <span className="font-mono text-sm">{currentOrder.id.slice(0, 8)}...</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Created:</span>
                    <span className="text-right">{new Date(currentOrder.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Updated:</span>
                    <span className="text-right">{new Date(currentOrder.updatedAt).toLocaleDateString()}</span>
                  </div>
                  {currentOrder.quote && (
                    <div className="flex justify-between">
                      <span>Quote Status:</span>
                      <Badge variant="outline">{currentOrder.quote.status}</Badge>
                    </div>
                  )}
                  {currentOrder.invoice && (
                    <div className="flex justify-between">
                      <span>Invoice Status:</span>
                      <Badge variant={currentOrder.invoice.status === 'ISSUED' ? 'default' : 'secondary'}>
                        {currentOrder.invoice.status}
                      </Badge>
                    </div>
                  )}
                  {currentOrder.paymentType && (
                    <div className="flex justify-between">
                      <span>Payment Type:</span>
                      <span className="text-right">{currentOrder.paymentType.name}</span>
                    </div>
                  )}
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total Amount:</span>
                  <span>${totalAmount.toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this order? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Convert to Invoice Dialog */}
      <Dialog open={convertDialogOpen} onOpenChange={setConvertDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Convert Order to Invoice</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="language">Language</Label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en-US">English (US)</SelectItem>
                  <SelectItem value="es-ES">Spanish</SelectItem>
                  <SelectItem value="fr-FR">French</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="template">Government Template</Label>
              <Select value={governmentTemplate} onValueChange={setGovernmentTemplate}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">Standard</SelectItem>
                  <SelectItem value="government">Government</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setConvertDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleConvertToInvoice}>
                Convert to Invoice
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
} 