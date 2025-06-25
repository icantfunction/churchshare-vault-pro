
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

console.log('[DEBUG-005] App.tsx: Component initialization starting');

const queryClient = new QueryClient();
console.log('[DEBUG-006] App.tsx: QueryClient created');

const App = () => {
  console.log('[DEBUG-007] App.tsx: App component render started');
  
  return (
    <ErrorBoundary>
      {console.log('[DEBUG-008] App.tsx: ErrorBoundary mounted')}
      <QueryClientProvider client={queryClient}>
        {console.log('[DEBUG-009] App.tsx: QueryClientProvider mounted')}
        <DemoProvider>
          {console.log('[DEBUG-010] App.tsx: DemoProvider mounted')}
          <AuthProvider>
            {console.log('[DEBUG-011] App.tsx: AuthProvider mounted')}
            <TooltipProvider>
              {console.log('[DEBUG-012] App.tsx: TooltipProvider mounted')}
              <Toaster />
              <Sonner />
              <BrowserRouter>
                {console.log('[DEBUG-013] App.tsx: BrowserRouter mounted, setting up routes')}
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
                {console.log('[DEBUG-014] App.tsx: Routes configured')}
              </BrowserRouter>
            </TooltipProvider>
          </AuthProvider>
        </DemoProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

console.log('[DEBUG-015] App.tsx: App component definition complete');

export default App;
