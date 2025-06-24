
import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, Users, Upload } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen bg-background font-poppins">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Church<span className="text-primary">Share</span> Pro
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Simple, secure file sharing for churches and creative ministries. 
              Upload and share high-quality photos without compression.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-lg px-8 py-6 rounded-xl">
                <Link to="/login">
                  Get Started <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-lg px-8 py-6 rounded-xl border-2">
                <Link to="/dashboard">
                  View Demo
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Built for Ministry Excellence
            </h2>
            <p className="text-xl text-gray-600">
              Everything your church needs to manage and share files securely
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-8 rounded-2xl bg-card shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Secure & Private</h3>
              <p className="text-gray-600">
                Role-based permissions ensure only authorized ministry members can access files.
              </p>
            </div>
            
            <div className="text-center p-8 rounded-2xl bg-card shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Upload className="h-8 w-8 text-secondary" />
              </div>
              <h3 className="text-xl font-semibold mb-4">High-Quality Uploads</h3>
              <p className="text-gray-600">
                Upload photos and files without compression. Original quality preserved.
              </p>
            </div>
            
            <div className="text-center p-8 rounded-2xl bg-card shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Ministry Organization</h3>
              <p className="text-gray-600">
                Organize files by ministry and events. Easy to find what you need.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-2xl font-bold mb-4">ChurchShare Pro</h3>
          <p className="text-gray-400">
            Empowering churches with simple, secure file sharing
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
