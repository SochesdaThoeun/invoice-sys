import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { login } from '../authSlice';
import type { AppDispatch, RootState } from '@/store';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { isLoading, error, isAuthenticated } = useSelector((state: RootState) => state.auth);
  
  useEffect(() => {
    console.log('useEffect triggered, isAuthenticated:', isAuthenticated);
    if (isAuthenticated) {
      console.log('Navigating to dashboard...');
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (email && password) {
      console.log('dispatching login');
      try {
        const result = await dispatch(login({ email, password }));
        console.log('login action type:', result.type);
        console.log('login fulfilled?', result.type.endsWith('/fulfilled'));
        console.log('login rejected?', result.type.endsWith('/rejected'));
        console.log('login result:', result);
        console.log('authentication status after login:', isAuthenticated);
      } catch (error) {
        console.error('Error during login dispatch:', error);
      }
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
          <Label htmlFor="password" className="text-sm font-medium text-foreground">Password</Label>
          <Input 
            id="password" 
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="focus-ring h-11 bg-background border-border/50 focus:border-primary/50"
            required
          />
        </div>
        
        <Button 
          type="submit" 
          disabled={isLoading}
          className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-medium mt-6"
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              Signing in...
            </div>
          ) : (
            'Sign In'
          )}
        </Button>
      </form>
    </div>
  );
} 