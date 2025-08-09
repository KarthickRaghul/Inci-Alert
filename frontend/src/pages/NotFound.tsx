import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AlertTriangle, Home } from "lucide-react";
import { Link } from "react-router-dom";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-gradient-dark flex items-center justify-center px-4">
      <Card className="card-glow max-w-md w-full text-center p-8">
        <div className="flex justify-center mb-6">
          <div className="p-4 rounded-full bg-destructive/20 border border-destructive/30">
            <AlertTriangle className="h-12 w-12 text-destructive" />
          </div>
        </div>
        
        <h1 className="text-4xl font-bold mb-4">404</h1>
        <h2 className="text-xl font-semibold mb-4">Page Not Found</h2>
        <p className="text-muted-foreground mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        
        <div className="space-y-4">
          <Button asChild className="w-full">
            <Link to="/" className="flex items-center justify-center space-x-2">
              <Home className="h-4 w-4" />
              <span>Return to Dashboard</span>
            </Link>
          </Button>
          
          <div className="text-sm text-muted-foreground">
            <p>If you believe this is an error, please contact support.</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default NotFound;
