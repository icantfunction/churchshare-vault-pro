
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation, Navigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { user, profile, loading: authLoading, profileError } = useAuth();
  const redirectAttempted = useRef(false);

  // Compute redirect conditions
  const shouldRedirect = !authLoading && user && location.pathname !== "/dashboard";
  const canRedirect = shouldRedirect && (profile || profileError) && !redirectAttempted.current;

  // Reset redirect flag when auth state changes
  useEffect(() => {
    if (!user || !profile) {
      redirectAttempted.current = false;
    }
  }, [user, profile]);

  // Handle redirect logic
  useEffect(() => {
    if (canRedirect) {
      console.log('Auth page: User authenticated and profile ready, redirecting to dashboard');
      redirectAttempted.current = true;
      
      toast({
        title: "Welcome back!",
        description: "Successfully signed in to ChurchShare",
      });
    }
  }, [canRedirect, toast]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log('Auth page: Attempting sign in for:', email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Auth page: Sign in error:', error);
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      } else if (data.user) {
        console.log('Auth page: Sign in successful for user:', data.user.id);
        // Navigation will be handled by useEffect when auth state updates
      }
    } catch (error) {
      console.error('Auth page: Sign in error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }

    setLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log('Auth page: Attempting sign up for:', email);
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`
        }
      });

      if (error) {
        console.error('Auth page: Sign up error:', error);
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      } else {
        console.log('Auth page: Sign up successful');
        toast({
          title: "Account created!",
          description: "Please check your email to verify your account",
        });
      }
    } catch (error) {
      console.error('Auth page: Sign up error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }

    setLoading(false);
  };

  // Show loading spinner while checking auth state
  if (authLoading) {
    console.log('Auth page: Showing loading screen - auth loading');
    return (
      <div className="min-h-screen bg-background font-poppins flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to dashboard if authenticated and ready
  if (canRedirect) {
    console.log('Auth page: Redirecting to dashboard via Navigate component');
    return <Navigate to="/dashboard" replace />;
  }

  // Show redirecting message if user is authenticated but waiting for profile/redirect
  if (shouldRedirect && !canRedirect) {
    console.log('Auth page: User authenticated, waiting for profile or redirect');
    return (
      <div className="min-h-screen bg-background font-poppins flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  console.log('Auth page: Rendering auth form');
  return (
    <div className="min-h-screen bg-background font-poppins flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="text-3xl font-bold text-primary">
            ChurchShare
          </Link>
          <p className="text-gray-600 mt-2">Secure ministry file sharing</p>
        </div>

        <Card className="shadow-xl border-0">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Welcome</CardTitle>
            <CardDescription>
              Sign in to your account or create a new one
            </CardDescription>
          </CardHeader>
          <CardContent>
            {profileError && (
              <Alert className="mb-4" variant="destructive">
                <AlertDescription>
                  Profile access limited: {profileError}. You can still use the application.
                </AlertDescription>
              </Alert>
            )}
            
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>
              
              <TabsContent value="signin">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">Email</Label>
                    <Input
                      id="signin-email"
                      type="email"
                      placeholder="your.email@church.org"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="h-12 rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signin-password">Password</Label>
                    <Input
                      id="signin-password"
                      type="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="h-12 rounded-xl"
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-lg"
                    disabled={loading}
                  >
                    {loading ? "Signing in..." : "Sign In"}
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="signup">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="your.email@church.org"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="h-12 rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="Create a password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="h-12 rounded-xl"
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-lg"
                    disabled={loading}
                  >
                    {loading ? "Creating account..." : "Sign Up"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
