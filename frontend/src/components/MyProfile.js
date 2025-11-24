import React from 'react';
import { useAuth } from '../App';
import ProfessionalDashboard from './ProfessionalDashboard';
import CompanyDashboard from './CompanyDashboard';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Settings,
  Edit
} from 'lucide-react';

function MyProfile() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const getInitials = (name) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';
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

  // If professional, show their professional dashboard
  if (user?.user_type === 'professional') {
    return <ProfessionalDashboard />;
  }

  // If company, show their company dashboard
  if (user?.user_type === 'company') {
    return <CompanyDashboard />;
  }

  // Default profile view for suppliers or other types
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Mi Perfil
          </h1>
          <p className="text-gray-600">
            Información de tu cuenta
          </p>
        </div>

        {/* Profile Card */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Información Personal</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/settings')}
              >
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-start space-x-6">
              <Avatar className="h-24 w-24">
                <AvatarFallback className="bg-blue-600 text-white text-2xl">
                  {getInitials(user?.full_name)}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-1">
                  {user?.full_name}
                </h2>
                <Badge variant="secondary" className="mb-4">
                  {getUserTypeLabel(user?.user_type)}
                </Badge>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div className="flex items-center text-gray-700">
                    <Mail className="h-4 w-4 mr-3 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Email</p>
                      <p className="text-sm font-medium">{user?.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center text-gray-700">
                    <Phone className="h-4 w-4 mr-3 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Teléfono</p>
                      <p className="text-sm font-medium">{user?.phone}</p>
                    </div>
                  </div>

                  <div className="flex items-center text-gray-700">
                    <MapPin className="h-4 w-4 mr-3 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Ubicación</p>
                      <p className="text-sm font-medium">{user?.location}</p>
                    </div>
                  </div>

                  <div className="flex items-center text-gray-700">
                    <Briefcase className="h-4 w-4 mr-3 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Tipo de Cuenta</p>
                      <p className="text-sm font-medium">{getUserTypeLabel(user?.user_type)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/settings')}>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <div className="p-3 bg-blue-100 rounded-full mb-3">
                  <Settings className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Configuración</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Gestiona tu cuenta y preferencias
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/dashboard')}>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <div className="p-3 bg-green-100 rounded-full mb-3">
                  <Briefcase className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Dashboard</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Ver tu panel principal
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/messages')}>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <div className="p-3 bg-purple-100 rounded-full mb-3">
                  <Mail className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Mensajes</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Ver tus conversaciones
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default MyProfile;
