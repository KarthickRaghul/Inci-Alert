import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Map from '@/components/Map';
import StatCard from '@/components/StatCard';
import { AlertTriangle, Activity, CheckCircle, Clock, Phone, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { apiClient, OverviewStats } from '@/services/api';

const Home = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [stats, setStats] = useState<OverviewStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await apiClient.getOverviewStats();
        setStats(data);
      } catch (error) {
        console.error('Error loading stats:', error);
        toast({
          title: "Error",
          description: "Failed to load dashboard statistics",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadStats();
  }, [toast]);

  const handleReportIncident = () => {
    navigate('/report');
  };

  const handleEmergencyServices = () => {
    // Show emergency contacts dialog or take action
    const emergencyNumbers = [
      { service: 'Police', number: '911' },
      { service: 'Fire Department', number: '911' },
      { service: 'Medical Emergency', number: '911' },
      { service: 'Poison Control', number: '1-800-222-1222' },
    ];

    toast({
      title: "Emergency Services",
      description: (
        <div className="space-y-2">
          <p className="font-medium">Quick Emergency Contacts:</p>
          {emergencyNumbers.map((contact, index) => (
            <div key={index} className="flex justify-between items-center">
              <span>{contact.service}:</span>
              <a 
                href={`tel:${contact.number}`}
                className="text-primary hover:underline font-mono"
              >
                {contact.number}
              </a>
            </div>
          ))}
        </div>
      ),
      duration: 10000, // Show for 10 seconds
    });
  };

  return (
    <div className="min-h-screen bg-gradient-background pt-20 px-4">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Inci-Alert Dashboard
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Real-time incident monitoring and emergency response coordination
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div onClick={() => navigate('/stats')} className="cursor-pointer">
            <StatCard
              title="Total Incidents"
              value={isLoading ? "..." : stats?.total_incidents.toString() || "0"}
              description="All time recorded"
              icon={AlertTriangle}
              trend={stats?.weekly_trend ? {
                value: stats.weekly_trend.length > 1 ? 
                  ((stats.weekly_trend[stats.weekly_trend.length - 1].count - 
                    stats.weekly_trend[stats.weekly_trend.length - 2].count) / 
                    stats.weekly_trend[stats.weekly_trend.length - 2].count * 100) : 0,
                label: "vs last week"
              } : undefined}
              variant="default"
            />
          </div>
          <div onClick={() => navigate('/alerts')} className="cursor-pointer">
            <StatCard
              title="Recent (24h)"
              value={isLoading ? "..." : stats?.recent_incidents_24h.toString() || "0"}
              description="Last 24 hours"
              icon={Activity}
              trend={{ value: 0, label: "vs yesterday" }}
              variant="critical"
            />
          </div>
          <div onClick={() => navigate('/stats')} className="cursor-pointer">
            <StatCard
              title="Resolved"
              value={isLoading ? "..." : stats?.status_breakdown?.find(s => s.status === 'resolved')?.count.toString() || "0"}
              description="Successfully handled"
              icon={CheckCircle}
              trend={{ value: 0, label: "resolution rate" }}
              variant="success"
            />
          </div>
          <div onClick={() => navigate('/alerts')} className="cursor-pointer">
            <StatCard
              title="Open Cases"
              value={isLoading ? "..." : (stats?.status_breakdown?.filter(s => s.status !== 'resolved' && s.status !== 'closed')?.reduce((sum, s) => sum + s.count, 0).toString() || "0")}
              description="Currently active"
              icon={Clock}
              trend={{ value: 0, label: "pending review" }}
              variant="warning"
            />
          </div>
        </div>

        {/* Map Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Live Incident Map</h2>
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-emergency-critical animate-pulse" />
                <span>Critical</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-emergency-warning" />
                <span>Warning</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-emergency-info" />
                <span>Info</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-emergency-success" />
                <span>Resolved</span>
              </div>
            </div>
          </div>
          
          <div className="h-[600px] rounded-lg overflow-hidden card-glow bg-card">
            <Map />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-8">
          <div className="card-glow bg-gradient-card p-6 rounded-lg border border-border">
            <div className="flex items-start justify-between mb-2">
              <h3 className="text-lg font-semibold">Quick Report</h3>
              <AlertTriangle className="h-5 w-5 text-primary" />
            </div>
            <p className="text-muted-foreground mb-4">
              Report a new incident quickly from your current location
            </p>
            <Button 
              onClick={handleReportIncident}
              className="w-full"
            >
              Report Incident
            </Button>
          </div>
          
          <div className="card-glow bg-gradient-card p-6 rounded-lg border border-border">
            <div className="flex items-start justify-between mb-2">
              <h3 className="text-lg font-semibold">Emergency Contacts</h3>
              <Phone className="h-5 w-5 text-destructive" />
            </div>
            <p className="text-muted-foreground mb-4">
              Access emergency services and support contacts
            </p>
            <Button 
              onClick={handleEmergencyServices}
              variant="destructive"
              className="w-full"
            >
              <Phone className="mr-2 h-4 w-4" />
              Emergency Services
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;