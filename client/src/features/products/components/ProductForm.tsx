import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import {
  createProduct,
  updateProduct,
  fetchProductById,
  clearCurrentProduct
} from '../productSlice';
import { fetchTaxCodes } from '../../tax/taxSlice';
import type { CreateProductRequest, UpdateProductRequest } from '../models/productModels';
import { type RootState, type AppDispatch } from '../../../store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  sku: z.string().min(1, { message: 'SKU is required' }),
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
  description: z.string().min(5, { message: 'Description must be at least 5 characters' }),
  defaultPrice: z.number().min(0, { message: 'Price must be a positive number' }),
  taxCodeId: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface ProductFormProps {
  editMode?: boolean;
}

export function ProductForm({ editMode = false }: ProductFormProps) {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  
  const { currentProduct, isLoading, error } = useSelector(
    (state: RootState) => state.products
  );
  
  const { taxCodes, isLoading: taxCodesLoading } = useSelector(
    (state: RootState) => state.tax
  );
  
  // Initialize the form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      sku: '',
      name: '',
      description: '',
      defaultPrice: 0,
      taxCodeId: '',
    },
  });
  
  // Load product data when in edit mode
  useEffect(() => {
    if (editMode && id) {
      dispatch(fetchProductById(id));
    }
    
    return () => {
      dispatch(clearCurrentProduct());
    };
  }, [dispatch, editMode, id]);
  
  // Fetch tax codes when component mounts
  useEffect(() => {
    dispatch(fetchTaxCodes());
  }, [dispatch]);
  
  // Update form values when product data is loaded
  useEffect(() => {
    if (currentProduct && editMode) {
      form.reset({
        sku: currentProduct.sku,
        name: currentProduct.name,
        description: currentProduct.description,
        defaultPrice: currentProduct.defaultPrice,
        taxCodeId: currentProduct.taxCodeId || '',
      });
    }
  }, [currentProduct, form, editMode]);
  
  const onSubmit = async (values: FormValues) => {
    try {
      if (editMode && id) {
        const updateData: UpdateProductRequest = { 
          id,
          ...values 
        };
        await dispatch(updateProduct({ id, productData: updateData })).unwrap();
        navigate('/products');
      } else {
        const createData: CreateProductRequest = values;
        await dispatch(createProduct(createData)).unwrap();
        navigate('/products');
      }
    } catch (error) {
      console.error('Failed to save product:', error);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>{editMode ? 'Edit Product' : 'Add New Product'}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="sku"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">SKU</FormLabel>
                      <FormControl>
                        <Input placeholder="PDT001" {...field} />
                      </FormControl>
                      <FormDescription className="text-xs text-muted-foreground">
                        Unique product identifier
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">Product Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Product name" {...field} />
                      </FormControl>
                      <FormDescription className="text-xs text-muted-foreground">
                        Name must be at least 2 characters
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Product description" 
                        className="min-h-[100px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="defaultPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Default Price</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.01"
                          min="0"
                          placeholder="0.00" 
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormDescription>Price in USD</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="taxCodeId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tax Code (Optional)</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a tax code" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {taxCodesLoading ? (
                            <SelectItem value="loading" disabled>
                              Loading tax codes...
                            </SelectItem>
                          ) : taxCodes.length > 0 ? (
                            taxCodes.map((taxCode) => (
                              <SelectItem key={taxCode.id} value={taxCode.id}>
                                {taxCode.countryCode}{taxCode.region ? ` - ${taxCode.region}` : ''} ({typeof taxCode.rate === 'string' ? taxCode.rate : `${taxCode.rate}%`})
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="none" disabled>
                              No tax codes available
                            </SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                      <FormDescription>Select applicable tax code</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            
            {error && (
              <div className="text-sm text-red-500">
                {error}
              </div>
            )}
            
            <div className="flex gap-4">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Saving...' : editMode ? 'Update Product' : 'Create Product'}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => navigate('/products')}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
} 