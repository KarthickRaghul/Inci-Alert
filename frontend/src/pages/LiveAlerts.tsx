import { useState, useEffect, useCallback } from 'react';
import AlertCard, { Alert } from '@/components/AlertCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { apiClient, Incident } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

// Convert Incident to Alert format
const incidentToAlert = (incident: Incident): Alert => {
  // Map incident categories to alert types
  const getAlertType = (category: string, status: string): Alert['type'] => {
    if (status === 'resolved' || status === 'closed') return 'success';
    
    const criticalCategories = ['fire', 'medical', 'crime', 'hazmat'];
    const warningCategories = ['accident', 'natural_disaster', 'security'];
    
    if (criticalCategories.includes(category.toLowerCase())) return 'critical';
    if (warningCategories.includes(category.toLowerCase())) return 'warning';
    return 'info';
  };

  return {
    id: incident.id.toString(),
    title: incident.title,
    type: getAlertType(incident.category, incident.status),
    location: incident.location,
    timestamp: incident.created_at,
    description: incident.description,
    status: incident.status === 'reported' ? 'active' : 
            incident.status === 'confirmed' ? 'investigating' : 'resolved',
    media: incident.media && incident.media.length > 0 ? incident.media : undefined,
  };
};

const LiveAlerts = () => {
  const { toast } = useToast();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [filteredAlerts, setFilteredAlerts] = useState<Alert[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [newAlertIds, setNewAlertIds] = useState<Set<string>>(new Set());

  // Fetch incidents from API
  const fetchIncidents = useCallback(async () => {
    try {
      setIsRefreshing(true);
      const incidents = await apiClient.getIncidents({ limit: 50 });
      const convertedAlerts = incidents.map(incidentToAlert);
      setAlerts(convertedAlerts);
    } catch (error) {
      console.error('Error fetching incidents:', error);
      toast({
        title: "Error Loading Alerts",
        description: error instanceof Error ? error.message : "Failed to load alerts",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
      setIsLoading(false);
    }
  }, [toast]);

  // Initial load
  useEffect(() => {
    fetchIncidents();
  }, [fetchIncidents]);

  const alertTypes = [
    { value: 'all', label: 'All Alerts', count: alerts.length },
    { value: 'critical', label: 'Critical', count: alerts.filter(a => a.type === 'critical').length },
    { value: 'warning', label: 'Warning', count: alerts.filter(a => a.type === 'warning').length },
    { value: 'info', label: 'Info', count: alerts.filter(a => a.type === 'info').length },
    { value: 'success', label: 'Resolved', count: alerts.filter(a => a.type === 'success').length },
  ];

  // Simulate real-time updates - fetch new data every 30 seconds
  useEffect(() => {
    const interval = setInterval(fetchIncidents, 30000);
    return () => clearInterval(interval);
  }, [fetchIncidents]);

  // Filter alerts based on search and type
  useEffect(() => {
    let filtered = alerts;

    if (selectedType !== 'all') {
      filtered = filtered.filter(alert => alert.type === selectedType);
    }

    if (searchTerm) {
      filtered = filtered.filter(alert =>
        alert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        alert.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        alert.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredAlerts(filtered);
  }, [alerts, searchTerm, selectedType]);

  const handleRefresh = () => {
    fetchIncidents();
  };

  return (
    <div className="min-h-screen bg-gradient-dark pt-20 px-4">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold">Live Alerts</h1>
            <p className="text-muted-foreground">
              Real-time incident monitoring and updates
            </p>
          </div>
          <Button 
            onClick={handleRefresh} 
            disabled={isRefreshing}
            className="flex items-center space-x-2"
          >
            <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
            <span>Refresh</span>
          </Button>
        </div>

        {/* Filters */}
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search alerts by title, location, or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {alertTypes.map((type) => (
              <Badge
                key={type.value}
                variant={selectedType === type.value ? "default" : "outline"}
                className={cn(
                  "cursor-pointer transition-colors px-3 py-1",
                  selectedType === type.value && "bg-primary text-primary-foreground"
                )}
                onClick={() => setSelectedType(type.value)}
              >
                {type.label} ({type.count})
              </Badge>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="card-glow bg-card p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-emergency-critical">
              {alerts.filter(a => a.type === 'critical').length}
            </div>
            <div className="text-sm text-muted-foreground">Critical</div>
          </div>
          <div className="card-glow bg-card p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-emergency-warning">
              {alerts.filter(a => a.type === 'warning').length}
            </div>
            <div className="text-sm text-muted-foreground">Warning</div>
          </div>
          <div className="card-glow bg-card p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-emergency-info">
              {alerts.filter(a => a.type === 'info').length}
            </div>
            <div className="text-sm text-muted-foreground">Info</div>
          </div>
          <div className="card-glow bg-card p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-emergency-success">
              {alerts.filter(a => a.type === 'success').length}
            </div>
            <div className="text-sm text-muted-foreground">Resolved</div>
          </div>
        </div>

        {/* Alerts List */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <div className="text-muted-foreground">Loading alerts...</div>
            </div>
          ) : filteredAlerts.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-muted-foreground">
                {alerts.length === 0 ? 'No alerts available' : 'No alerts match your current filters'}
              </div>
            </div>
          ) : (
            filteredAlerts.map((alert) => (
              <AlertCard
                key={alert.id}
                alert={alert}
                isNew={newAlertIds.has(alert.id)}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default LiveAlerts;