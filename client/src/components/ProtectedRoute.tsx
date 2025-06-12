import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';
import type { AppDispatch, RootState } from '@/store';
import { getCurrentUser } from '@/features/auth/authSlice';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, token, isLoading } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch<AppDispatch>();
  const location = useLocation();

  useEffect(() => {
    if (token && !isAuthenticated && !isLoading) {
      dispatch(getCurrentUser());
    }
  }, [dispatch, token, isAuthenticated, isLoading]);

  if (isLoading) {
    return <div className="flex justify-center items-center min-h-svh">Loading...</div>;
  }

  if (!isAuthenticated) {
    // Redirect to login page with the return url
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  return <>{children}</>;
} 