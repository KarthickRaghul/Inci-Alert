import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Loader2, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/services/api';

const ForgotPassword = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [form, setForm] = useState({
    email: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Email validation
    if (!form.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    
    try {
      await apiClient.requestPasswordReset(form.email);
      setEmailSent(true);
      toast({
        title: "Reset Email Sent",
        description: "If an account with this email exists, you'll receive password reset instructions.",
      });
    } catch (error) {
      console.error('Password reset request error:', error);
      toast({
        title: "Request Failed",
        description: error instanceof Error ? error.message : "Failed to send reset email. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-2">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <CardTitle className="text-2xl font-bold">Check Your Email</CardTitle>
            <CardDescription>
              Password reset instructions have been sent to your email address.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                We've sent a password reset link to:
              </p>
              <p className="font-medium">{form.email}</p>
            </div>
            
            <div className="space-y-4 pt-4">
              <p className="text-sm text-muted-foreground text-center">
                Didn't receive the email? Check your spam folder or try again.
              </p>
              
              <div className="flex flex-col gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setEmailSent(false);
                    setForm({ email: '' });
                  }}
                  className="w-full"
                >
                  Try Different Email
                </Button>
                
                <Button variant="ghost" asChild className="w-full">
                  <Link to="/login" className="flex items-center gap-2">
                    <ArrowLeft className="w-4 h-4" />
                    Back to Sign In
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-2">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Forgot Password?</CardTitle>
          <CardDescription>
            Enter your email address and we'll send you a link to reset your password.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email address"
                  value={form.email}
                  onChange={handleInputChange}
                  className={`pl-10 ${errors.email ? 'border-red-500 focus:border-red-500' : ''}`}
                  disabled={isLoading}
                  required
                />
              </div>
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email}</p>
              )}
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending Reset Email...
                </>
              ) : (
                'Send Reset Email'
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Button variant="ghost" asChild>
              <Link to="/login" className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back to Sign In
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ForgotPassword;
