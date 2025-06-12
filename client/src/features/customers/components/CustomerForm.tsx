import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import {
  createCustomer,
  updateCustomer,
  fetchCustomerById,
  clearCurrentCustomer
} from '../customerSlice';
import type { CreateCustomerRequest, UpdateCustomerRequest } from '../models/customerModels';
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
import { Separator } from '@/components/ui/separator';

// Form validation schema
const formSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
  email: z.string().email({ message: 'Please enter a valid email address' }).optional().or(z.literal('')),
  phone: z.string().optional(),
  businessRegistrationNumber: z.string().optional(),
  businessName: z.string().optional(),
  businessAddress: z.object({
    country: z.string().optional(),
    state: z.string().optional(),
    street: z.string().optional(),
    houseNumber: z.string().optional(),
    address: z.string().optional(),
  }).optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface CustomerFormProps {
  editMode?: boolean;
}

export function CustomerForm({ editMode = false }: CustomerFormProps) {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  
  const { currentCustomer, isLoading, error } = useSelector(
    (state: RootState) => state.customers
  );
  
  // Initialize the form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      businessRegistrationNumber: '',
      businessName: '',
      businessAddress: {
        country: '',
        state: '',
        street: '',
        houseNumber: '',
        address: '',
      },
    },
  });
  
  // Load customer data when in edit mode
  useEffect(() => {
    if (editMode && id) {
      dispatch(fetchCustomerById(id));
    }
    
    return () => {
      dispatch(clearCurrentCustomer());
    };
  }, [dispatch, editMode, id]);
  
  // Update form values when customer data is loaded
  useEffect(() => {
    if (currentCustomer && editMode) {
      form.reset({
        name: currentCustomer.name,
        email: currentCustomer.email || '',
        phone: currentCustomer.phone || '',
        businessRegistrationNumber: currentCustomer.businessRegistrationNumber || '',
        businessName: currentCustomer.businessName || '',
        businessAddress: currentCustomer.businessAddress ? {
          country: currentCustomer.businessAddress.country,
          state: currentCustomer.businessAddress.state,
          street: currentCustomer.businessAddress.street,
          houseNumber: currentCustomer.businessAddress.houseNumber,
          address: currentCustomer.businessAddress.address,
        } : undefined,
      });
    }
  }, [currentCustomer, form, editMode]);
  
  const onSubmit = async (values: FormValues) => {
    try {
      if (editMode && id) {
        const updateData: UpdateCustomerRequest = { 
          id,
          ...values 
        };
        await dispatch(updateCustomer({ id, customerData: updateData })).unwrap();
        navigate('/customers');
      } else {
        const createData: CreateCustomerRequest = values;
        await dispatch(createCustomer(createData)).unwrap();
        navigate('/customers');
      }
    } catch (error) {
      console.error('Failed to save customer:', error);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>{editMode ? 'Edit Customer' : 'Add New Customer'}</CardTitle>
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
                      <Input placeholder="Customer name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email (Optional)</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="customer@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="+1 (555) 123-4567" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <Separator className="my-4" />
              <h3 className="text-lg font-medium">Business Information</h3>
              
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="businessRegistrationNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Business Registration Number (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="BR123456789" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="businessName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Business Name (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Business Name LLC" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <Separator className="my-4" />
              <h3 className="text-lg font-medium">Business Address</h3>
              
              <FormField
                control={form.control}
                name="businessAddress.address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Input placeholder="Full address" {...field} />
                    </FormControl>
                    <FormDescription>Complete address</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <FormField
                  control={form.control}
                  name="businessAddress.street"
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
                  name="businessAddress.houseNumber"
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
                
                <FormField
                  control={form.control}
                  name="businessAddress.state"
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
              </div>
              
              <FormField
                control={form.control}
                name="businessAddress.country"
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
            
            <div className="flex items-center justify-end space-x-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => navigate('/customers')}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Saving...' : editMode ? 'Update Customer' : 'Create Customer'}
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