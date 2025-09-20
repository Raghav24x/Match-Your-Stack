import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { AuthGuard } from "@/components/AuthGuard";
import Index from "./pages/Index";
import AuthPage from "./pages/AuthPage";
import CreatorOnboard from "./pages/CreatorOnboard";
import CompanyOnboard from "./pages/CompanyOnboard";
import NewBrief from "./pages/NewBrief";
import Directory from "./pages/Directory";
import Recommendations from "./pages/Recommendations";
import Messages from "./pages/Messages";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/directory" element={<Directory />} />
            <Route path="/onboard/creator" element={<AuthGuard><CreatorOnboard /></AuthGuard>} />
            <Route path="/onboard/company" element={<AuthGuard><CompanyOnboard /></AuthGuard>} />
            <Route path="/brief/new" element={<AuthGuard><NewBrief /></AuthGuard>} />
            <Route path="/brief/:id/recommendations" element={<AuthGuard><Recommendations /></AuthGuard>} />
            <Route path="/match/:id/messages" element={<AuthGuard><Messages /></AuthGuard>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
