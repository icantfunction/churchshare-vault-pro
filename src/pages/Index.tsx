
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Upload, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { useDemoContext } from "@/contexts/DemoContext";
import { useEffect } from "react";

const Index = () => {
  const { setDemoMode } = useDemoContext();

  const handleViewDemo = () => {
    setDemoMode(true);
  };

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

  return (
    <div className="min-h-screen bg-background font-poppins">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-3xl font-bold text-primary">ChurchShare Pro</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button asChild variant="ghost">
                <Link to="/auth">Sign In</Link>
              </Button>
              <Button asChild>
                <Link to="/auth">Get Started</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            ChurchShare Pro
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Simple, secure file sharing for churches and creative ministries. Upload and share high-quality photos without compression.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="h-14 px-8 text-lg rounded-xl">
              <Link to="/auth">Start Free Trial</Link>
            </Button>
            <Button 
              asChild 
              variant="outline" 
              size="lg" 
              className="h-14 px-8 text-lg rounded-xl"
              onClick={handleViewDemo}
            >
              <Link to="/demo/files">View Demo</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Main Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              Built for Ministry Excellence
            </h3>
            <p className="text-lg text-gray-600">
              Everything your church needs to manage and share files securely
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center border-0 shadow-lg">
              <CardHeader>
                <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
                <CardTitle>Secure & Private</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Role-based permissions ensure only authorized ministry members can access files.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center border-0 shadow-lg">
              <CardHeader>
                <Upload className="h-12 w-12 text-secondary mx-auto mb-4" />
                <CardTitle>High-Quality Uploads</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Upload photos and files without compression. Original quality preserved.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center border-0 shadow-lg">
              <CardHeader>
                <Users className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <CardTitle>Ministry Organization</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Organize files by ministry and events. Easy to find what you need.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h3 className="text-4xl font-bold text-gray-900 mb-6">
            Ready to Transform Your Ministry's File Sharing?
          </h3>
          <p className="text-lg text-gray-600 mb-8">
            Join thousands of churches already using ChurchShare Pro
          </p>
          <Button asChild size="lg" className="h-14 px-8 text-lg rounded-xl">
            <Link to="/auth">Get Started Today</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h4 className="text-2xl font-bold mb-4">ChurchShare Pro</h4>
          <p className="text-gray-400">
            Secure, simple file sharing for churches and creative ministries
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
