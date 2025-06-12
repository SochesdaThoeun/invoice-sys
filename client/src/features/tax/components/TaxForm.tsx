import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { createTaxCode, updateTaxCode, fetchTaxCodeById, clearCurrentTaxCode } from '../taxSlice';
import {  type CreateTaxCodeRequest } from '../models/taxModels';
import { type RootState, type AppDispatch } from '../../../store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { IconArrowLeft, IconLoader2 } from '@tabler/icons-react';

interface TaxFormProps {
  mode: 'create' | 'edit';
}

export function TaxForm({ mode }: TaxFormProps) {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  
  const { currentTaxCode, isLoading, error } = useSelector(
    (state: RootState) => state.tax
  );
  
  const [formData, setFormData] = useState<CreateTaxCodeRequest>({
    countryCode: '',
    region: '',
    rate: 0
  });
  
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  
  useEffect(() => {
    if (mode === 'edit' && id) {
      dispatch(fetchTaxCodeById(id));
    } else if (mode === 'create') {
      dispatch(clearCurrentTaxCode());
    }
    
    return () => {
      dispatch(clearCurrentTaxCode());
    };
  }, [dispatch, mode, id]);
  
  useEffect(() => {
    if (currentTaxCode && mode === 'edit') {
      setFormData({
        countryCode: currentTaxCode.countryCode,
        region: currentTaxCode.region || '',
        rate: Number(currentTaxCode.rate)
      });
    }
  }, [currentTaxCode, mode]);
  
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!formData.countryCode.trim()) {
      errors.countryCode = 'Country code is required';
    } else if (formData.countryCode.length !== 2) {
      errors.countryCode = 'Country code must be 2 characters (e.g., US, CA)';
    }
    
    if (formData.rate <= 0) {
      errors.rate = 'Tax rate must be greater than 0';
    } else if (formData.rate > 100) {
      errors.rate = 'Tax rate cannot exceed 100%';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'rate' ? parseFloat(value) || 0 : value.toUpperCase()
    }));
    
    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      if (mode === 'create') {
        await dispatch(createTaxCode(formData)).unwrap();
      } else if (mode === 'edit' && id) {
        await dispatch(updateTaxCode({ id, taxCodeData: { ...formData, id } })).unwrap();
      }
      navigate('/tax');
    } catch (error) {
      console.error('Failed to submit tax code:', error);
    }
  };
  
  const handleBack = () => {
    navigate('/tax');
  };
  
  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <div className="flex items-center gap-4 px-4 lg:px-6">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={handleBack}
            >
              <IconArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-2xl font-bold">
              {mode === 'create' ? 'Create Tax Code' : 'Edit Tax Code'}
            </h1>
          </div>
          
          <div className="px-4 lg:px-6">
            <Card className="max-w-2xl">
              <CardHeader>
                <CardTitle>Tax Code Details</CardTitle>
              </CardHeader>
              <CardContent>
                {error && (
                  <Alert className="mb-6" variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="countryCode">
                        Country Code <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="countryCode"
                        name="countryCode"
                        placeholder="US"
                        value={formData.countryCode}
                        onChange={handleInputChange}
                        className={formErrors.countryCode ? 'border-red-500' : ''}
                        maxLength={2}
                      />
                      {formErrors.countryCode && (
                        <p className="text-sm text-red-500">{formErrors.countryCode}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="region">Region (Optional)</Label>
                      <Input
                        id="region"
                        name="region"
                        placeholder="CA"
                        value={formData.region}
                        onChange={handleInputChange}
                        className={formErrors.region ? 'border-red-500' : ''}
                      />
                      {formErrors.region && (
                        <p className="text-sm text-red-500">{formErrors.region}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="rate">
                      Tax Rate (%) <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="rate"
                      name="rate"
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      placeholder="8.25"
                      value={formData.rate}
                      onChange={handleInputChange}
                      className={formErrors.rate ? 'border-red-500' : ''}
                    />
                    {formErrors.rate && (
                      <p className="text-sm text-red-500">{formErrors.rate}</p>
                    )}
                  </div>
                  
                  <div className="flex justify-end gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleBack}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={isLoading}
                    >
                      {isLoading && <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />}
                      {mode === 'create' ? 'Create Tax Code' : 'Update Tax Code'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
} 