import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, MapPin, AlertTriangle, Info, CheckCircle, Zap, Image, Video } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Alert {
  id: string;
  title: string;
  type: 'critical' | 'warning' | 'info' | 'success';
  location: string;
  timestamp: string;
  description?: string;
  status?: 'active' | 'investigating' | 'resolved';
  media?: {
    id: number;
    media_type: string;
    thumbnail_url?: string;
    file_url: string;
    mime_type: string;
  }[];
}

interface AlertCardProps {
  alert: Alert;
  isNew?: boolean;
}

const AlertCard = ({ alert, isNew = false }: AlertCardProps) => {
  const getTypeConfig = (type: Alert['type']) => {
    switch (type) {
      case 'critical':
        return {
          icon: AlertTriangle,
          bgClass: 'alert-critical',
          badgeClass: 'bg-emergency-critical text-emergency-critical-foreground',
          borderClass: 'border-l-emergency-critical',
        };
      case 'warning':
        return {
          icon: Zap,
          bgClass: 'alert-warning',
          badgeClass: 'bg-emergency-warning text-black',
          borderClass: 'border-l-emergency-warning',
        };
      case 'info':
        return {
          icon: Info,
          bgClass: 'alert-info',
          badgeClass: 'bg-emergency-info text-emergency-info-foreground',
          borderClass: 'border-l-emergency-info',
        };
      case 'success':
        return {
          icon: CheckCircle,
          bgClass: 'alert-success',
          badgeClass: 'bg-emergency-success text-emergency-success-foreground',
          borderClass: 'border-l-emergency-success',
        };
    }
  };

  const typeConfig = getTypeConfig(alert.type);
  const Icon = typeConfig.icon;

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return `${Math.floor(diffMins / 1440)}d ago`;
  };

  return (
    <Card className={cn(
      'card-glow transition-all duration-300 hover:scale-105 border-l-4',
      typeConfig.borderClass,
      typeConfig.bgClass,
      isNew && 'animate-bounce-in'
    )}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3 flex-1">
            <div className={cn(
              'p-2 rounded-full',
              alert.type === 'critical' ? 'bg-emergency-critical/20' :
              alert.type === 'warning' ? 'bg-emergency-warning/20' :
              alert.type === 'info' ? 'bg-emergency-info/20' :
              'bg-emergency-success/20'
            )}>
              <Icon className={cn(
                'h-4 w-4',
                alert.type === 'critical' ? 'text-emergency-critical' :
                alert.type === 'warning' ? 'text-emergency-warning' :
                alert.type === 'info' ? 'text-emergency-info' :
                'text-emergency-success'
              )} />
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm">{alert.title}</h3>
                <Badge variant="secondary" className={typeConfig.badgeClass}>
                  {alert.type.toUpperCase()}
                </Badge>
              </div>
              
              {alert.description && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {alert.description}
                </p>
              )}
              
              {/* Media Thumbnails */}
              {alert.media && alert.media.length > 0 && (
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1">
                    {alert.media.slice(0, 3).map((media) => (
                      <div key={media.id} className="relative w-12 h-12 rounded border overflow-hidden bg-muted">
                        {media.thumbnail_url ? (
                          <img 
                            src={`http://localhost:5000${media.thumbnail_url}`}
                            alt="Media thumbnail"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            {media.mime_type.startsWith('image/') ? (
                              <Image className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <Video className="h-4 w-4 text-muted-foreground" />
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  {alert.media.length > 3 && (
                    <span className="text-xs text-muted-foreground">
                      +{alert.media.length - 3} more
                    </span>
                  )}
                </div>
              )}
              
              <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                <div className="flex items-center space-x-1">
                  <MapPin className="h-3 w-3" />
                  <span>{alert.location}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="h-3 w-3" />
                  <span>{formatTimestamp(alert.timestamp)}</span>
                </div>
              </div>

              {alert.status && (
                <div className="flex items-center space-x-2">
                  <div className={cn(
                    'w-2 h-2 rounded-full',
                    alert.status === 'active' ? 'bg-emergency-critical animate-pulse' :
                    alert.status === 'investigating' ? 'bg-emergency-warning' :
                    'bg-emergency-success'
                  )} />
                  <span className="text-xs font-medium capitalize">
                    {alert.status}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AlertCard;