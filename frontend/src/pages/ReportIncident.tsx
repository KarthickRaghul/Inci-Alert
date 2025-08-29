import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Upload, MapPin, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiClient, CreateIncidentData } from '@/services/api';

interface IncidentForm {
  title: string;
  category: string;
  location: string;
  description: string;
  media: File[] | null;
  coordinates: { lat: number; lng: number } | null;
}

const incidentTypes = [
  { value: 'fire', label: 'Fire Emergency' },
  { value: 'accident', label: 'Traffic Accident' },
  { value: 'medical', label: 'Medical Emergency' },
  { value: 'crime', label: 'Crime in Progress' },
  { value: 'weather', label: 'Severe Weather' },
  { value: 'natural_disaster', label: 'Natural Disaster' },
  { value: 'infrastructure', label: 'Infrastructure Failure' },
  { value: 'security', label: 'Security Threat' },
  { value: 'hazmat', label: 'Hazardous Materials' },
  { value: 'other', label: 'Other' },
];

const ReportIncident = () => {
  const { toast } = useToast();
  const [form, setForm] = useState<IncidentForm>({
    title: '',
    category: '',
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
    
    if (!form.category) {
      newErrors.category = 'Incident type is required';
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
      const incidentData: CreateIncidentData = {
        title: form.title,
        description: form.description,
        category: form.category,
        location: form.location,
        latitude: form.coordinates?.lat,
        longitude: form.coordinates?.lng,
      };

      let createdIncident;
      
      // If there are media files, use the multipart endpoint
      if (form.media && form.media.length > 0) {
        createdIncident = await apiClient.createIncidentWithMedia(incidentData, form.media);
      } else {
        createdIncident = await apiClient.createIncident(incidentData);
      }
      
      toast({
        title: "Incident Reported Successfully",
        description: `Your incident report #${createdIncident.id} has been submitted. Emergency services have been notified.`,
        variant: "default",
      });

      // Reset form
      setForm({
        title: '',
        category: '',
        location: '',
        description: '',
        media: null,
        coordinates: null,
      });
      setErrors({});
      
    } catch (error) {
      console.error('Error reporting incident:', error);
      toast({
        title: "Error Reporting Incident",
        description: error instanceof Error ? error.message : "Please try again or contact emergency services directly.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      // Validate file size (max 10MB per file)
      const maxSize = 10 * 1024 * 1024;
      const validFiles: File[] = [];
      
      for (const file of Array.from(files)) {
        if (file.size > maxSize) {
          toast({
            title: "File Too Large",
            description: `${file.name} is larger than 10MB. Please select a smaller file.`,
            variant: "destructive",
          });
          continue;
        }
        validFiles.push(file);
      }
      
      if (validFiles.length > 0) {
        setForm(prev => ({ ...prev, media: validFiles }));
      }
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
        title: "Location Not Supported",
        description: "Geolocation is not supported by this browser.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emergency-50 via-white to-emergency-100 p-4">
      <div className="max-w-2xl mx-auto pt-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[hsl(var(--emergency-critical))] rounded-full mb-4 shadow-lg">
            <AlertTriangle className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-extrabold text-[hsl(var(--emergency-critical))] mb-2 tracking-tight">
            Report Emergency Incident
          </h1>
          <p className="text-lg text-gray-600 max-w-md mx-auto">
            Provide detailed information about the emergency situation. This will help emergency services respond quickly and effectively.
          </p>
        </div>

        <Card className="shadow-xl border-0">
          <CardHeader className="bg-[hsl(var(--emergency-critical))] text-white">
            <CardTitle className="text-xl font-semibold">Incident Report Form</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
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
                <Label htmlFor="category">Incident Type *</Label>
                <Select value={form.category} onValueChange={(value) => setForm(prev => ({ ...prev, category: value }))}>
                  <SelectTrigger className={errors.category ? 'border-destructive' : ''}>
                    <SelectValue placeholder="Select incident type" />
                  </SelectTrigger>
                  <SelectContent>
                    {incidentTypes.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.category && (
                  <p className="text-sm text-destructive">{errors.category}</p>
                )}
              </div>

              {/* Location */}
              <div className="space-y-2">
                <Label htmlFor="location">Location *</Label>
                <div className="flex gap-2">
                  <Input
                    id="location"
                    type="text"
                    placeholder="Enter specific address or landmark"
                    value={form.location}
                    onChange={(e) => setForm(prev => ({ ...prev, location: e.target.value }))}
                    className={`flex-1 ${errors.location ? 'border-destructive' : ''}`}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={getCurrentLocation}
                    className="px-4"
                  >
                    <MapPin className="h-4 w-4" />
                  </Button>
                </div>
                {errors.location && (
                  <p className="text-sm text-destructive">{errors.location}</p>
                )}
                {form.coordinates && (
                  <p className="text-sm text-green-600 flex items-center gap-1">
                    <Check className="h-3 w-3 text-[hsl(var(--emergency-success))]" />
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
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <label htmlFor="media" className="cursor-pointer">
                    <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      {form.media && form.media.length > 0
                        ? `Selected: ${form.media.length} file${form.media.length > 1 ? 's' : ''}`
                        : 'Click to upload photos or videos (max 10MB each)'
                      }
                    </p>
                  </label>
                </div>
                {form.media && form.media.length > 0 && (
                  <div className="space-y-1">
                    {Array.from(form.media).map((file, index) => (
                      <p key={index} className="text-xs text-gray-500">
                        {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                      </p>
                    ))}
                  </div>
                )}
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

        {/* Important Notice */}
        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-yellow-800 mb-1">Important:</p>
              <p className="text-yellow-700">
                If this is a life-threatening emergency, please call emergency services (911/108) immediately. 
                This form is for reporting non-critical incidents or providing additional information about ongoing emergencies.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportIncident;