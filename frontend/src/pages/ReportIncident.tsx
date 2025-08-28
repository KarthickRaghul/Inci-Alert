import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Upload, MapPin, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface IncidentForm {
  title: string;
  type: string;
  location: string;
  description: string;
  media: File | null;
  coordinates: { lat: number; lng: number } | null;
}

const incidentTypes = [
  { value: 'fire', label: 'Fire Emergency' },
  { value: 'medical', label: 'Medical Emergency' },
  { value: 'accident', label: 'Traffic Accident' },
  { value: 'crime', label: 'Criminal Activity' },
  { value: 'natural', label: 'Natural Disaster' },
  { value: 'infrastructure', label: 'Infrastructure Failure' },
  { value: 'hazmat', label: 'Hazardous Materials' },
  { value: 'other', label: 'Other' },
];

const ReportIncident = () => {
  const { toast } = useToast();
  const [form, setForm] = useState<IncidentForm>({
    title: '',
    type: '',
    location: '',
    description: '',
    media: null,
    coordinates: null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Partial<IncidentForm>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<IncidentForm> = {};

    if (!form.title.trim()) {
      newErrors.title = 'Incident title is required';
    }

    if (!form.type) {
      newErrors.type = 'Incident type is required';
    }

    if (!form.location.trim()) {
      newErrors.location = 'Location is required';
    }

    if (!form.description.trim()) {
      newErrors.description = 'Description is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Incident Reported Successfully",
        description: "Emergency services have been notified and will respond accordingly.",
        variant: "default",
      });

      // Reset form
      setForm({
        title: '',
        type: '',
        location: '',
        description: '',
        media: null,
        coordinates: null,
      });
      setErrors({});
    } catch (error) {
      toast({
        title: "Error Reporting Incident",
        description: "Please try again or contact emergency services directly.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: "Please select a file smaller than 10MB.",
          variant: "destructive",
        });
        return;
      }
      setForm(prev => ({ ...prev, media: file }));
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setForm(prev => ({
            ...prev,
            coordinates: {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            },
          }));
          toast({
            title: "Location Captured",
            description: "Your current location has been added to the report.",
          });
        },
        (error) => {
          toast({
            title: "Location Error",
            description: "Unable to get your current location. Please enter manually.",
            variant: "destructive",
          });
        }
      );
    } else {
      toast({
        title: "Geolocation Not Supported",
        description: "Your browser doesn't support location services.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-dark pt-20 px-4">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center">
            <div className="p-3 rounded-full bg-primary/20 border border-primary/30">
              <AlertTriangle className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold">Report Incident</h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            Report an emergency or incident to alert authorities and nearby users
          </p>
        </div>

        {/* Emergency Warning */}
        <Card className="border-emergency-critical/30 bg-emergency-critical/5">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="h-5 w-5 text-emergency-critical flex-shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-emergency-critical">Emergency Situations</p>
                <p className="text-muted-foreground">
                  For immediate life-threatening emergencies, call 911 directly before using this form.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Report Form */}
        <Card className="card-glow">
          <CardHeader>
            <CardTitle>Incident Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Incident Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Incident Title *</Label>
                <Input
                  id="title"
                  type="text"
                  placeholder="Brief description of the incident"
                  value={form.title}
                  onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
                  className={errors.title ? 'border-destructive' : ''}
                />
                {errors.title && (
                  <p className="text-sm text-destructive">{errors.title}</p>
                )}
              </div>

              {/* Incident Type */}
              <div className="space-y-2">
                <Label htmlFor="type">Incident Type *</Label>
                <Select value={form.type} onValueChange={(value) => setForm(prev => ({ ...prev, type: value }))}>
                  <SelectTrigger className={errors.type ? 'border-destructive' : ''}>
                    <SelectValue placeholder="Select incident type" />
                  </SelectTrigger>
                  <SelectContent>
                    {incidentTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.type && (
                  <p className="text-sm text-destructive">{errors.type}</p>
                )}
              </div>

              {/* Location */}
              <div className="space-y-2">
                <Label htmlFor="location">Location *</Label>
                <div className="flex gap-2">
                  <Input
                    id="location"
                    type="text"
                    placeholder="Street address or landmark"
                    value={form.location}
                    onChange={(e) => setForm(prev => ({ ...prev, location: e.target.value }))}
                    className={`flex-1 ${errors.location ? 'border-destructive' : ''}`}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={getCurrentLocation}
                    title="Use current location"
                  >
                    <MapPin className="h-4 w-4" />
                  </Button>
                </div>
                {errors.location && (
                  <p className="text-sm text-destructive">{errors.location}</p>
                )}
                {form.coordinates && (
                  <p className="text-xs text-muted-foreground flex items-center space-x-1">
                    <Check className="h-3 w-3 text-emergency-success" />
                    <span>GPS coordinates captured</span>
                  </p>
                )}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Provide detailed information about the incident, including what happened, current status, and any immediate dangers"
                  value={form.description}
                  onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                  className={`min-h-[120px] ${errors.description ? 'border-destructive' : ''}`}
                />
                {errors.description && (
                  <p className="text-sm text-destructive">{errors.description}</p>
                )}
              </div>

              {/* Media Upload */}
              <div className="space-y-2">
                <Label htmlFor="media">Upload Media (Optional)</Label>
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                  <input
                    id="media"
                    type="file"
                    accept="image/*,video/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <label htmlFor="media" className="cursor-pointer">
                    <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      {form.media 
                        ? `Selected: ${form.media.name}` 
                        : 'Click to upload photos or videos (max 10MB)'
                      }
                    </p>
                  </label>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting}
                size="lg"
              >
                {isSubmitting ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
                    <span>Submitting Report...</span>
                  </div>
                ) : (
                  'Submit Incident Report'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Contact Info */}
        <Card className="bg-muted/20">
          <CardContent className="p-4 text-center">
            <p className="text-sm text-muted-foreground">
              Need immediate assistance? Contact emergency services directly:
            </p>
            <div className="flex justify-center space-x-6 mt-2 text-sm font-medium">
              <span>Emergency: 101</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ReportIncident;