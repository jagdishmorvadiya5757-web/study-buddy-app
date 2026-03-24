import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/contexts/AuthContext";
import { useSessionTracking, useInstallTracking } from "@/hooks/useSessionTracking";
import RequireAuth from "@/components/auth/RequireAuth";
import RequireAdminOnly from "@/components/auth/RequireAdminOnly";
import RequireAdminOrSubAdmin from "@/components/auth/RequireAdminOrSubAdmin";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Resources from "./pages/Resources";
import ResourceSection from "./pages/ResourceSection";
import Branches from "./pages/Branches";
import Admin from "./pages/Admin";
import AdminDashboard from "./pages/AdminDashboard";
import AdminBranches from "./pages/admin/AdminBranches";
import AdminResources from "./pages/admin/AdminResources";
import AdminScans from "./pages/admin/AdminScans";
import AdminAudit from "./pages/admin/AdminAudit";
import AdminAbout from "./pages/admin/AdminAbout";
import AdminSubAdmins from "./pages/admin/AdminSubAdmins";
import AdminSupport from "./pages/admin/AdminSupport";
import AdminTerms from "./pages/admin/AdminTerms";
import AdminFAQs from "./pages/admin/AdminFAQs";
import AdminAds from "./pages/admin/AdminAds";
import SmartScanner from "./pages/SmartScanner";
import Library from "./pages/Library";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import Help from "./pages/Help";
import Terms from "./pages/Terms";
import NotFound from "./pages/NotFound";
import StudyChatbot from "./components/chat/StudyChatbot";

const queryClient = new QueryClient();

// Analytics wrapper component
const AnalyticsProvider = ({ children }: { children: React.ReactNode }) => {
  useSessionTracking();
  useInstallTracking();
  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <AuthProvider>
        <AnalyticsProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter basename="/study-buddy-app">
              <Routes>
                <Route path="/auth" element={<Auth />} />
                
                {/* Protected Routes - Require Authentication */}
                <Route path="/" element={<RequireAuth><Index /></RequireAuth>} />
                <Route path="/resources" element={<RequireAuth><Resources /></RequireAuth>} />
                <Route path="/resources/:type" element={<RequireAuth><ResourceSection /></RequireAuth>} />
                <Route path="/branches" element={<RequireAuth><Branches /></RequireAuth>} />
                
                {/* Admin Routes - Full admins only */}
                <Route path="/admin" element={<RequireAuth><RequireAdminOnly><AdminDashboard /></RequireAdminOnly></RequireAuth>} />
                <Route path="/admin/branches" element={<RequireAuth><RequireAdminOnly><AdminBranches /></RequireAdminOnly></RequireAuth>} />
                <Route path="/admin/scans" element={<RequireAuth><RequireAdminOnly><AdminScans /></RequireAdminOnly></RequireAuth>} />
                <Route path="/admin/sub-admins" element={<RequireAuth><RequireAdminOnly><AdminSubAdmins /></RequireAdminOnly></RequireAuth>} />
                <Route path="/admin/audit" element={<RequireAuth><RequireAdminOnly><AdminAudit /></RequireAdminOnly></RequireAuth>} />
                <Route path="/admin/about" element={<RequireAuth><RequireAdminOnly><AdminAbout /></RequireAdminOnly></RequireAuth>} />
                <Route path="/admin/support" element={<RequireAuth><RequireAdminOnly><AdminSupport /></RequireAdminOnly></RequireAuth>} />
                <Route path="/admin/terms" element={<RequireAuth><RequireAdminOnly><AdminTerms /></RequireAdminOnly></RequireAuth>} />
                <Route path="/admin/faqs" element={<RequireAuth><RequireAdminOnly><AdminFAQs /></RequireAdminOnly></RequireAuth>} />
                <Route path="/admin/ads" element={<RequireAuth><RequireAdminOnly><AdminAds /></RequireAdminOnly></RequireAuth>} />
                
                {/* Admin Routes - Admins and Sub-admins */}
                <Route path="/admin/resources" element={<RequireAuth><RequireAdminOrSubAdmin><AdminResources /></RequireAdminOrSubAdmin></RequireAuth>} />
                <Route path="/admin/resources/new" element={<RequireAuth><RequireAdminOrSubAdmin><Admin /></RequireAdminOrSubAdmin></RequireAuth>} />
                
                {/* User Routes */}
                <Route path="/scanner" element={<RequireAuth><SmartScanner /></RequireAuth>} />
                <Route path="/library" element={<RequireAuth><Library /></RequireAuth>} />
                <Route path="/profile" element={<RequireAuth><Profile /></RequireAuth>} />
                <Route path="/settings" element={<RequireAuth><Settings /></RequireAuth>} />
                <Route path="/help" element={<RequireAuth><Help /></RequireAuth>} />
                <Route path="/terms" element={<Terms />} />
                
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </AnalyticsProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
