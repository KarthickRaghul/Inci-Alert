import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Phone, Calendar, Shield, Edit2, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { apiClient, isAuthenticated, User as UserType } from '@/services/api';

const Profile = () => {
  const [user, setUser] = useState<UserType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Form state for editing
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        if (!isAuthenticated()) {
          navigate('/login');
          return;
        }

        const response = await apiClient.getProfile();
        setUser(response.user);
        setFormData({
          first_name: response.user.first_name || '',
          last_name: response.user.last_name || '',
          phone: response.user.phone || '',
        });
      } catch (error) {
        console.error('Error fetching profile:', error);
        toast({
          title: "Error",
          description: "Failed to load profile. Please try again.",
          variant: "destructive",
        });
        // If token is invalid, redirect to login
        navigate('/login');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [navigate, toast]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await apiClient.updateProfile(formData);
      setUser(response.user);
      setIsEditing(false);
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Update Failed",
        description: error instanceof Error ? error.message : "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (user) {
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        phone: user.phone || '',
      });
    }
    setIsEditing(false);
  };

  const getUserInitials = (user: UserType): string => {
    return `${user.first_name?.charAt(0) || ''}${user.last_name?.charAt(0) || ''}`.toUpperCase() || user.username.charAt(0).toUpperCase();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 pt-16">
        <div className="container max-w-4xl mx-auto px-4 py-8">
          <div className="space-y-6">
            {/* Profile Header Skeleton */}
            <Card>
              <CardContent className="p-8">
                <div className="flex flex-col md:flex-row items-center gap-6">
                  <div className="w-24 h-24 bg-muted rounded-full animate-pulse" />
                  <div className="text-center md:text-left space-y-2">
                    <div className="h-8 w-48 bg-muted rounded animate-pulse" />
                    <div className="h-4 w-32 bg-muted rounded animate-pulse" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Profile Details Skeleton */}
            <Card>
              <CardHeader>
                <div className="h-6 w-32 bg-muted rounded animate-pulse" />
                <div className="h-4 w-48 bg-muted rounded animate-pulse" />
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="h-4 w-full bg-muted rounded animate-pulse" />
                <div className="h-4 w-3/4 bg-muted rounded animate-pulse" />
                <div className="h-4 w-1/2 bg-muted rounded animate-pulse" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 pt-16">
        <div className="container max-w-4xl mx-auto px-4 py-8">
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">Unable to load profile data.</p>
              <Button
                onClick={() => navigate('/login')}
                className="mt-4"
              >
                Go to Login
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 pt-16">
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Profile Header */}
          <Card className="border-2">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row items-center gap-6">
                <Avatar className="w-24 h-24 text-2xl">
                  <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                    {getUserInitials(user)}
                  </AvatarFallback>
                </Avatar>
                <div className="text-center md:text-left">
                  <h1 className="text-3xl font-bold">
                    {user.first_name && user.last_name 
                      ? `${user.first_name} ${user.last_name}`
                      : user.username
                    }
                  </h1>
                  <p className="text-muted-foreground mt-1">@{user.username}</p>
                  <div className="flex items-center justify-center md:justify-start gap-2 mt-3">
                    <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      user.is_active 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                    }`}>
                      <div className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                        user.is_active ? 'bg-green-400' : 'bg-red-400'
                      }`} />
                      {user.is_active ? 'Active' : 'Inactive'}
                    </div>
                    {user.is_verified && (
                      <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                        <Shield className="w-3 h-3 mr-1" />
                        Verified
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Profile Details */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle className="text-xl">Personal Information</CardTitle>
                <CardDescription>
                  Manage your personal details and contact information.
                </CardDescription>
              </div>
              {!isEditing ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                >
                  <Edit2 className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCancel}
                    disabled={isSaving}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSave}
                    disabled={isSaving}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {isSaving ? 'Saving...' : 'Save'}
                  </Button>
                </div>
              )}
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* First Name */}
                <div className="space-y-2">
                  <Label htmlFor="first_name" className="text-sm font-medium flex items-center gap-2">
                    <User className="w-4 h-4" />
                    First Name
                  </Label>
                  {isEditing ? (
                    <Input
                      id="first_name"
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleInputChange}
                      placeholder="Enter your first name"
                    />
                  ) : (
                    <p className="text-sm text-muted-foreground py-2 px-3 bg-muted/30 rounded-md min-h-[40px] flex items-center">
                      {user.first_name || 'Not provided'}
                    </p>
                  )}
                </div>

                {/* Last Name */}
                <div className="space-y-2">
                  <Label htmlFor="last_name" className="text-sm font-medium flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Last Name
                  </Label>
                  {isEditing ? (
                    <Input
                      id="last_name"
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleInputChange}
                      placeholder="Enter your last name"
                    />
                  ) : (
                    <p className="text-sm text-muted-foreground py-2 px-3 bg-muted/30 rounded-md min-h-[40px] flex items-center">
                      {user.last_name || 'Not provided'}
                    </p>
                  )}
                </div>

                {/* Email (Read-only) */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email Address
                  </Label>
                  <p className="text-sm text-muted-foreground py-2 px-3 bg-muted/30 rounded-md min-h-[40px] flex items-center">
                    {user.email}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Email cannot be changed. Contact support if needed.
                  </p>
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm font-medium flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    Phone Number
                  </Label>
                  {isEditing ? (
                    <Input
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="Enter your phone number"
                    />
                  ) : (
                    <p className="text-sm text-muted-foreground py-2 px-3 bg-muted/30 rounded-md min-h-[40px] flex items-center">
                      {user.phone || 'Not provided'}
                    </p>
                  )}
                </div>
              </div>

              <Separator />

              {/* Account Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Member Since
                  </Label>
                  <p className="text-sm text-muted-foreground py-2">
                    {formatDate(user.created_at)}
                  </p>
                </div>

                {user.last_login && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Last Login
                    </Label>
                    <p className="text-sm text-muted-foreground py-2">
                      {formatDate(user.last_login)}
                    </p>
                  </div>
                )}

                <div className="space-y-2">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    Account Role
                  </Label>
                  <p className="text-sm text-muted-foreground py-2 capitalize">
                    {user.role}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;
