import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';
import { TrendingUp, TrendingDown, Activity, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import StatCard from '@/components/StatCard';

const monthlyData = [
  { month: 'Jan', incidents: 45, resolved: 42, critical: 8 },
  { month: 'Feb', incidents: 52, resolved: 48, critical: 12 },
  { month: 'Mar', incidents: 38, resolved: 35, critical: 6 },
  { month: 'Apr', incidents: 61, resolved: 58, critical: 15 },
  { month: 'May', incidents: 49, resolved: 47, critical: 9 },
  { month: 'Jun', incidents: 55, resolved: 52, critical: 11 },
];

const incidentTypeData = [
  { name: 'Traffic Accidents', value: 35, color: '#f59e0b' },
  { name: 'Medical Emergency', value: 28, color: '#ef4444' },
  { name: 'Fire Emergency', value: 15, color: '#dc2626' },
  { name: 'Infrastructure', value: 12, color: '#0891b2' },
  { name: 'Crime', value: 8, color: '#7c3aed' },
  { name: 'Other', value: 2, color: '#6b7280' },
];

const responseTimeData = [
  { hour: '00:00', avgTime: 4.2 },
  { hour: '02:00', avgTime: 3.8 },
  { hour: '04:00', avgTime: 3.5 },
  { hour: '06:00', avgTime: 4.8 },
  { hour: '08:00', avgTime: 6.2 },
  { hour: '10:00', avgTime: 5.5 },
  { hour: '12:00', avgTime: 7.1 },
  { hour: '14:00', avgTime: 6.8 },
  { hour: '16:00', avgTime: 8.2 },
  { hour: '18:00', avgTime: 9.1 },
  { hour: '20:00', avgTime: 6.4 },
  { hour: '22:00', avgTime: 5.2 },
];

const weeklyTrendData = [
  { day: 'Mon', incidents: 12, resolved: 10 },
  { day: 'Tue', incidents: 15, resolved: 14 },
  { day: 'Wed', incidents: 8, resolved: 8 },
  { day: 'Thu', incidents: 18, resolved: 16 },
  { day: 'Fri', incidents: 22, resolved: 20 },
  { day: 'Sat', incidents: 25, resolved: 23 },
  { day: 'Sun', incidents: 14, resolved: 13 },
];

const chartConfig = {
  incidents: {
    label: "Incidents",
    color: "hsl(var(--primary))",
  },
  resolved: {
    label: "Resolved",
    color: "hsl(var(--emergency-success))",
  },
  critical: {
    label: "Critical",
    color: "hsl(var(--emergency-critical))",
  },
  avgTime: {
    label: "Avg Response Time (min)",
    color: "hsl(var(--emergency-warning))",
  },
};

const Statistics = () => {
  return (
    <div className="min-h-screen bg-gradient-dark pt-20 px-4">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl md:text-4xl font-bold">Statistics Dashboard</h1>
          <p className="text-muted-foreground">
            Comprehensive incident analytics and performance metrics
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="This Month"
            value="55"
            description="Total incidents reported"
            icon={AlertTriangle}
            trend={{ value: 12, label: "vs last month" }}
            variant="default"
          />
          <StatCard
            title="Resolution Rate"
            value="94.5%"
            description="Successfully resolved"
            icon={CheckCircle}
            trend={{ value: 3, label: "improvement" }}
            variant="success"
          />
          <StatCard
            title="Avg Response"
            value="5.2m"
            description="Time to first response"
            icon={Clock}
            trend={{ value: -8, label: "faster" }}
            variant="warning"
          />
          <StatCard
            title="Active Now"
            value="7"
            description="Currently ongoing"
            icon={Activity}
            trend={{ value: -22, label: "vs yesterday" }}
            variant="critical"
          />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Monthly Incidents Trend */}
          <Card className="card-glow">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                <span>Monthly Incident Trends</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig}>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Area 
                      type="monotone" 
                      dataKey="incidents" 
                      stroke="hsl(var(--primary))" 
                      fill="hsl(var(--primary))" 
                      fillOpacity={0.3}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="resolved" 
                      stroke="hsl(var(--emergency-success))" 
                      fill="hsl(var(--emergency-success))" 
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Incident Types Distribution */}
          <Card className="card-glow">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="h-5 w-5 text-primary" />
                <span>Incident Types Distribution</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={incidentTypeData}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {incidentTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <ChartTooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Response Time by Hour */}
          <Card className="card-glow">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-emergency-warning" />
                <span>Response Time by Hour</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig}>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={responseTimeData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="hour" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line 
                      type="monotone" 
                      dataKey="avgTime" 
                      stroke="hsl(var(--emergency-warning))" 
                      strokeWidth={3}
                      dot={{ fill: "hsl(var(--emergency-warning))", strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Weekly Performance */}
          <Card className="card-glow">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingDown className="h-5 w-5 text-emergency-success" />
                <span>Weekly Performance</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig}>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={weeklyTrendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="incidents" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="resolved" fill="hsl(var(--emergency-success))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>

        {/* Performance Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="card-glow border-emergency-success/30 bg-emergency-success/5">
            <CardContent className="p-6 text-center">
              <CheckCircle className="h-8 w-8 mx-auto mb-2 text-emergency-success" />
              <div className="text-2xl font-bold text-emergency-success">847</div>
              <div className="text-sm text-muted-foreground">Total Resolved</div>
              <div className="text-xs text-emergency-success mt-1">+15% this month</div>
            </CardContent>
          </Card>

          <Card className="card-glow border-primary/30 bg-primary/5">
            <CardContent className="p-6 text-center">
              <Activity className="h-8 w-8 mx-auto mb-2 text-primary" />
              <div className="text-2xl font-bold text-primary">4.2m</div>
              <div className="text-sm text-muted-foreground">Avg Response</div>
              <div className="text-xs text-primary mt-1">Best in region</div>
            </CardContent>
          </Card>

          <Card className="card-glow border-emergency-warning/30 bg-emergency-warning/5">
            <CardContent className="p-6 text-center">
              <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-emergency-warning" />
              <div className="text-2xl font-bold text-emergency-warning">12</div>
              <div className="text-sm text-muted-foreground">Critical This Week</div>
              <div className="text-xs text-emergency-warning mt-1">-8% vs last week</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Statistics;