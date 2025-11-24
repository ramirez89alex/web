import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { useAuth } from '../App';
import {
  Stethoscope,
  Home,
  Users,
  User,
  Search,
  MessageSquare,
  Settings,
  LogOut,
  Bell
} from 'lucide-react';

function Navigation() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getInitials = (name) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';
  };

  const getUserTypeIcon = (userType) => {
    switch (userType) {
      case 'professional':
        return <Stethoscope className="h-4 w-4" />;
      case 'company':
        return <Users className="h-4 w-4" />;
      case 'supplier':
        return <Settings className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  const getUserTypeLabel = (userType) => {
    switch (userType) {
      case 'professional':
        return 'Profesional IQX';
      case 'company':
        return 'Empresa';
      case 'supplier':
        return 'Proveedor';
      default:
        return 'Usuario';
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link to="/dashboard" className="flex items-center space-x-2">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Stethoscope className="h-6 w-6 text-white" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold text-gray-900">IQX Profesionales</h1>
                <p className="text-xs text-gray-500">Conectando talento médico</p>
              </div>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-1">
            <Link to="/dashboard">
              <Button
                variant={isActive('/dashboard') ? 'default' : 'ghost'}
                className="flex items-center space-x-2"
                data-testid="nav-dashboard"
              >
                <Home className="h-4 w-4" />
                <span>Dashboard</span>
              </Button>
            </Link>
            
            <Link to="/professionals">
              <Button
                variant={isActive('/professionals') ? 'default' : 'ghost'}
                className="flex items-center space-x-2"
                data-testid="nav-professionals"
              >
                <Search className="h-4 w-4" />
                <span>Buscar Profesionales</span>
              </Button>
            </Link>
            
            <Link to="/profile">
              <Button
                variant={isActive('/profile') ? 'default' : 'ghost'}
                className="flex items-center space-x-2"
                data-testid="nav-profile"
              >
                <User className="h-4 w-4" />
                <span>Mi Perfil</span>
              </Button>
            </Link>
          </div>

          {/* Right side - Notifications and User Menu */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <Link to="/notifications">
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                  3
                </span>
              </Button>
            </Link>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.profile_image} alt={user?.full_name} />
                    <AvatarFallback className="bg-blue-600 text-white text-sm">
                      {getInitials(user?.full_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-medium text-gray-700 truncate max-w-32">
                      {user?.full_name}
                    </p>
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      {getUserTypeIcon(user?.user_type)}
                      {getUserTypeLabel(user?.user_type)}
                    </p>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
                <DropdownMenuSeparator />
                
                <DropdownMenuItem asChild>
                  <Link to="/profile" className="flex items-center">
                    <User className="mr-2 h-4 w-4" />
                    <span>Perfil</span>
                  </Link>
                </DropdownMenuItem>
                
                <DropdownMenuItem>
                  <MessageSquare className="mr-2 h-4 w-4" />
                  <span>Mensajes</span>
                </DropdownMenuItem>
                
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Configuración</span>
                </DropdownMenuItem>
                
                <DropdownMenuSeparator />
                
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-red-600 focus:text-red-600"
                  data-testid="logout-button"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Cerrar Sesión</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden border-t border-gray-200">
        <div className="px-2 py-3 space-y-1">
          <Link to="/dashboard">
            <Button
              variant={isActive('/dashboard') ? 'default' : 'ghost'}
              className="w-full justify-start flex items-center space-x-2"
            >
              <Home className="h-4 w-4" />
              <span>Dashboard</span>
            </Button>
          </Link>
          
          <Link to="/professionals">
            <Button
              variant={isActive('/professionals') ? 'default' : 'ghost'}
              className="w-full justify-start flex items-center space-x-2"
            >
              <Search className="h-4 w-4" />
              <span>Buscar Profesionales</span>
            </Button>
          </Link>
          
          <Link to="/profile">
            <Button
              variant={isActive('/profile') ? 'default' : 'ghost'}
              className="w-full justify-start flex items-center space-x-2"
            >
              <User className="h-4 w-4" />
              <span>Mi Perfil</span>
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default Navigation;
