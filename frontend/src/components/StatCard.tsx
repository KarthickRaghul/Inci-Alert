import { Card, CardContent } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    label: string;
  };
  variant?: 'default' | 'critical' | 'warning' | 'success';
}

const StatCard = ({ 
  title, 
  value, 
  description, 
  icon: Icon, 
  trend, 
  variant = 'default' 
}: StatCardProps) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'critical':
        return 'border-emergency-critical/30 bg-emergency-critical/5';
      case 'warning':
        return 'border-emergency-warning/30 bg-emergency-warning/5';
      case 'success':
        return 'border-emergency-success/30 bg-emergency-success/5';
      default:
        return 'border-primary/30 bg-primary/5';
    }
  };

  const getIconColor = () => {
    switch (variant) {
      case 'critical':
        return 'text-emergency-critical';
      case 'warning':
        return 'text-emergency-warning';
      case 'success':
        return 'text-emergency-success';
      default:
        return 'text-primary';
    }
  };

  return (
    <Card className={cn(
      'card-glow transition-all duration-300 hover:scale-105',
      getVariantClasses()
    )}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">
              {title}
            </p>
            <div>
              <p className="text-2xl font-bold">{value}</p>
              {description && (
                <p className="text-xs text-muted-foreground">
                  {description}
                </p>
              )}
            </div>
            {trend && (
              <div className="flex items-center space-x-1">
                <span className={cn(
                  'text-xs font-medium px-2 py-1 rounded-full',
                  trend.value > 0 
                    ? 'bg-emergency-critical/20 text-emergency-critical' 
                    : trend.value < 0 
                    ? 'bg-emergency-success/20 text-emergency-success'
                    : 'bg-muted text-muted-foreground'
                )}>
                  {trend.value > 0 ? '+' : ''}{trend.value}%
                </span>
                <span className="text-xs text-muted-foreground">
                  {trend.label}
                </span>
              </div>
            )}
          </div>
          <div className={cn(
            'p-3 rounded-full bg-muted/50',
            getIconColor()
          )}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatCard;