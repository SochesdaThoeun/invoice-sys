import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { register } from '../authSlice';
import type { AppDispatch, RootState } from '@/store';

export function RegisterForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [businessRegistrationNumber, setBusinessRegistrationNumber] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'ADMIN' | 'SELLER'>('SELLER');
  const [locale, setLocale] = useState('en-US');
  const [currency, setCurrency] = useState('USD');
  
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { isLoading, error, isAuthenticated } = useSelector((state: RootState) => state.auth);
  
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (name && email && password && role) {
      await dispatch(register({ 
        name,
        email, 
        phone: phone || undefined,
        businessRegistrationNumber: businessRegistrationNumber || undefined,
        businessName: businessName || undefined,
        password, 
        role,
        locale,
        currency
      }));
    }
  };
  
  return (
    <div>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 text-sm font-medium text-destructive bg-destructive/10 border border-destructive/20 rounded-lg">
            {error}
          </div>
        )}
        
        {/* Personal Information */}
        <div className="grid grid-cols-1 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium text-foreground">Full Name</Label>
            <Input 
              id="name" 
              type="text"
              placeholder="Enter your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="focus-ring h-11 bg-background border-border/50 focus:border-primary/50"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium text-foreground">Email</Label>
            <Input 
              id="email" 
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="focus-ring h-11 bg-background border-border/50 focus:border-primary/50"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="phone" className="text-sm font-medium text-foreground">Phone <span className="text-muted-foreground">(Optional)</span></Label>
            <Input 
              id="phone" 
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1 (555) 123-4567"
              className="focus-ring h-11 bg-background border-border/50 focus:border-primary/50"
            />
          </div>
        </div>

        {/* Business Information */}
        <div className="pt-2 border-t border-border/30">
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label htmlFor="businessName" className="text-sm font-medium text-foreground">Business Name <span className="text-muted-foreground">(Optional)</span></Label>
              <Input 
                id="businessName" 
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="Your Business LLC"
                className="focus-ring h-11 bg-background border-border/50 focus:border-primary/50"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="businessRegistrationNumber" className="text-sm font-medium text-foreground">Registration Number <span className="text-muted-foreground">(Optional)</span></Label>
              <Input 
                id="businessRegistrationNumber" 
                type="text"
                value={businessRegistrationNumber}
                onChange={(e) => setBusinessRegistrationNumber(e.target.value)}
                placeholder="BR123456789"
                className="focus-ring h-11 bg-background border-border/50 focus:border-primary/50"
              />
            </div>
          </div>
        </div>

        {/* Account Settings */}
        <div className="pt-2 border-t border-border/30">
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-foreground">Password</Label>
              <Input 
                id="password" 
                type="password"
                placeholder="Create a strong password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="focus-ring h-11 bg-background border-border/50 focus:border-primary/50"
                required
              />
              <p className="text-xs text-muted-foreground">
                Must include uppercase, lowercase, numbers, and be at least 8 characters
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="role" className="text-sm font-medium text-foreground">Role</Label>
                <Select 
                  value={role} 
                  onValueChange={(value: 'ADMIN' | 'SELLER') => setRole(value)}
                >
                  <SelectTrigger className="h-11 bg-background border-border/50 focus:border-primary/50">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                    <SelectItem value="SELLER">Seller</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="currency" className="text-sm font-medium text-foreground">Currency</Label>
                <Select 
                  value={currency} 
                  onValueChange={setCurrency}
                >
                  <SelectTrigger className="h-11 bg-background border-border/50 focus:border-primary/50">
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD ($)</SelectItem>
                    <SelectItem value="EUR">EUR (€)</SelectItem>
                    <SelectItem value="GBP">GBP (£)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="locale" className="text-sm font-medium text-foreground">Language</Label>
              <Select 
                value={locale} 
                onValueChange={setLocale}
              >
                <SelectTrigger className="h-11 bg-background border-border/50 focus:border-primary/50">
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en-US">English (US)</SelectItem>
                  <SelectItem value="en-GB">English (UK)</SelectItem>
                  <SelectItem value="es-ES">Spanish</SelectItem>
                  <SelectItem value="fr-FR">French</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        
        <Button 
          type="submit" 
          disabled={isLoading}
          className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-medium mt-6"
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              Creating account...
            </div>
          ) : (
            'Create Account'
          )}
        </Button>
      </form>
    </div>
  );
} 