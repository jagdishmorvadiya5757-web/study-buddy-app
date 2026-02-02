import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface RequireAdminOnlyProps {
  children: ReactNode;
}

const RequireAdminOnly = ({ children }: RequireAdminOnlyProps) => {
  const { user, isAdmin, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  // Only full admins can access these routes
  if (!user || !isAdmin) {
    return <Navigate to="/admin/resources" replace />;
  }

  return <>{children}</>;
};

export default RequireAdminOnly;
