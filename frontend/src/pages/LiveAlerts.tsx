import { useState, useEffect } from 'react';
import AlertCard, { Alert } from '@/components/AlertCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

// Mock alerts data
const mockAlerts: Alert[] = [
  {
    id: '1',
    title: 'Building Fire Emergency',
    type: 'critical',
    location: 'Downtown Business District',
    timestamp: new Date(Date.now() - 5 * 60000).toISOString(),
    description: 'Multiple units responding to commercial building fire with potential occupants trapped.',
    status: 'active'
  },
  {
    id: '2',
    title: 'Multi-Vehicle Accident',
    type: 'warning',
    location: 'Highway 101 & Oak Street',
    timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
    description: 'Three-car collision blocking two lanes, emergency services en route.',
    status: 'investigating'
  },
  {
    id: '3',
    title: 'Power Grid Maintenance',
    type: 'info',
    location: 'Residential Area - Sector 7',
    timestamp: new Date(Date.now() - 30 * 60000).toISOString(),
    description: 'Scheduled maintenance affecting 1,200 homes. Expected duration: 3 hours.',
    status: 'active'
  },
  {
    id: '4',
    title: 'Medical Emergency Resolved',
    type: 'success',
    location: 'City Park East Entrance',
    timestamp: new Date(Date.now() - 45 * 60000).toISOString(),
    description: 'Patient successfully transported to hospital. Scene cleared.',
    status: 'resolved'
  },
  {
    id: '5',
    title: 'Gas Leak Reported',
    type: 'critical',
    location: 'Main Street Shopping Center',
    timestamp: new Date(Date.now() - 60 * 60000).toISOString(),
    description: 'Evacuation in progress. Gas company and fire department on scene.',
    status: 'active'
  },
];

const LiveAlerts = () => {
  const [alerts, setAlerts] = useState<Alert[]>(mockAlerts);
  const [filteredAlerts, setFilteredAlerts] = useState<Alert[]>(mockAlerts);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [newAlertIds, setNewAlertIds] = useState<Set<string>>(new Set());

  const alertTypes = [
    { value: 'all', label: 'All Alerts', count: alerts.length },
    { value: 'critical', label: 'Critical', count: alerts.filter(a => a.type === 'critical').length },
    { value: 'warning', label: 'Warning', count: alerts.filter(a => a.type === 'warning').length },
    { value: 'info', label: 'Info', count: alerts.filter(a => a.type === 'info').length },
    { value: 'success', label: 'Resolved', count: alerts.filter(a => a.type === 'success').length },
  ];

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Randomly add new alerts (10% chance every 5 seconds)
      if (Math.random() < 0.1) {
        const newAlert: Alert = {
          id: Date.now().toString(),
          title: 'New Incident Reported',
          type: ['critical', 'warning', 'info'][Math.floor(Math.random() * 3)] as Alert['type'],
          location: 'Various Locations',
          timestamp: new Date().toISOString(),
          description: 'Automatically generated incident for demonstration.',
          status: 'active'
        };
        
        setAlerts(prev => [newAlert, ...prev]);
        setNewAlertIds(prev => new Set([...prev, newAlert.id]));
        
        // Remove the "new" indicator after 3 seconds
        setTimeout(() => {
          setNewAlertIds(prev => {
            const updated = new Set(prev);
            updated.delete(newAlert.id);
            return updated;
          });
        }, 3000);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

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

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsRefreshing(false);
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
          {filteredAlerts.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-muted-foreground">
                No alerts match your current filters
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