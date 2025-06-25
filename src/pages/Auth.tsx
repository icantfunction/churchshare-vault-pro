
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useState } from "react";
import AuthLoadingSpinner from "@/components/auth/AuthLoadingSpinner";
import AuthHeader from "@/components/auth/AuthHeader";
import SignInForm from "@/components/auth/SignInForm";
import SignUpForm from "@/components/auth/SignUpForm";
import { useAuthRedirect } from "@/hooks/useAuthRedirect";

const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  
  const { authLoading, profileError, shouldShowAuthForm } = useAuthRedirect();

  // Show loading spinner while checking auth state
  if (authLoading) {
    console.log('Auth page: Showing loading screen - auth loading');
    return <AuthLoadingSpinner message="Loading..." />;
  }

  // Show auth form only if user is not authenticated
  if (!shouldShowAuthForm) {
    console.log('Auth page: User authenticated, showing redirect message');
    return <AuthLoadingSpinner message="Redirecting to dashboard..." />;
  }

  console.log('Auth page: Rendering auth form');
  return (
    <div className="min-h-screen bg-background font-poppins flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <AuthHeader />

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
                <SignInForm
                  email={email}
                  password={password}
                  setEmail={setEmail}
                  setPassword={setPassword}
                  loading={loading}
                  setLoading={setLoading}
                />
              </TabsContent>
              
              <TabsContent value="signup">
                <SignUpForm
                  email={email}
                  password={password}
                  setEmail={setEmail}
                  setPassword={setPassword}
                  loading={loading}
                  setLoading={setLoading}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
