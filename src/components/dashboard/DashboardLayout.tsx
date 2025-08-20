import { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Hotel, 
  Calendar, 
  Car, 
  Package, 
  Palette, 
  UtensilsCrossed,
  Ticket,
  Settings,
  LogOut,
  Menu,
  X,
  Home,
  User,
  Building,
  BadgeCheck,
  Mail,
  Phone,
  MapPin,
  Crown
} from 'lucide-react';
import { getCurrentUser, isAuthenticated, logout as doLogout } from "@/services/auth";
import { useNavigate, useLocation } from 'react-router-dom';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

interface UserData {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar: string | null;
  phone: string | null;
  address: string | null;
  businessInfo: {
    companyName: string | null;
    license: string | null;
    specialties: string[];
    description: string | null;
  };
  emailVerified: boolean;
  lastLogin: string;
  createdAt: string;
  updatedAt: string;
  active: boolean;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (isAuthenticated()) {
      getCurrentUser()
        .then((userData) => {
          setUser(userData);
        })
        .catch(() => {
          // Handle error
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
      // Redirect to login if not authenticated
      navigate('/login');
    }
  }, [navigate]);

  const menuItems = [
    { icon: Home, label: 'Tableau de bord', href: '/dashboard' },
    { icon: BarChart3, label: 'Statistiques', href: '/dashboard/statistics' },
    { icon: Calendar, label: 'Événements', href: '/dashboard/events' },
    { icon: Car, label: 'Transport', href: '/dashboard/transport' },
    { icon: Package, label: 'Forfaits', href: '/dashboard/packages' },
    { icon: Palette, label: 'Artisanat', href: '/dashboard/artisan' },
    { icon: UtensilsCrossed, label: 'Gastronomie', href: '/dashboard/food' },
    { icon: Ticket, label: 'Billetterie', href: '/dashboard/tickets' },
  ];

  const handleLogout = () => {
    doLogout();
    navigate('/');
  };

  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRoleBadge = (role: string) => {
    const roleMap: { [key: string]: { text: string; color: string; icon: React.ReactNode } } = {
      'ROLE_SELLER': { 
        text: 'Vendeur', 
        color: 'bg-blue-100 text-blue-800',
        icon: <Building className="w-3 h-3" />
      },
      'ROLE_ADMIN': { 
        text: 'Administrateur', 
        color: 'bg-purple-100 text-purple-800',
        icon: <Crown className="w-3 h-3" />
      },
      'ROLE_USER': { 
        text: 'Utilisateur', 
        color: 'bg-gray-100 text-gray-800',
        icon: <User className="w-3 h-3" />
      }
    };

    return roleMap[role] || { text: role, color: 'bg-gray-100 text-gray-800', icon: <User className="w-3 h-3" /> };
  };

  const isActiveItem = (href: string) => {
    return location.pathname === href;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-luxury-ivory flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-luxury-ivory">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-background/95 backdrop-blur-xl border-r border-border/20 shadow-xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between p-6 border-b border-border/20">
            <h1 className="font-serif text-2xl font-bold text-foreground">
              MystigTravel
            </h1>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 rounded-lg hover:bg-muted transition-colors duration-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User Profile Section */}
          {user && (
            <div className="p-6 border-b border-border/20">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center shadow-lg">
                  {user.avatar ? (
                    <img 
                      src={user.avatar} 
                      alt={user.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-primary-foreground font-medium text-lg">
                      {getUserInitials(user.name)}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{user.name}</p>
                  <div className="flex items-center space-x-1 mt-1">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${getRoleBadge(user.role).color}`}>
                      {getRoleBadge(user.role).icon}
                      <span className="ml-1">{getRoleBadge(user.role).text}</span>
                    </span>
                    {user.emailVerified && (
                      <BadgeCheck className="w-4 h-4 text-green-500" />
                    )}
                  </div>
                </div>
              </div>
              
              {user.businessInfo.companyName && (
                <div className="flex items-center text-sm text-muted-foreground mb-2">
                  <Building className="w-4 h-4 mr-2" />
                  <span className="truncate">{user.businessInfo.companyName}</span>
                </div>
              )}
              
              <div className="flex items-center text-sm text-muted-foreground">
                <Mail className="w-4 h-4 mr-2" />
                <span className="truncate">{user.email}</span>
              </div>
              
              {user.phone && (
                <div className="flex items-center text-sm text-muted-foreground mt-2">
                  <Phone className="w-4 h-4 mr-2" />
                  <span>{user.phone}</span>
                </div>
              )}
              
              {user.address && (
                <div className="flex items-center text-sm text-muted-foreground mt-2">
                  <MapPin className="w-4 h-4 mr-2" />
                  <span className="truncate">{user.address}</span>
                </div>
              )}
              
              <div className="mt-3 text-xs text-muted-foreground">
                Dernière connexion: {formatDate(user.lastLogin)}
              </div>
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {menuItems.map((item) => {
              const active = isActiveItem(item.href);
              return (
                <button
                  key={item.href}
                  onClick={() => {
                    navigate(item.href);
                    setSidebarOpen(false);
                  }}
                  className={`flex items-center space-x-3 w-full px-4 py-3 rounded-xl transition-all duration-300 group ${
                    active
                      ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50 hover:shadow-sm'
                  }`}
                >
                  <item.icon className={`w-5 h-5 transition-transform duration-300 ${
                    !active ? 'group-hover:scale-110' : ''
                  }`} />
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Bottom actions */}
          <div className="p-4 border-t border-border/20 space-y-1">
            <button
              onClick={() => {
                navigate('/dashboard/settings');
                setSidebarOpen(false);
              }}
              className={`flex items-center space-x-3 w-full px-4 py-3 rounded-xl transition-all duration-300 group ${
                isActiveItem('/dashboard/settings')
                  ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50 hover:shadow-sm'
              }`}
            >
              <Settings className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
              <span className="font-medium">Paramètres</span>
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-3 w-full px-4 py-3 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all duration-300 group"
            >
              <LogOut className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
              <span className="font-medium">Déconnexion</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:ml-64">
        {/* Top bar */}
        <div className="bg-background/95 backdrop-blur-xl border-b border-border/20 px-6 py-4 shadow-sm">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl hover:bg-muted/50 transition-all duration-300 hover:shadow-sm"
            >
              <Menu className="w-5 h-5" />
            </button>
            
            {user && (
              <div className="flex items-center space-x-4">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-semibold text-foreground">{user.name}</p>
                  <div className="flex items-center justify-end space-x-1 mt-1">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${getRoleBadge(user.role).color}`}>
                      {getRoleBadge(user.role).icon}
                      <span className="ml-1">{getRoleBadge(user.role).text}</span>
                    </span>
                    {user.emailVerified && (
                      <BadgeCheck className="w-4 h-4 text-green-500" />
                    )}
                  </div>
                </div>
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center shadow-lg">
                  {user.avatar ? (
                    <img 
                      src={user.avatar} 
                      alt={user.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-primary-foreground font-medium">
                      {getUserInitials(user.name)}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Page content */}
        <main className="p-6 min-h-screen bg-gradient-to-br from-luxury-ivory/50 via-background/50 to-luxury-beige/50">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;