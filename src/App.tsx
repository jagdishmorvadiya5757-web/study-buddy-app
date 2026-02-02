import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { useSessionTracking, useInstallTracking } from "@/hooks/useSessionTracking";
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
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/resources" element={<Resources />} />
              <Route path="/branches" element={<Branches />} />
              
              {/* Admin Routes */}
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/branches" element={<AdminBranches />} />
              <Route path="/admin/resources" element={<AdminResources />} />
              <Route path="/admin/resources/new" element={<Admin />} />
              <Route path="/admin/scans" element={<AdminScans />} />
              <Route path="/admin/audit" element={<AdminAudit />} />
              
              {/* User Routes */}
              <Route path="/scanner" element={<SmartScanner />} />
              <Route path="/library" element={<Library />} />
              <Route path="/profile" element={<Profile />} />
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AnalyticsProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
