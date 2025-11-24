import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { useAuth } from '../App';
import { toast } from 'sonner';
import {
  User,
  Mail,
  Phone,
  Lock,
  Bell,
  Shield,
  Save
} from 'lucide-react';

function Settings() {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  
  const [profileData, setProfileData] = useState({
    full_name: user?.full_name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    location: user?.location || ''
  });

  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });

  const [notifications, setNotifications] = useState({
    email_notifications: true,
    service_requests: true,
    payment_updates: true,
    reviews: true
  });

  const handleUpdateProfile = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Perfil actualizado exitosamente');
      updateUser(profileData);
    } catch (error) {
      toast.error('Error al actualizar el perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.new_password !== passwordData.confirm_password) {
      toast.error('Las contraseñas no coinciden');
      return;
    }
    
    if (passwordData.new_password.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Contraseña actualizada exitosamente');
      setPasswordData({
        current_password: '',
        new_password: '',
        confirm_password: ''
      });
    } catch (error) {
      toast.error('Error al cambiar la contraseña');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Configuración
          </h1>
          <p className="text-gray-600">
            Gestiona tu cuenta y preferencias
          </p>
        </div>

        <div className="space-y-6">
          {/* Profile Information */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <User className="h-5 w-5 text-blue-600" />
                <CardTitle>Información Personal</CardTitle>
              </div>
              <CardDescription>
                Actualiza tu información de perfil
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nombre Completo</Label>
                  <Input
                    value={profileData.full_name}
                    onChange={(e) => setProfileData({...profileData, full_name: e.target.value})}
                    placeholder="Tu nombre completo"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Teléfono</Label>
                  <Input
                    value={profileData.phone}
                    onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                    placeholder="+57 300 123 4567"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Correo Electrónico</Label>
                <Input
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                  placeholder="tu@email.com"
                />
              </div>

              <div className="space-y-2">
                <Label>Ubicación</Label>
                <Input
                  value={profileData.location}
                  onChange={(e) => setProfileData({...profileData, location: e.target.value})}
                  placeholder="Ciudad, País"
                />
              </div>

              <Button
                onClick={handleUpdateProfile}
                disabled={loading}
                className="w-full md:w-auto"
              >
                <Save className="h-4 w-4 mr-2" />
                {loading ? 'Guardando...' : 'Guardar Cambios'}
              </Button>
            </CardContent>
          </Card>

          {/* Security Settings */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Lock className="h-5 w-5 text-blue-600" />
                <CardTitle>Seguridad</CardTitle>
              </div>
              <CardDescription>
                Cambia tu contraseña y gestiona la seguridad de tu cuenta
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Contraseña Actual</Label>
                <Input
                  type="password"
                  value={passwordData.current_password}
                  onChange={(e) => setPasswordData({...passwordData, current_password: e.target.value})}
                  placeholder="••••••••"
                />
              </div>

              <div className="space-y-2">
                <Label>Nueva Contraseña</Label>
                <Input
                  type="password"
                  value={passwordData.new_password}
                  onChange={(e) => setPasswordData({...passwordData, new_password: e.target.value})}
                  placeholder="••••••••"
                />
              </div>

              <div className="space-y-2">
                <Label>Confirmar Nueva Contraseña</Label>
                <Input
                  type="password"
                  value={passwordData.confirm_password}
                  onChange={(e) => setPasswordData({...passwordData, confirm_password: e.target.value})}
                  placeholder="••••••••"
                />
              </div>

              <Button
                onClick={handleChangePassword}
                disabled={loading}
                variant="outline"
                className="w-full md:w-auto"
              >
                <Shield className="h-4 w-4 mr-2" />
                Cambiar Contraseña
              </Button>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Bell className="h-5 w-5 text-blue-600" />
                <CardTitle>Notificaciones</CardTitle>
              </div>
              <CardDescription>
                Configura cómo quieres recibir notificaciones
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Notificaciones por Email</Label>
                  <p className="text-sm text-gray-500">
                    Recibe actualizaciones importantes por correo
                  </p>
                </div>
                <Switch
                  checked={notifications.email_notifications}
                  onCheckedChange={(checked) => 
                    setNotifications({...notifications, email_notifications: checked})
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Solicitudes de Servicio</Label>
                  <p className="text-sm text-gray-500">
                    Notificar cuando recibas nuevas solicitudes
                  </p>
                </div>
                <Switch
                  checked={notifications.service_requests}
                  onCheckedChange={(checked) => 
                    setNotifications({...notifications, service_requests: checked})
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Actualizaciones de Pago</Label>
                  <p className="text-sm text-gray-500">
                    Notificar sobre transacciones y pagos
                  </p>
                </div>
                <Switch
                  checked={notifications.payment_updates}
                  onCheckedChange={(checked) => 
                    setNotifications({...notifications, payment_updates: checked})
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Reseñas y Calificaciones</Label>
                  <p className="text-sm text-gray-500">
                    Notificar cuando recibas nuevas reseñas
                  </p>
                </div>
                <Switch
                  checked={notifications.reviews}
                  onCheckedChange={(checked) => 
                    setNotifications({...notifications, reviews: checked})
                  }
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default Settings;
