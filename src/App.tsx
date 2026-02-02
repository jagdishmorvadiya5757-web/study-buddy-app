import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { useSessionTracking, useInstallTracking } from "@/hooks/useSessionTracking";
import RequireAuth from "@/components/auth/RequireAuth";
import RequireAdminOnly from "@/components/auth/RequireAdminOnly";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Resources from "./pages/Resources";
import Branches from "./pages/Branches";
import Admin from "./pages/Admin";
import AdminDashboard from "./pages/AdminDashboard";
import AdminBranches from "./pages/admin/AdminBranches";
import AdminResources from "./pages/admin/AdminResources";
import AdminScans from "./pages/admin/AdminScans";
import AdminAudit from "./pages/admin/AdminAudit";
import AdminSubAdmins from "./pages/admin/AdminSubAdmins";
import SmartScanner from "./pages/SmartScanner";
import Library from "./pages/Library";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Analytics wrapper component
const AnalyticsProvider = ({ children }: { children: React.ReactNode }) => {
  useSessionTracking();
  useInstallTracking();
  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <AnalyticsProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/auth" element={<Auth />} />
              
              {/* Protected Routes - Require Authentication */}
              <Route path="/" element={<RequireAuth><Index /></RequireAuth>} />
              <Route path="/resources" element={<RequireAuth><Resources /></RequireAuth>} />
              <Route path="/branches" element={<RequireAuth><Branches /></RequireAuth>} />
              
              {/* Admin Routes - Full admins only */}
              <Route path="/admin" element={<RequireAuth><RequireAdminOnly><AdminDashboard /></RequireAdminOnly></RequireAuth>} />
              <Route path="/admin/branches" element={<RequireAuth><RequireAdminOnly><AdminBranches /></RequireAdminOnly></RequireAuth>} />
              <Route path="/admin/scans" element={<RequireAuth><RequireAdminOnly><AdminScans /></RequireAdminOnly></RequireAuth>} />
              <Route path="/admin/sub-admins" element={<RequireAuth><RequireAdminOnly><AdminSubAdmins /></RequireAdminOnly></RequireAuth>} />
              <Route path="/admin/audit" element={<RequireAuth><RequireAdminOnly><AdminAudit /></RequireAdminOnly></RequireAuth>} />
              
              {/* Admin Routes - Admins and Sub-admins */}
              <Route path="/admin/resources" element={<RequireAuth><AdminResources /></RequireAuth>} />
              <Route path="/admin/resources/new" element={<RequireAuth><Admin /></RequireAuth>} />
              
              {/* User Routes */}
              <Route path="/scanner" element={<RequireAuth><SmartScanner /></RequireAuth>} />
              <Route path="/library" element={<RequireAuth><Library /></RequireAuth>} />
              <Route path="/profile" element={<RequireAuth><Profile /></RequireAuth>} />
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AnalyticsProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
