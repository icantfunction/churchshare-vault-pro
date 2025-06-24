
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const Signup = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    dob: "",
    email: "",
    password: "",
    confirmPassword: "",
    inviteCode: "",
    isDirector: false
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  
  // Pre-fill invite code from URL if present
  useState(() => {
    const code = searchParams.get('code');
    if (code) {
      setFormData(prev => ({ ...prev, inviteCode: code }));
    }
  });

  const validateForm = () => {
    if (!formData.firstName || !formData.lastName || !formData.dob || !formData.email || !formData.password) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return false;
    }

    if (formData.password.length < 8) {
      toast({
        title: "Error",
        description: "Password must be at least 8 characters long",
        variant: "destructive",
      });
      return false;
    }

    const birthDate = new Date(formData.dob);
    const minDate = new Date('1920-01-01');
    const maxDate = new Date();
    maxDate.setFullYear(maxDate.getFullYear() - 5);

    if (birthDate < minDate || birthDate > maxDate) {
      toast({
        title: "Error",
        description: "Please enter a valid date of birth",
        variant: "destructive",
      });
      return false;
    }

    if (!formData.isDirector && !formData.inviteCode) {
      toast({
        title: "Error",
        description: "Please enter an invite code or check the director box",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);

    try {
      // Step 1: Sign up with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            first_name: formData.firstName,
            last_name: formData.lastName,
            dob: formData.dob
          },
          emailRedirectTo: `${window.location.origin}/dashboard`
        }
      });

      if (authError) {
        toast({
          title: "Error",
          description: authError.message,
          variant: "destructive",
        });
        return;
      }

      if (!authData.user) {
        toast({
          title: "Error",
          description: "Failed to create account",
          variant: "destructive",
        });
        return;
      }

      // Step 2: Handle organization setup
      let organisationId: string;
      let userRole = 'Member';

      if (formData.isDirector) {
        // Create new organization
        const { data: orgData, error: orgError } = await supabase
          .from('organisations')
          .insert({
            name: `${formData.firstName} ${formData.lastName}'s Organization`
          })
          .select()
          .single();

        if (orgError) {
          console.error('Error creating organization:', orgError);
          toast({
            title: "Error",
            description: "Failed to create organization",
            variant: "destructive",
          });
          return;
        }

        organisationId = orgData.id;
        userRole = 'Admin';
      } else {
        // Redeem invite code
        const { data: inviteData, error: inviteError } = await supabase.functions.invoke('redeem-invite', {
          body: { code: formData.inviteCode }
        });

        if (inviteError || !inviteData) {
          toast({
            title: "Error",
            description: inviteData?.error || "Invalid invite code",
            variant: "destructive",
          });
          return;
        }

        organisationId = inviteData.organisation_id;
        userRole = inviteData.role;
      }

      // Step 3: Update user profile
      const { error: updateError } = await supabase
        .from('users')
        .update({
          first_name: formData.firstName,
          last_name: formData.lastName,
          dob: formData.dob,
          organisation_id: organisationId,
          role: userRole,
          is_director: formData.isDirector
        })
        .eq('id', authData.user.id);

      if (updateError) {
        console.error('Error updating user profile:', updateError);
        toast({
          title: "Warning",
          description: "Account created but profile update failed. Please contact support.",
          variant: "destructive",
        });
      }

      toast({
        title: "Account created!",
        description: "Please check your email to verify your account",
      });

    } catch (error) {
      console.error('Signup error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-background font-poppins flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <Link to="/" className="text-3xl font-bold text-primary">
            ChurchShare Pro
          </Link>
          <p className="text-gray-600 mt-2">Create your account</p>
        </div>

        <Card className="shadow-xl border-0">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Sign Up</CardTitle>
            <CardDescription>
              Join your church's media sharing platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignUp} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    required
                    className="h-12 rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    required
                    className="h-12 rounded-xl"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dob">Date of Birth *</Label>
                <Input
                  id="dob"
                  type="date"
                  value={formData.dob}
                  onChange={(e) => handleInputChange('dob', e.target.value)}
                  min="1920-01-01"
                  max={new Date(new Date().setFullYear(new Date().getFullYear() - 5)).toISOString().split('T')[0]}
                  required
                  className="h-12 rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@church.org"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  required
                  className="h-12 rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password *</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="At least 8 characters"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  required
                  className="h-12 rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password *</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  required
                  className="h-12 rounded-xl"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isDirector"
                  checked={formData.isDirector}
                  onCheckedChange={(checked) => handleInputChange('isDirector', checked === true)}
                />
                <Label htmlFor="isDirector" className="text-sm">
                  I am the Director/Administrator for this organization
                </Label>
              </div>

              {!formData.isDirector && (
                <div className="space-y-2">
                  <Label htmlFor="inviteCode">Invite Code *</Label>
                  <Input
                    id="inviteCode"
                    type="text"
                    placeholder="Enter your invite code"
                    value={formData.inviteCode}
                    onChange={(e) => handleInputChange('inviteCode', e.target.value)}
                    required={!formData.isDirector}
                    className="h-12 rounded-xl"
                  />
                </div>
              )}

              <Button
                type="submit"
                className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-lg"
                disabled={loading}
              >
                {loading ? "Creating account..." : "Sign Up"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{" "}
                <Link to="/auth" className="text-primary hover:underline">
                  Sign in
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Signup;
