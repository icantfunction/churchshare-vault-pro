
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { DemoProvider } from "@/contexts/DemoContext";
import { SearchProvider } from "@/contexts/SearchContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import InactivityTracker from "@/components/InactivityTracker";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import MyFiles from "./pages/MyFiles";
import Ministry from "./pages/Ministry";
import Upload from "./pages/Upload";
import DemoUpload from "./pages/DemoUpload";
import DemoFiles from "./pages/DemoFiles";
import Admin from "./pages/Admin";
import Pricing from "./pages/Pricing";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ErrorBoundary>
          <AuthProvider>
            <DemoProvider>
              <SearchProvider>
                <InactivityTracker>
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/auth" element={<Auth />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/my-files" element={<MyFiles />} />
                    <Route path="/ministry/:id" element={<Ministry />} />
                    <Route path="/upload" element={<Upload />} />
                    <Route path="/demo/upload" element={<DemoUpload />} />
                    <Route path="/demo/files" element={<DemoFiles />} />
                    <Route path="/admin" element={<Admin />} />
                    <Route path="/pricing" element={<Pricing />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </InactivityTracker>
              </SearchProvider>
            </DemoProvider>
          </AuthProvider>
        </ErrorBoundary>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
