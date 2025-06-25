
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useState } from "react";
import { Link } from "react-router-dom";
import AuthLoadingSpinner from "@/components/auth/AuthLoadingSpinner";
import AuthHeader from "@/components/auth/AuthHeader";
import SignInForm from "@/components/auth/SignInForm";
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

  console.log('Auth page: Rendering sign in form');
  return (
    <div className="min-h-screen bg-background font-poppins flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <AuthHeader />

        <Card className="shadow-xl border-0">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Welcome Back</CardTitle>
            <CardDescription>
              Sign in to your ChurchShare account
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
            
            <SignInForm
              email={email}
              password={password}
              setEmail={setEmail}
              setPassword={setPassword}
              loading={loading}
              setLoading={setLoading}
            />

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{" "}
                <Link to="/signup" className="text-primary hover:underline font-medium">
                  Create your account
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
