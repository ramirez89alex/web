import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useAuth } from '../App';
import { toast } from 'sonner';
import {
  Star,
  Clock,
  MapPin,
  Mail,
  Phone,
  Award,
  Briefcase,
  DollarSign,
  MessageSquare,
  TrendingUp,
  Edit,
  Bell,
  CheckCircle,
  XCircle,
  Building
} from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function ProfessionalDashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [serviceRequests, setServiceRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingAvailability, setEditingAvailability] = useState(false);
  const [newAvailability, setNewAvailability] = useState('available');

  useEffect(() => {
    if (user) {
      fetchProfileData();
    }
  }, [user]);

  const fetchProfileData = async () => {
    try {
      setError(null);
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No se encontró el token de autenticación');
      }
      
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      // Fetch professional profile
      const profileRes = await axios.get(`${API}/users/me`, config);
      setProfile(profileRes.data);
      setNewAvailability(profileRes.data.availability_status || 'available');

      // Fetch reviews for this professional
      const reviewsRes = await axios.get(`${API}/reviews`);
      const myReviews = reviewsRes.data.filter(
        review => review.reviewed_user_id === user?.id
      );
      setReviews(myReviews);

      // Fetch service requests
      try {
        const serviceRequestsRes = await axios.get(`${API}/service-requests/received`, config);
        setServiceRequests(serviceRequestsRes.data);
      } catch (err) {
        // Service requests might fail if user is not a professional, ignore
        console.log('Could not fetch service requests:', err);
      }
      
    } catch (error) {
      console.error('Error fetching profile data:', error);
      setError(error.response?.data?.detail || error.message || 'Error al cargar el perfil');
      toast.error('Error al cargar el perfil. Por favor, intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const updateAvailability = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        `${API}/professionals/${profile.id}/availability`,
        { status: newAvailability },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setProfile({ ...profile, availability_status: newAvailability });
      setEditingAvailability(false);
    } catch (error) {
      console.error('Error updating availability:', error);
    }
  };

  const handleServiceRequest = async (requestId, status) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        `${API}/service-requests/${requestId}`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      toast.success(
        status === 'approved' 
          ? 'Solicitud aprobada. La empresa ahora puede contactarte.'
          : 'Solicitud rechazada.'
      );
      
      // Refresh service requests
      fetchProfileData();
    } catch (error) {
      console.error('Error updating service request:', error);
      toast.error('Error al actualizar la solicitud');
    }
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  const getInitials = (name) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';
  };

  const getStatusBadge = (status) => {
    const variants = {
      available: 'bg-green-100 text-green-800',
      busy: 'bg-yellow-100 text-yellow-800',
      unavailable: 'bg-red-100 text-red-800'
    };
    const texts = {
      available: 'Disponible',
      busy: 'Ocupado',
      unavailable: 'No disponible'
    };
    return (
      <Badge className={variants[status] || variants.available}>
        {texts[status] || 'Disponible'}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-6">
            <div className="h-64 bg-gray-200 rounded-lg"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-center py-12">
            <div className="bg-red-50 border border-red-200 rounded-lg p-8 max-w-md">
              <div className="flex items-center justify-center mb-4">
                <div className="bg-red-100 p-3 rounded-full">
                  <MessageSquare className="h-8 w-8 text-red-600" />
                </div>
              </div>
              <h2 className="text-xl font-semibold text-red-900 text-center mb-2">
                Error al cargar el perfil
              </h2>
              <p className="text-sm text-red-700 text-center mb-4">
                {error}
              </p>
              <Button
                onClick={() => {
                  setError(null);
                  setLoading(true);
                  fetchProfileData();
                }}
                className="w-full bg-red-600 hover:bg-red-700"
              >
                Intentar de nuevo
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Mi Perfil Profesional
          </h1>
          <p className="text-gray-600">
            Gestiona tu información y revisa tu desempeño en la plataforma
          </p>
        </div>

        {/* Profile Card */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <Avatar className="h-24 w-24">
                <AvatarImage src={profile?.profile_image} alt={profile?.full_name} />
                <AvatarFallback className="bg-blue-600 text-white text-2xl">
                  {getInitials(profile?.full_name)}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{profile?.full_name}</h2>
                    <p className="text-gray-600 flex items-center mt-1">
                      <MapPin className="h-4 w-4 mr-1" />
                      {profile?.location}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    {editingAvailability ? (
                      <div className="flex items-center gap-2">
                        <Select value={newAvailability} onValueChange={setNewAvailability}>
                          <SelectTrigger className="w-40">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="available">Disponible</SelectItem>
                            <SelectItem value="busy">Ocupado</SelectItem>
                            <SelectItem value="unavailable">No disponible</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button size="sm" onClick={updateAvailability}>Guardar</Button>
                        <Button size="sm" variant="outline" onClick={() => setEditingAvailability(false)}>
                          Cancelar
                        </Button>
                      </div>
                    ) : (
                      <>
                        {getStatusBadge(profile?.availability_status)}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingAvailability(true)}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Cambiar
                        </Button>
                      </>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center text-gray-700">
                    <Mail className="h-4 w-4 mr-2 text-gray-400" />
                    <span className="text-sm">{profile?.email}</span>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <Phone className="h-4 w-4 mr-2 text-gray-400" />
                    <span className="text-sm">{profile?.phone}</span>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <Clock className="h-4 w-4 mr-2 text-gray-400" />
                    <span className="text-sm">{profile?.experience_years} años de experiencia</span>
                  </div>
                  {profile?.hourly_rate && (
                    <div className="flex items-center text-gray-700">
                      <DollarSign className="h-4 w-4 mr-2 text-gray-400" />
                      <span className="text-sm">${profile?.hourly_rate?.toLocaleString()} COP/hora</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Service Requests Notifications */}
        {serviceRequests.filter(req => req.status === 'pending').length > 0 && (
          <Card className="mb-8 border-blue-500 border-2">
            <CardHeader className="bg-blue-50">
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-blue-600 animate-pulse" />
                <CardTitle className="text-blue-900">
                  Nuevas Solicitudes de Servicio ({serviceRequests.filter(req => req.status === 'pending').length})
                </CardTitle>
              </div>
              <CardDescription>
                Empresas interesadas en contratar tus servicios
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {serviceRequests
                  .filter(req => req.status === 'pending')
                  .slice(0, 3)
                  .map((request) => (
                    <div key={request.id} className="p-4 border rounded-lg bg-white">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback className="bg-green-600 text-white">
                              {request.company_name?.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-semibold text-gray-900">{request.company_name}</p>
                            {request.service_type && (
                              <Badge variant="secondary" className="mt-1">
                                {request.service_type}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                          Pendiente
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-gray-700 mb-4 bg-gray-50 p-3 rounded">
                        {request.message}
                      </p>
                      
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          className="flex-1 bg-green-600 hover:bg-green-700"
                          onClick={() => handleServiceRequest(request.id, 'approved')}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Aprobar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 text-red-600 border-red-600 hover:bg-red-50"
                          onClick={() => handleServiceRequest(request.id, 'rejected')}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Rechazar
                        </Button>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Calificación Promedio</CardTitle>
              <Star className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {profile?.average_rating?.toFixed(1) || '0.0'}
              </div>
              <p className="text-xs opacity-80">
                Basado en {profile?.total_reviews || 0} reseñas
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Reseñas</CardTitle>
              <MessageSquare className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{reviews.length}</div>
              <p className="text-xs opacity-80">
                Reseñas recibidas
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Visualizaciones</CardTitle>
              <TrendingUp className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">248</div>
              <p className="text-xs opacity-80">
                +32 esta semana
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Professional Info */}
          <Card>
            <CardHeader>
              <CardTitle>Información Profesional</CardTitle>
              <CardDescription>Detalles sobre tu perfil y experiencia</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Specialties */}
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Especialidades</h3>
                <div className="flex flex-wrap gap-2">
                  {profile?.specialties?.map((specialty, index) => (
                    <Badge key={index} variant="secondary">
                      {specialty}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Skills */}
              {profile?.skills && profile.skills.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Habilidades</h3>
                  <div className="flex flex-wrap gap-2">
                    {profile.skills.map((skill, index) => (
                      <Badge key={index} variant="outline">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Bio */}
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Biografía</h3>
                <p className="text-sm text-gray-700">
                  {profile?.bio || 'No hay biografía disponible'}
                </p>
              </div>

              {/* Education */}
              {profile?.education && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Educación</h3>
                  <div className="flex items-start">
                    <Award className="h-4 w-4 mr-2 text-gray-400 mt-0.5" />
                    <p className="text-sm text-gray-700">{profile.education}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Reviews */}
          <Card>
            <CardHeader>
              <CardTitle>Reseñas Recientes</CardTitle>
              <CardDescription>
                Lo que dicen de tu trabajo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reviews.slice(0, 5).map((review) => (
                  <div key={review.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-gray-900">{review.reviewer_name}</span>
                        <Badge variant="secondary" className="text-xs">{review.reviewer_type}</Badge>
                      </div>
                      <div className="flex items-center space-x-1">
                        {renderStars(review.rating)}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{review.comment}</p>
                    {review.collaboration_type && (
                      <Badge variant="outline" className="text-xs">
                        {review.collaboration_type}
                      </Badge>
                    )}
                  </div>
                ))}
                {reviews.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Aún no tienes reseñas</p>
                    <p className="text-xs mt-2">
                      Las empresas podrán calificarte después de trabajar contigo
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Service Requests History */}
        {serviceRequests.length > 0 && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Historial de Solicitudes</CardTitle>
              <CardDescription>
                Todas las solicitudes de servicio recibidas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {serviceRequests.map((request) => (
                  <div key={request.id} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-green-600 text-white">
                            {request.company_name?.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-gray-900">{request.company_name}</p>
                          {request.service_type && (
                            <Badge variant="secondary" className="text-xs mt-1">
                              {request.service_type}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <Badge
                        className={
                          request.status === 'approved'
                            ? 'bg-green-100 text-green-800'
                            : request.status === 'rejected'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }
                      >
                        {request.status === 'approved' && 'Aprobada'}
                        {request.status === 'rejected' && 'Rechazada'}
                        {request.status === 'pending' && 'Pendiente'}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-2">{request.message}</p>
                    
                    {request.status === 'approved' && (
                      <div className="mt-3 p-3 bg-green-50 rounded border border-green-200">
                        <p className="text-sm font-medium text-green-900 mb-2">
                          <Building className="h-4 w-4 inline mr-1" />
                          Datos de contacto:
                        </p>
                        <div className="space-y-1 text-sm text-green-800">
                          <p className="flex items-center">
                            <Mail className="h-3 w-3 mr-2" />
                            {request.company_email}
                          </p>
                          <p className="flex items-center">
                            <Phone className="h-3 w-3 mr-2" />
                            {request.company_phone}
                          </p>
                        </div>
                      </div>
                    )}
                    
                    {request.status === 'pending' && (
                      <div className="flex gap-2 mt-3">
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => handleServiceRequest(request.id, 'approved')}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Aprobar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 border-red-600 hover:bg-red-50"
                          onClick={() => handleServiceRequest(request.id, 'rejected')}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Rechazar
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

export default ProfessionalDashboard;
