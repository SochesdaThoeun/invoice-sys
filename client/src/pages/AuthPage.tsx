import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import type { RootState } from '@/store';
import { AuthTabs } from '@/features/auth/components/AuthTabs';

export function AuthPage() {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get the redirect location from state or default to '/'
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/';
  
  useEffect(() => {
    // If user is already authenticated, redirect to homepage or the page they came from
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);
  
  return (
    <div className="min-h-svh bg-gradient-to-br from-background via-accent/5 to-primary/5 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8882_1px,transparent_1px),linear-gradient(to_bottom,#8882_1px,transparent_1px)] bg-[size:24px_24px]" />
      
      {/* Main Content */}
      <div className="relative flex flex-col items-center justify-center min-h-svh px-4">
        {/* Header Section */}
        <div className="text-center mb-12 max-w-md">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-2xl mb-6">
            <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-3">Welcome Back</h1>
          <p className="text-muted-foreground text-lg">
            Sign in to your Invoice System account to manage your business
          </p>
        </div>

        {/* Auth Form */}
        <div className="w-full max-w-sm">
          <div className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-xl p-6 shadow-xl">
            <AuthTabs />
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">
            Secure • Professional • Trusted
          </p>
        </div>
      </div>
    </div>
  );
} 