import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import {
  createBusinessAddress,
  updateBusinessAddress,
  fetchBusinessAddressById,
  clearCurrentBusinessAddress
} from '../businessAddressSlice';
import type { CreateBusinessAddressRequest, UpdateBusinessAddressRequest } from '../models/businessAddressModels';
import { type RootState, type AppDispatch } from '../../../store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  country: z.string().min(2, { message: 'Country must be at least 2 characters' }),
  state: z.string().min(2, { message: 'State must be at least 2 characters' }),
  street: z.string().min(2, { message: 'Street must be at least 2 characters' }),
  houseNumber: z.string().min(1, { message: 'House number is required' }),
  address: z.string().min(5, { message: 'Address must be at least 5 characters' }),
});

type FormValues = z.infer<typeof formSchema>;

interface BusinessAddressFormProps {
  editMode?: boolean;
}

export function BusinessAddressForm({ editMode = false }: BusinessAddressFormProps) {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  
  const { currentBusinessAddress, isLoading, error } = useSelector(
    (state: RootState) => state.businessAddresses
  );
  
  // Initialize the form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      country: '',
      state: '',
      street: '',
      houseNumber: '',
      address: '',
    },
  });
  
  // Load business address data when in edit mode
  useEffect(() => {
    if (editMode && id) {
      dispatch(fetchBusinessAddressById(id));
    }
    
    return () => {
      dispatch(clearCurrentBusinessAddress());
    };
  }, [dispatch, editMode, id]);
  
  // Update form values when business address data is loaded
  useEffect(() => {
    if (currentBusinessAddress && editMode) {
      form.reset({
        country: currentBusinessAddress.country,
        state: currentBusinessAddress.state,
        street: currentBusinessAddress.street,
        houseNumber: currentBusinessAddress.houseNumber,
        address: currentBusinessAddress.address,
      });
    }
  }, [currentBusinessAddress, form, editMode]);
  
  const onSubmit = async (values: FormValues) => {
    try {
      if (editMode && id) {
        const updateData: UpdateBusinessAddressRequest = {
          country: values.country,
          state: values.state,
          street: values.street,
          houseNumber: values.houseNumber,
          address: values.address,
        };
        await dispatch(updateBusinessAddress({ id, businessAddressData: updateData })).unwrap();
        navigate('/business-addresses');
      } else {
        const createData: CreateBusinessAddressRequest = values;
        await dispatch(createBusinessAddress(createData)).unwrap();
        navigate('/business-addresses');
      }
    } catch (error) {
      console.error('Failed to save business address:', error);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>{editMode ? 'Edit Business Address' : 'Add New Business Address'}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Address</FormLabel>
                    <FormControl>
                      <Input placeholder="Complete business address" {...field} />
                    </FormControl>
                    <FormDescription>Complete address of the business</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="street"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Street</FormLabel>
                      <FormControl>
                        <Input placeholder="Street name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="houseNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>House/Building Number</FormLabel>
                      <FormControl>
                        <Input placeholder="123" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>State/Province</FormLabel>
                      <FormControl>
                        <Input placeholder="CA" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country</FormLabel>
                      <FormControl>
                        <Input placeholder="US" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            
            <div className="flex items-center justify-end space-x-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => navigate('/business-addresses')}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Saving...' : editMode ? 'Update Business Address' : 'Create Business Address'}
              </Button>
            </div>
            
            {error && (
              <div className="text-destructive mt-4 text-sm">
                Error: {error}
              </div>
            )}
          </form>
        </Form>
      </CardContent>
    </Card>
  );
} 