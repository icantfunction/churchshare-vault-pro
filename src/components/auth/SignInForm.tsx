
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface SignInFormProps {
  email: string;
  password: string;
  setEmail: (email: string) => void;
  setPassword: (password: string) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
}

interface FormErrors {
  email?: string;
  password?: string;
}

const SignInForm = ({ email, password, setEmail, setPassword, loading, setLoading }: SignInFormProps) => {
  const { toast } = useToast();
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  const validateForm = () => {
    const errors: FormErrors = {};

    if (!email.trim()) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = "Please enter a valid email address";
    }

    if (!password) {
      errors.password = "Password is required";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: "Please fix the errors",
        description: "Check the highlighted fields and try again",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      console.log('Auth page: Attempting sign in for:', email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Auth page: Sign in error:', error);
        
        // Set field-specific errors based on the error message
        if (error.message.includes('email')) {
          setFormErrors({ email: error.message });
        } else if (error.message.includes('password') || error.message.includes('credentials')) {
          setFormErrors({ password: "Invalid email or password" });
        } else {
          setFormErrors({});
        }

        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      } else if (data.user) {
        console.log('Auth page: Sign in successful for user:', data.user.id);
        setFormErrors({});
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

  const handleEmailChange = (value: string) => {
    setEmail(value);
    // Clear email error when user starts typing
    if (formErrors.email) {
      setFormErrors(prev => ({ ...prev, email: undefined }));
    }
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    // Clear password error when user starts typing
    if (formErrors.password) {
      setFormErrors(prev => ({ ...prev, password: undefined }));
    }
  };

  const getInputClassName = (fieldName: keyof FormErrors) => {
    return `h-12 rounded-xl ${formErrors[fieldName] ? 'border-red-500 bg-red-50' : ''}`;
  };

  return (
    <form onSubmit={handleSignIn} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="signin-email" className={formErrors.email ? 'text-red-600' : ''}>
          Email
        </Label>
        <Input
          id="signin-email"
          type="email"
          placeholder="your.email@church.org"
          value={email}
          onChange={(e) => handleEmailChange(e.target.value)}
          required
          className={getInputClassName('email')}
        />
        {formErrors.email && (
          <p className="text-red-600 text-sm">{formErrors.email}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="signin-password" className={formErrors.password ? 'text-red-600' : ''}>
          Password
        </Label>
        <Input
          id="signin-password"
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => handlePasswordChange(e.target.value)}
          required
          className={getInputClassName('password')}
        />
        {formErrors.password && (
          <p className="text-red-600 text-sm">{formErrors.password}</p>
        )}
      </div>
      <Button
        type="submit"
        className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-lg"
        disabled={loading}
      >
        {loading ? "Signing in..." : "Sign In"}
      </Button>
    </form>
  );
};

export default SignInForm;
