import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Sun, Moon, AlertTriangle, User, LogOut } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { apiClient, isAuthenticated, User as UserType } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

const navigation = [
  { name: 'Home', href: '/' },
  { name: 'Live Alerts', href: '/alerts' },
  { name: 'Report Incident', href: '/report' },
  { name: 'Statistics', href: '/stats' },
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<UserType | null>(null);
  const [isUserLoading, setIsUserLoading] = useState(true);

  const isActive = (href: string) => location.pathname === href;

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (isAuthenticated()) {
          const response = await apiClient.getProfile();
          setUser(response.user);
        }
      } catch (error) {
        // If profile fetch fails, clear invalid token
        apiClient.clearToken();
        setUser(null);
      } finally {
        setIsUserLoading(false);
      }
    };

    checkAuth();
  }, []);

  const handleLogout = async () => {
    try {
      await apiClient.logout();
      setUser(null);
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
      });
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
      // Force logout even if server request fails
      apiClient.clearToken();
      setUser(null);
      navigate('/');
    }
  };

  const getUserInitials = (user: UserType): string => {
    return `${user.first_name?.charAt(0) || ''}${user.last_name?.charAt(0) || ''}`.toUpperCase() || user.username.charAt(0).toUpperCase();
  };

  return (
    <nav className="fixed top-0 w-full z-50 bg-card/80 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2 group">
              <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-primary/60 group-hover:shadow-glow transition-all duration-300">
                <AlertTriangle className="h-6 w-6 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Inci-Alert
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  'px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200',
                  isActive(item.href)
                    ? 'text-primary bg-primary/10 border border-primary/20'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                )}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Theme Switcher & Authentication */}
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="w-9 h-9 p-0"
            >
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>

            {/* Authentication */}
            {isUserLoading ? (
              <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
            ) : user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {getUserInitials(user)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium">
                        {user.first_name && user.last_name 
                          ? `${user.first_name} ${user.last_name}`
                          : user.username
                        }
                      </p>
                      <p className="w-[200px] truncate text-sm text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="cursor-pointer" asChild>
                    <Link to="/profile" className="flex items-center">
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="cursor-pointer" onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="hidden md:flex items-center space-x-2">
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/login">Sign In</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link to="/register">Sign Up</Link>
                </Button>
              </div>
            )}

            {/* Mobile menu button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(!isOpen)}
                className="w-9 h-9 p-0"
              >
                {isOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden animate-slide-in-right">
          <div className="px-2 pt-2 pb-3 space-y-1 bg-card border-t border-border">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  'block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200',
                  isActive(item.href)
                    ? 'text-primary bg-primary/10 border border-primary/20'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                )}
              >
                {item.name}
              </Link>
            ))}

            {/* Mobile Authentication */}
            {!isUserLoading && !user && (
              <div className="pt-4 pb-3 border-t border-border space-y-2">
                <Link
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  className="block px-3 py-2 rounded-md text-base font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setIsOpen(false)}
                  className="block px-3 py-2 rounded-md text-base font-medium bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {user && (
              <div className="pt-4 pb-3 border-t border-border">
                <div className="px-3 py-2">
                  <p className="text-base font-medium">
                    {user.first_name && user.last_name 
                      ? `${user.first_name} ${user.last_name}`
                      : user.username
                    }
                  </p>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
                <Button
                  variant="ghost"
                  className="w-full justify-start mt-2 text-muted-foreground hover:text-foreground"
                  onClick={() => {
                    handleLogout();
                    setIsOpen(false);
                  }}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;