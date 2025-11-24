import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback } from './ui/avatar';
import { useAuth } from '../App';
import {
  Bell,
  CheckCircle,
  Clock,
  CreditCard,
  Star,
  Briefcase,
  AlertCircle,
  Trash2
} from 'lucide-react';

function Notifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'service_request',
      title: 'Nueva Solicitud de Servicio',
      message: 'Hospital San José está interesado en contratar tus servicios',
      time: '5 min',
      read: false,
      icon: Briefcase,
      color: 'blue'
    },
    {
      id: 2,
      type: 'payment',
      title: 'Pago Recibido',
      message: 'Se ha recibido un pago de $500,000 COP',
      time: '2 horas',
      read: false,
      icon: CreditCard,
      color: 'green'
    },
    {
      id: 3,
      type: 'review',
      title: 'Nueva Reseña',
      message: 'Clínica del Country te ha dejado una reseña de 5 estrellas',
      time: '1 día',
      read: true,
      icon: Star,
      color: 'yellow'
    },
    {
      id: 4,
      type: 'service_approved',
      title: 'Solicitud Aprobada',
      message: 'Tu solicitud de servicio ha sido aprobada por Hospital San Ignacio',
      time: '2 días',
      read: true,
      icon: CheckCircle,
      color: 'green'
    },
    {
      id: 5,
      type: 'reminder',
      title: 'Recordatorio de Servicio',
      message: 'Tienes una cirugía programada mañana a las 8:00 AM',
      time: '3 días',
      read: true,
      icon: Clock,
      color: 'orange'
    }
  ]);

  const handleMarkAsRead = (notificationId) => {
    setNotifications(notifications.map(notif => 
      notif.id === notificationId ? { ...notif, read: true } : notif
    ));
  };

  const handleMarkAllAsRead = () => {
    setNotifications(notifications.map(notif => ({ ...notif, read: true })));
  };

  const handleDelete = (notificationId) => {
    setNotifications(notifications.filter(notif => notif.id !== notificationId));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const getIconColor = (color) => {
    const colors = {
      blue: 'text-blue-600 bg-blue-100',
      green: 'text-green-600 bg-green-100',
      yellow: 'text-yellow-600 bg-yellow-100',
      orange: 'text-orange-600 bg-orange-100',
      red: 'text-red-600 bg-red-100'
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Notificaciones
              </h1>
              <p className="text-gray-600">
                {unreadCount > 0 
                  ? `Tienes ${unreadCount} notificación${unreadCount !== 1 ? 'es' : ''} sin leer`
                  : 'No tienes notificaciones sin leer'
                }
              </p>
            </div>
            {unreadCount > 0 && (
              <Button
                variant="outline"
                onClick={handleMarkAllAsRead}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Marcar todas como leídas
              </Button>
            )}
          </div>
        </div>

        {/* Notifications List */}
        <div className="space-y-3">
          {notifications.length === 0 ? (
            <Card>
              <CardContent className="py-12">
                <div className="flex flex-col items-center justify-center text-gray-500">
                  <Bell className="h-16 w-16 mb-4 opacity-50" />
                  <p className="text-lg font-medium">No tienes notificaciones</p>
                  <p className="text-sm mt-2">Cuando recibas notificaciones aparecerán aquí</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            notifications.map((notification) => {
              const Icon = notification.icon;
              return (
                <Card
                  key={notification.id}
                  className={`transition-all hover:shadow-md cursor-pointer ${
                    !notification.read ? 'border-l-4 border-l-blue-500 bg-blue-50' : ''
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-4">
                      {/* Icon */}
                      <div className={`p-3 rounded-full ${getIconColor(notification.color)}`}>
                        <Icon className="h-5 w-5" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-1">
                          <div className="flex items-center space-x-2">
                            <h3 className="font-semibold text-gray-900">
                              {notification.title}
                            </h3>
                            {!notification.read && (
                              <Badge className="bg-blue-600 text-white text-xs">
                                Nuevo
                              </Badge>
                            )}
                          </div>
                          <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                            {notification.time}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">
                          {notification.message}
                        </p>

                        {/* Actions */}
                        <div className="flex items-center space-x-2">
                          {!notification.read && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleMarkAsRead(notification.id)}
                            >
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Marcar como leída
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleDelete(notification.id)}
                          >
                            <Trash2 className="h-3 w-3 mr-1" />
                            Eliminar
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>

        {/* Info Card */}
        {notifications.length > 0 && (
          <Card className="mt-8 border-blue-200 bg-blue-50">
            <CardContent className="pt-6">
              <div className="flex items-start space-x-3">
                <Bell className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="font-medium text-blue-900">Gestión de notificaciones</p>
                  <p className="text-sm text-blue-700 mt-1">
                    Puedes configurar tus preferencias de notificaciones en la sección de Configuración.
                    También puedes desactivar notificaciones específicas según tus necesidades.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

export default Notifications;
