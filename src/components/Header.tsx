
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Upload, User } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useDemoContext } from "@/contexts/DemoContext";

const Header = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { profile, signOut } = useAuth();
  const { isDemoMode, currentDemoUser } = useDemoContext();

  const handleLogout = async () => {
    await signOut();
    toast({
      title: "Logged out",
      description: "Successfully logged out of ChurchShare Pro",
    });
    navigate("/");
  };

  const userInitials = isDemoMode 
    ? `${currentDemoUser.first_name[0]}${currentDemoUser.last_name[0]}`
    : profile?.email ? profile.email.substring(0, 2).toUpperCase() : "U";

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Logotype */}
          <div className="flex items-center">
            <Link to="/dashboard" className="text-2xl font-bold text-primary flex items-center">
              ChurchShare
              <div className="w-2 h-2 bg-secondary rounded-full ml-1 mt-1"></div>
            </Link>
          </div>

          {/* Center-left: Navigation Links */}
          <nav className="hidden md:flex items-center space-x-8 ml-12">
            <Link to="/dashboard" className="text-gray-700 hover:text-primary transition-colors font-medium">
              Dashboard
            </Link>
            <Link to="/my-files" className="text-gray-700 hover:text-primary transition-colors font-medium">
              My Files
            </Link>
          </nav>

          {/* Center: Search Bar */}
          <div className="flex-1 max-w-lg mx-8 hidden md:block">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search files..."
                className="pl-12 bg-white border-gray-300 rounded-full h-10 w-full"
              />
            </div>
          </div>

          {/* Center-right: Upload Button */}
          <div className="flex items-center space-x-4">
            {(profile?.role === 'Admin' || profile?.role === 'MinistryLeader' || isDemoMode) && (
              <Button asChild className="rounded-full bg-primary hover:bg-primary/90">
                <Link to={isDemoMode ? "/demo/upload" : "/upload"}>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload
                </Link>
              </Button>
            )}

            {/* Far right: Avatar */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="rounded-full p-1 h-10 w-10">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5 text-sm text-gray-600">
                  {isDemoMode ? currentDemoUser.email : profile?.email}
                  <div className="text-xs text-gray-400">
                    {isDemoMode ? currentDemoUser.role : profile?.role}
                  </div>
                </div>
                {(profile?.role === 'Admin' || isDemoMode) && (
                  <DropdownMenuItem asChild>
                    <Link to="/admin">Admin Panel</Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={handleLogout}>
                  <User className="h-4 w-4 mr-2" />
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
