import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface RequireAdminOrSubAdminProps {
  children: ReactNode;
}

const RequireAdminOrSubAdmin = ({ children }: RequireAdminOrSubAdminProps) => {
  const { user, canAccessAdmin, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  // Only admins and sub-admins can access these routes
  if (!user || !canAccessAdmin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default RequireAdminOrSubAdmin;
