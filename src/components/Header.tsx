
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Upload, User, LogOut } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

const Header = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { profile, signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
    toast({
      title: "Logged out",
      description: "Successfully logged out of ChurchShare Pro",
    });
    navigate("/");
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link to="/dashboard" className="text-2xl font-bold text-primary">
              ChurchShare Pro
            </Link>
            <nav className="hidden md:flex space-x-6">
              <Link to="/dashboard" className="text-gray-600 hover:text-primary transition-colors">
                Dashboard
              </Link>
              <Link to="/my-files" className="text-gray-600 hover:text-primary transition-colors">
                My Files
              </Link>
            </nav>
          </div>

          <div className="flex items-center space-x-4">
            <div className="hidden md:block relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search files..."
                className="pl-10 w-64 rounded-full border-gray-300"
              />
            </div>
            
            {(profile?.role === 'Admin' || profile?.role === 'MinistryLeader') && (
              <Button asChild variant="outline" className="rounded-full">
                <Link to="/upload">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload
                </Link>
              </Button>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="rounded-full">
                  <User className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <div className="px-2 py-1 text-sm text-gray-600">
                  {profile?.email}
                  <div className="text-xs text-gray-400">{profile?.role}</div>
                </div>
                {profile?.role === 'Admin' && (
                  <DropdownMenuItem asChild>
                    <Link to="/admin">Admin Panel</Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
