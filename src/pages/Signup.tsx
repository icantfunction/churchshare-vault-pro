
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Ministry {
  id: string;
  name: string;
}

interface FormErrors {
  firstName?: string;
  lastName?: string;
  dob?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  inviteCode?: string;
  ministryId?: string;
}

const Signup = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    dob: "",
    email: "",
    password: "",
    confirmPassword: "",
    inviteCode: "",
    isDirector: false,
    ministryId: ""
  });
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [ministries, setMinistries] = useState<Ministry[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMinistries, setLoadingMinistries] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  
  // Pre-fill invite code from URL if present
  useEffect(() => {
    const code = searchParams.get('code');
    if (code) {
      setFormData(prev => ({ ...prev, inviteCode: code }));
    }
  }, [searchParams]);

  // Fetch ministries when not director
  useEffect(() => {
    if (!formData.isDirector) {
      fetchMinistries();
    }
  }, [formData.isDirector]);

  const fetchMinistries = async () => {
    setLoadingMinistries(true);
    try {
      const { data, error } = await supabase
        .from('ministries')
        .select('id, name')
        .order('name');

      if (error) throw error;
      setMinistries(data || []);
    } catch (error) {
      console.error('Error fetching ministries:', error);
      toast({
        title: "Error",
        description: "Failed to load ministries",
        variant: "destructive",
      });
    } finally {
      setLoadingMinistries(false);
    }
  };

  const validateForm = () => {
    const errors: FormErrors = {};

    if (!formData.firstName.trim()) {
      errors.firstName = "First name is required";
    }

    if (!formData.lastName.trim()) {
      errors.lastName = "Last name is required";
    }

    if (!formData.dob) {
      errors.dob = "Date of birth is required";
    } else {
      const birthDate = new Date(formData.dob);
      const minDate = new Date('1920-01-01');
      const maxDate = new Date();
      maxDate.setFullYear(maxDate.getFullYear() - 5);

      if (birthDate < minDate || birthDate > maxDate) {
        errors.dob = "Please enter a valid date of birth";
      }
    }

    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Please enter a valid email address";
    }

    if (!formData.password) {
      errors.password = "Password is required";
    } else if (formData.password.length < 8) {
      errors.password = "Password must be at least 8 characters long";
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    if (!formData.isDirector) {
      if (!formData.inviteCode.trim()) {
        errors.inviteCode = "Invite code is required";
      }

      if (!formData.ministryId) {
        errors.ministryId = "Please select a ministry";
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSignUp = async (e: React.FormEvent) => {
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
      // Determine user role
      let userRole = 'Member';
      let ministryId = formData.ministryId;

      if (formData.isDirector) {
        userRole = 'Director';
        ministryId = null; // Directors don't belong to a specific ministry
      } else {
        // Validate invite code and get role from it
        const { data: inviteData, error: inviteError } = await supabase.functions.invoke('redeem-invite', {
          body: { code: formData.inviteCode }
        });

        if (inviteError || !inviteData) {
          setFormErrors({ inviteCode: inviteData?.error || "Invalid invite code" });
          toast({
            title: "Error",
            description: inviteData?.error || "Invalid invite code",
            variant: "destructive",
          });
          return;
        }

        userRole = inviteData.role || 'Member';
      }

      // Step 1: Sign up with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            first_name: formData.firstName,
            last_name: formData.lastName,
            date_of_birth: formData.dob,
            role: userRole,
            ministry_id: ministryId
          },
          emailRedirectTo: `${window.location.origin}/dashboard`
        }
      });

      if (authError) {
        if (authError.message.includes('email')) {
          setFormErrors({ email: authError.message });
        }
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
    // Clear field error when user starts typing
    if (formErrors[field as keyof FormErrors]) {
      setFormErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const getInputClassName = (fieldName: keyof FormErrors) => {
    return `h-12 rounded-xl ${formErrors[fieldName] ? 'border-red-500 bg-red-50' : ''}`;
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
            <CardTitle className="text-2xl">Create Account</CardTitle>
            <CardDescription>
              Join your church's media sharing platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignUp} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className={formErrors.firstName ? 'text-red-600' : ''}>
                    First Name *
                  </Label>
                  <Input
                    id="firstName"
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    required
                    className={getInputClassName('firstName')}
                  />
                  {formErrors.firstName && (
                    <p className="text-red-600 text-sm">{formErrors.firstName}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className={formErrors.lastName ? 'text-red-600' : ''}>
                    Last Name *
                  </Label>
                  <Input
                    id="lastName"
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    required
                    className={getInputClassName('lastName')}
                  />
                  {formErrors.lastName && (
                    <p className="text-red-600 text-sm">{formErrors.lastName}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dob" className={formErrors.dob ? 'text-red-600' : ''}>
                  Date of Birth *
                </Label>
                <Input
                  id="dob"
                  type="date"
                  value={formData.dob}
                  onChange={(e) => handleInputChange('dob', e.target.value)}
                  min="1920-01-01"
                  max={new Date(new Date().setFullYear(new Date().getFullYear() - 5)).toISOString().split('T')[0]}
                  required
                  className={getInputClassName('dob')}
                />
                {formErrors.dob && (
                  <p className="text-red-600 text-sm">{formErrors.dob}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className={formErrors.email ? 'text-red-600' : ''}>
                  Email *
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@church.org"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  required
                  className={getInputClassName('email')}
                />
                {formErrors.email && (
                  <p className="text-red-600 text-sm">{formErrors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className={formErrors.password ? 'text-red-600' : ''}>
                  Password *
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="At least 8 characters"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  required
                  className={getInputClassName('password')}
                />
                {formErrors.password && (
                  <p className="text-red-600 text-sm">{formErrors.password}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className={formErrors.confirmPassword ? 'text-red-600' : ''}>
                  Confirm Password *
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  required
                  className={getInputClassName('confirmPassword')}
                />
                {formErrors.confirmPassword && (
                  <p className="text-red-600 text-sm">{formErrors.confirmPassword}</p>
                )}
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
                <>
                  <div className="space-y-2">
                    <Label htmlFor="inviteCode" className={formErrors.inviteCode ? 'text-red-600' : ''}>
                      Invite Code *
                    </Label>
                    <Input
                      id="inviteCode"
                      type="text"
                      placeholder="Enter your invite code"
                      value={formData.inviteCode}
                      onChange={(e) => handleInputChange('inviteCode', e.target.value)}
                      required={!formData.isDirector}
                      className={getInputClassName('inviteCode')}
                    />
                    {formErrors.inviteCode && (
                      <p className="text-red-600 text-sm">{formErrors.inviteCode}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ministry" className={formErrors.ministryId ? 'text-red-600' : ''}>
                      Ministry *
                    </Label>
                    <Select 
                      value={formData.ministryId} 
                      onValueChange={(value) => handleInputChange('ministryId', value)}
                      required
                    >
                      <SelectTrigger className={`h-12 rounded-xl ${formErrors.ministryId ? 'border-red-500 bg-red-50' : ''}`}>
                        <SelectValue placeholder={loadingMinistries ? "Loading ministries..." : "Select a ministry"} />
                      </SelectTrigger>
                      <SelectContent>
                        {ministries.map((ministry) => (
                          <SelectItem key={ministry.id} value={ministry.id}>
                            {ministry.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {formErrors.ministryId && (
                      <p className="text-red-600 text-sm">{formErrors.ministryId}</p>
                    )}
                  </div>
                </>
              )}

              <Button
                type="submit"
                className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-lg"
                disabled={loading || (loadingMinistries && !formData.isDirector)}
              >
                {loading ? "Creating account..." : "Create Account"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{" "}
                <Link to="/auth" className="text-primary hover:underline font-medium">
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
