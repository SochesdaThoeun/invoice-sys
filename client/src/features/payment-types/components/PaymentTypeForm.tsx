import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import {
  createPaymentType,
  updatePaymentType,
  fetchPaymentTypeById,
  clearCurrentPaymentType
} from '../paymentTypeSlice';
import type { CreatePaymentTypeRequest, UpdatePaymentTypeRequest } from '../models/paymentTypeModels';
import { type RootState, type AppDispatch } from '../../../store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Form validation schema
const formSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
  description: z.string().min(5, { message: 'Description must be at least 5 characters' }),
  isActive: z.boolean(),
});

type FormValues = z.infer<typeof formSchema>;

interface PaymentTypeFormProps {
  editMode?: boolean;
}

export function PaymentTypeForm({ editMode = false }: PaymentTypeFormProps) {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  
  const { currentPaymentType, isLoading, error } = useSelector(
    (state: RootState) => state.paymentTypes
  );
  
  // Initialize the form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      isActive: true,
    },
  });
  
  // Load payment type data when in edit mode
  useEffect(() => {
    if (editMode && id) {
      dispatch(fetchPaymentTypeById(id));
    }
    
    return () => {
      dispatch(clearCurrentPaymentType());
    };
  }, [dispatch, editMode, id]);
  
  // Update form values when payment type data is loaded
  useEffect(() => {
    if (currentPaymentType && editMode) {
      form.reset({
        name: currentPaymentType.name,
        description: currentPaymentType.description,
        isActive: currentPaymentType.isActive,
      });
    }
  }, [currentPaymentType, form, editMode]);
  
  const onSubmit = async (values: FormValues) => {
    try {
      if (editMode && id) {
        const updateData: UpdatePaymentTypeRequest = { 
          id,
          ...values 
        };
        await dispatch(updatePaymentType({ id, paymentTypeData: updateData })).unwrap();
        navigate('/payment-types');
      } else {
        const createData: CreatePaymentTypeRequest = values;
        await dispatch(createPaymentType(createData)).unwrap();
        navigate('/payment-types');
      }
    } catch (error) {
      console.error('Failed to save payment type:', error);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>{editMode ? 'Edit Payment Type' : 'Add New Payment Type'}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Payment type name" {...field} />
                    </FormControl>
                    <FormDescription>
                      A descriptive name for this payment method (e.g., "Credit Card", "PayPal")
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Description of this payment method"
                        className="resize-none"
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Provide a detailed description of this payment method
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Active</FormLabel>
                      <FormDescription>
                        Enable this payment type for use in orders and invoices
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
            
            {error && (
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                {error}
              </div>
            )}
            
            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/payment-types')}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Saving...' : editMode ? 'Update' : 'Create'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
} 