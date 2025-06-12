import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getUserProfile, updateUserProfile } from '../settingsSlice';
import type { RootState, AppDispatch } from '../../../store';
import type { UserProfileUpdateRequest } from '../models/settingsModels';

import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '../../../components/ui/form';
import { useForm } from 'react-hook-form';

const LOCALE_OPTIONS = [
  { value: 'en-US', label: 'English (US)' },
  { value: 'en-GB', label: 'English (UK)' },
  { value: 'fr-FR', label: 'French' },
  { value: 'es-ES', label: 'Spanish' },
  { value: 'de-DE', label: 'German' },
];

const CURRENCY_OPTIONS = [
  { value: 'USD', label: 'US Dollar ($)' },
  { value: 'EUR', label: 'Euro (€)' },
  { value: 'GBP', label: 'British Pound (£)' },
  { value: 'JPY', label: 'Japanese Yen (¥)' },
  { value: 'CAD', label: 'Canadian Dollar (C$)' },
];

export function UserProfileForm() {
  const dispatch = useDispatch<AppDispatch>();
  const { userProfile, isLoading, error } = useSelector((state: RootState) => state.settings);
  const [formSubmitted, setFormSubmitted] = useState(false);

  const form = useForm<UserProfileUpdateRequest>({
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      businessRegistrationNumber: '',
      businessName: '',
      locale: 'en-US',
      currency: 'USD',
    },
  });

  // Fetch user profile on component mount
  useEffect(() => {
    dispatch(getUserProfile());
  }, [dispatch]);

  // Update form values when user profile is loaded
  useEffect(() => {
    if (userProfile) {
      form.reset({
        name: userProfile.name || '',
        email: userProfile.email,
        phone: userProfile.phone || '',
        businessRegistrationNumber: userProfile.businessRegistrationNumber || '',
        businessName: userProfile.businessName || '',
        locale: userProfile.locale,
        currency: userProfile.currency,
      });
    }
  }, [userProfile, form]);

  const onSubmit = async (data: UserProfileUpdateRequest) => {
    await dispatch(updateUserProfile(data));
    setFormSubmitted(true);
    
    // Reset submission status after showing success message
    setTimeout(() => {
      setFormSubmitted(false);
    }, 3000);
  };

  return (
    <Card className="">
      <CardHeader>
        <CardTitle>User Profile Settings</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Your full name" {...field} />
                  </FormControl>
                  <FormDescription>
                    Your full name as it appears on official documents.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="your.email@example.com" {...field} />
                  </FormControl>
                  <FormDescription>
                    Your email address will be used for account-related notifications.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input placeholder="+1 (555) 123-4567" {...field} />
                  </FormControl>
                  <FormDescription>
                    Your contact phone number (optional).
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="businessRegistrationNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Business Registration Number</FormLabel>
                  <FormControl>
                    <Input placeholder="BR123456789" {...field} />
                  </FormControl>
                  <FormDescription>
                    Your business registration number (optional).
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="businessName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Business Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Your Business Name LLC" {...field} />
                  </FormControl>
                  <FormDescription>
                    Your business or company name (optional).
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="locale"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Language & Region</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {LOCALE_OPTIONS.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Choose your preferred language and regional format.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="currency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Currency</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {CURRENCY_OPTIONS.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Default currency for invoices and payments.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
            
            {formSubmitted && !error && (
              <div className="p-3 text-sm rounded-md bg-green-50 text-green-600">
                Profile settings updated successfully.
              </div>
            )}
            
            {error && (
              <div className="p-3 text-sm rounded-md bg-red-50 text-red-600">
                {error}
              </div>
            )}
          </form>
        </Form>
      </CardContent>
    </Card>
  );
} 