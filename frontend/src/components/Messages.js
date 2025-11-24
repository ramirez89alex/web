import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Input } from './ui/input';
import { useAuth } from '../App';
import {
  MessageSquare,
  Send,
  Search,
  Clock
} from 'lucide-react';

function Messages() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  // Placeholder messages
  const messages = [
    {
      id: 1,
      sender: 'Hospital San José',
      preview: 'Hola, estamos interesados en tus servicios...',
      timestamp: '2 horas',
      unread: true
    },
    {
      id: 2,
      sender: 'Clínica del Country',
      preview: 'Gracias por tu excelente trabajo en la cirugía...',
      timestamp: '1 día',
      unread: false
    }
  ];

  const getInitials = (name) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Mensajes
          </h1>
          <p className="text-gray-600">
            Comunícate con empresas y profesionales
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Messages List */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Conversaciones</CardTitle>
              <div className="mt-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Buscar mensajes..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`p-4 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${
                      message.unread ? 'bg-blue-50 border border-blue-200' : 'border border-gray-200'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-blue-600 text-white">
                          {getInitials(message.sender)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-medium text-gray-900 truncate">
                            {message.sender}
                          </p>
                          {message.unread && (
                            <Badge className="bg-blue-600 text-white">Nuevo</Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 truncate">
                          {message.preview}
                        </p>
                        <div className="flex items-center mt-1 text-xs text-gray-500">
                          <Clock className="h-3 w-3 mr-1" />
                          {message.timestamp}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Message View */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Selecciona una conversación</CardTitle>
              <CardDescription>
                Tus mensajes aparecerán aquí
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                <MessageSquare className="h-16 w-16 mb-4 opacity-50" />
                <p className="text-lg font-medium">No hay conversación seleccionada</p>
                <p className="text-sm mt-2">Selecciona un mensaje de la lista para comenzar</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Info Card */}
        <Card className="mt-8 border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex items-start space-x-3">
              <MessageSquare className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <p className="font-medium text-blue-900">Sistema de mensajería</p>
                <p className="text-sm text-blue-700 mt-1">
                  La funcionalidad completa de mensajería estará disponible próximamente. 
                  Por ahora, las comunicaciones se realizan mediante los datos de contacto 
                  compartidos después de aprobar una solicitud de servicio.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default Messages;
