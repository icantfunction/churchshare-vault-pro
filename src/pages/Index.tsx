import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Upload, Users, Menu, X } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useDemoContext } from "@/contexts/DemoContext";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";

const Index = () => {
  const { setDemoMode } = useDemoContext();
  const { user, loading, profileError } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleViewDemo = () => {
    setDemoMode(true);
  };

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (!loading && user) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, loading, navigate]);

  // Reset demo mode when leaving the landing page to regular auth flow
  useEffect(() => {
    return () => {
      // Don't reset demo mode if navigating to demo pages
      const isDemoPath = window.location.pathname.startsWith('/demo');
      if (!isDemoPath) {
        setDemoMode(false);
      }
    };
  }, [setDemoMode]);

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-background font-poppins flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
          {profileError && (
            <p className="text-sm text-orange-600 mt-2">
              Profile loading issue: {profileError}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 font-poppins">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-gray-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4 sm:py-6">
            <div className="flex items-center">
              <h1 className="text-2xl sm:text-3xl font-bold">
                Church<span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">Share</span>
              </h1>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-4">
              <Button asChild variant="ghost" className="text-gray-700 hover:text-primary">
                <Link to="/pricing">Pricing</Link>
              </Button>
              <Button asChild variant="ghost" className="text-gray-700 hover:text-primary">
                <Link to="/auth">Sign In</Link>
              </Button>
              <Button asChild className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90">
                <Link to="/auth">Get Started</Link>
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2"
              >
                {mobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>

          {/* Mobile Navigation Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t border-gray-200/50 py-4">
              <div className="flex flex-col space-y-3">
                <Button asChild variant="ghost" className="text-gray-700 hover:text-primary justify-start">
                  <Link to="/pricing" onClick={() => setMobileMenuOpen(false)}>Pricing</Link>
                </Button>
                <Button asChild variant="ghost" className="text-gray-700 hover:text-primary justify-start">
                  <Link to="/auth" onClick={() => setMobileMenuOpen(false)}>Sign In</Link>
                </Button>
                <Button asChild className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 mt-2">
                  <Link to="/auth" onClick={() => setMobileMenuOpen(false)}>Get Started</Link>
                </Button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Church<span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">Share</span>
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 mb-8 sm:mb-12 max-w-3xl mx-auto leading-relaxed">
            Simple, secure file sharing for churches and creative ministries. Upload and share high-quality photos without compression.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12 sm:mb-16">
            <Button asChild size="lg" className="h-12 sm:h-14 px-6 sm:px-8 text-base sm:text-lg rounded-xl bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 shadow-lg">
              <Link to="/auth">Start Free Trial</Link>
            </Button>
            <Button 
              asChild 
              variant="outline" 
              size="lg" 
              className="h-12 sm:h-14 px-6 sm:px-8 text-base sm:text-lg rounded-xl border-2 border-primary/20 hover:border-primary/40 hover:bg-primary/5"
              onClick={handleViewDemo}
            >
              <Link to="/demo/files">View Demo</Link>
            </Button>
          </div>

          {/* Main Features Section - Inline */}
          <div className="mb-16">
            <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
              Built for Ministry Excellence
            </h3>
            <p className="text-base sm:text-lg text-gray-600 mb-8 sm:mb-12">
              Everything your church needs to manage and share files securely
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
              <Card className="text-center border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary/10 to-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Shield className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="text-xl">Secure & Private</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600 leading-relaxed">
                    Role-based permissions ensure only authorized ministry members can access files.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="text-center border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-secondary/10 to-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Upload className="h-8 w-8 text-secondary" />
                  </div>
                  <CardTitle className="text-xl">High-Quality Uploads</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600 leading-relaxed">
                    Upload photos and files without compression. Original quality preserved.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="text-center border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Users className="h-8 w-8 text-green-600" />
                  </div>
                  <CardTitle className="text-xl">Ministry Organization</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600 leading-relaxed">
                    Organize files by ministry and events. Easy to find what you need.
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900/95 backdrop-blur-sm text-white py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h4 className="text-xl sm:text-2xl font-bold mb-4">
            Church<span className="bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">Share</span>
          </h4>
          <p className="text-gray-400 text-sm sm:text-base">
            Secure, simple file sharing for churches and creative ministries
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
