
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { DemoProvider } from "@/contexts/DemoContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import MyFiles from "./pages/MyFiles";
import Ministry from "./pages/Ministry";
import Upload from "./pages/Upload";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";
import DemoUpload from "./pages/DemoUpload";
import DemoFiles from "./pages/DemoFiles";

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <DemoProvider>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/login" element={<Auth />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/my-files" element={<MyFiles />} />
                <Route path="/ministry/:id" element={<Ministry />} />
                <Route path="/upload" element={<Upload />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/demo/upload" element={<DemoUpload />} />
                <Route path="/demo/files" element={<DemoFiles />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </DemoProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
