import { ReactNode, useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { isAuthenticated } from '@/services/api';

interface ProtectedRouteProps {
  children: ReactNode;
  redirectTo?: string;
}

const ProtectedRoute = ({ children, redirectTo = '/login' }: ProtectedRouteProps) => {
  const [isAuth, setIsAuth] = useState<boolean | null>(null);
  const location = useLocation();

  useEffect(() => {
    setIsAuth(isAuthenticated());
  }, []);

  // Show loading state while checking authentication
  if (isAuth === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 pt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuth) {
    // Redirect to login with the current location as state
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
