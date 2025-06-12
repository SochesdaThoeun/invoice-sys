import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { IconArrowLeft, IconPlus, IconTrash } from '@tabler/icons-react';

import { fetchOrderById, updateOrder, clearCurrentOrder } from '../orderSlice';
import { fetchProducts } from '../../products/productSlice';
import { type UpdateOrderRequest } from '../models/orderModels';
import { type AppDispatch, type RootState } from '../../../store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

interface OrderItem {
  productId?: string;
  quantity: number;
  unitPrice: number;
}

export function OrderEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  
  const { currentOrder, isLoading } = useSelector((state: RootState) => state.orders);
  const { products } = useSelector((state: RootState) => state.products);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  useEffect(() => {
    if (id) {
      dispatch(fetchOrderById(id));
    }
    dispatch(fetchProducts({ page: 1, limit: 100 }));
    
    return () => {
      dispatch(clearCurrentOrder());
    };
  }, [dispatch, id]);

  useEffect(() => {
    if (currentOrder) {
      setItems(currentOrder.orderCarts.map(cart => ({
        productId: cart.productId || undefined,
        quantity: cart.quantity,
        unitPrice: parseFloat(cart.unitPrice || '0')
      })));
    }
  }, [currentOrder]);

  const handleItemChange = (index: number, field: keyof OrderItem, value: any) => {
    const updatedItems = [...items];
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: value
    };
    setItems(updatedItems);
  };

  const handleAddItem = () => {
    setItems([
      ...items,
      {
        quantity: 1,
        unitPrice: 0
      }
    ]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  };

  const validateForm = () => {
    const errors: string[] = [];
    
    if (items.length === 0) {
      errors.push('At least one item is required');
    }

    // Validate items
    for (const [index, item] of items.entries()) {
      if (!item.quantity || item.quantity <= 0) {
        errors.push(`Item ${index + 1}: Quantity must be greater than 0`);
      }
      if (item.unitPrice === undefined || item.unitPrice < 0) {
        errors.push(`Item ${index + 1}: Unit price must be 0 or greater`);
      }
    }

    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleSubmit = async () => {
    if (!currentOrder) return;
    
    setValidationErrors([]);
    
    if (!validateForm()) {
      return;
    }

    const orderData: UpdateOrderRequest = {
      totalAmount: calculateTotal(),
      orderCarts: items.map(item => ({
        productId: item.productId || undefined,
        quantity: item.quantity,
        unitPrice: item.unitPrice
      }))
    };

    setIsSubmitting(true);
    try {
      await dispatch(updateOrder({ id: currentOrder.id, orderData })).unwrap();
      toast.success('Order updated successfully');
      navigate(`/orders/${currentOrder.id}`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update order');
    } finally {
      setIsSubmitting(false);
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

  if (!currentOrder) {
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
              Order not found
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

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
                Please fix the following issues before updating the order:
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
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
          <Button variant="outline" onClick={() => navigate(`/orders/${currentOrder.id}`)} className="h-10 w-full sm:w-auto">
            <IconArrowLeft className="mr-2 h-4 w-4" /> Back to Order
          </Button>
          <div className="text-center sm:text-left">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Edit Order</h2>
            <p className="text-muted-foreground text-sm">
              Order #{currentOrder.id.slice(0, 8)}...
            </p>
          </div>
        </div>
        <Button 
          onClick={handleSubmit}
          disabled={isSubmitting || items.length === 0}
          className="h-10 w-full sm:w-auto"
        >
          {isSubmitting ? 'Updating Order...' : 'Update Order'}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Items */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0">
              <CardTitle>Order Items</CardTitle>
              <Button onClick={handleAddItem} className="w-full sm:w-auto">
                <IconPlus className="mr-2 h-4 w-4" />
                Add Item
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {items.map((item, index) => (
                <div key={index} className="p-4 border rounded-lg space-y-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0">
                    <h4 className="font-medium">Item {index + 1}</h4>
                    {items.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveItem(index)}
                        className="w-full sm:w-auto"
                      >
                        <IconTrash className="h-4 w-4 mr-2 sm:mr-0" />
                        <span className="sm:hidden">Remove Item</span>
                      </Button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`product-${index}`}>Product</Label>
                      <select
                        id={`product-${index}`}
                        className="w-full p-2 border rounded-md h-10"
                        value={item.productId || ''}
                        onChange={(e) => {
                          const productId = e.target.value;
                          const selectedProduct = products.find(p => p.id === productId);
                          handleItemChange(index, 'productId', productId);
                          if (selectedProduct) {
                            handleItemChange(index, 'unitPrice', Number(selectedProduct.defaultPrice || 0));
                          }
                        }}
                      >
                        <option value="">Select a product</option>
                        {products.map((product) => (
                          <option key={product.id} value={product.id}>
                            {product.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor={`quantity-${index}`}>Quantity</Label>
                      <Input
                        id={`quantity-${index}`}
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value) || 1)}
                        className="h-10"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor={`price-${index}`}>Unit Price</Label>
                      <Input
                        id={`price-${index}`}
                        type="number"
                        step="0.01"
                        min="0"
                        value={item.unitPrice}
                        onChange={(e) => handleItemChange(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                        className="h-10"
                      />
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <span className="text-sm text-muted-foreground">
                      Line Total: <span className="font-medium">${(item.quantity * item.unitPrice).toFixed(2)}</span>
                    </span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Order Summary */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Customer:</span>
                  <span className="font-medium text-right">{currentOrder.customer?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span>Items:</span>
                  <span>{items.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Order ID:</span>
                  <span className="font-mono text-sm">{currentOrder.id.slice(0, 8)}...</span>
                </div>
              </div>
              <Separator />
              <div className="flex justify-between text-lg font-bold">
                <span>Total:</span>
                <span>${calculateTotal().toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 