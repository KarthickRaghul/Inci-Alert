import Map from '@/components/Map';
import StatCard from '@/components/StatCard';
import { AlertTriangle, Activity, CheckCircle, Clock } from 'lucide-react';

const Home = () => {
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
          <StatCard
            title="Total Incidents"
            value="247"
            description="All time recorded"
            icon={AlertTriangle}
            trend={{ value: 12, label: "vs last month" }}
            variant="default"
          />
          <StatCard
            title="Active Incidents"
            value="23"
            description="Currently ongoing"
            icon={Activity}
            trend={{ value: -8, label: "vs yesterday" }}
            variant="critical"
          />
          <StatCard
            title="Resolved Today"
            value="15"
            description="Successfully handled"
            icon={CheckCircle}
            trend={{ value: 25, label: "vs yesterday" }}
            variant="success"
          />
          <StatCard
            title="Avg Response Time"
            value="4.2m"
            description="Minutes to first response"
            icon={Clock}
            trend={{ value: -15, label: "improvement" }}
            variant="warning"
          />
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
            <Map showTokenInput={true} />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-8">
          <div className="card-glow bg-gradient-card p-6 rounded-lg border border-border">
            <h3 className="text-lg font-semibold mb-2">Quick Report</h3>
            <p className="text-muted-foreground mb-4">
              Report a new incident quickly from your current location
            </p>
            <button className="w-full bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors">
              Report Incident
            </button>
          </div>
          
          <div className="card-glow bg-gradient-card p-6 rounded-lg border border-border">
            <h3 className="text-lg font-semibold mb-2">Emergency Contacts</h3>
            <p className="text-muted-foreground mb-4">
              Access emergency services and support contacts
            </p>
            <button className="w-full bg-destructive text-destructive-foreground px-4 py-2 rounded-md hover:bg-destructive/90 transition-colors">
              Emergency Services
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;