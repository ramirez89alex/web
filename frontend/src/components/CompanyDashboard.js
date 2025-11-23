import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback } from './ui/avatar';
import { useAuth } from '../App';
import ServiceRequestFlow from './ServiceRequestFlow';
import {
  Users,
  Star,
  Building,
  MapPin,
  Mail,
  Phone,
  Briefcase,
  TrendingUp,
  Search,
  MessageSquare,
  Plus,
  Eye,
  Bell,
  CheckCircle
} from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function CompanyDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [professionals, setProfessionals] = useState([]);
  const [myReviews, setMyReviews] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      // Fetch company profile
      const profileRes = await axios.get(`${API}/users/me`, config);
      setProfile(profileRes.data);

      // Fetch all professionals
      const professionalsRes = await axios.get(`${API}/professionals`);
      setProfessionals(professionalsRes.data);

      // Fetch reviews made by this company
      const reviewsRes = await axios.get(`${API}/reviews`);
      const companyReviews = reviewsRes.data.filter(
        review => review.reviewer_user_id === user?.id
      );
      setMyReviews(companyReviews);

      // Fetch sent service requests
      const requestsRes = await axios.get(`${API}/service-requests/sent`, config);
      setSentRequests(requestsRes.data);
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
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

  const getTopProfessionals = () => {
    return professionals
      .sort((a, b) => (b.average_rating || 0) - (a.average_rating || 0))
      .slice(0, 5);
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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Panel de {profile?.company_name || 'Empresa'}
          </h1>
          <p className="text-gray-600">
            Encuentra y conecta con los mejores profesionales IQX
          </p>
        </div>

        {/* Company Profile Card */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <Avatar className="h-24 w-24">
                <AvatarFallback className="bg-green-600 text-white text-2xl">
                  {getInitials(profile?.company_name || profile?.full_name)}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <div className="mb-4">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {profile?.company_name || profile?.full_name}
                  </h2>
                  <p className="text-gray-600 flex items-center mt-1">
                    <Building className="h-4 w-4 mr-1" />
                    {profile?.company_type} - {profile?.size}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center text-gray-700">
                    <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                    <span className="text-sm">{profile?.location}</span>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <Mail className="h-4 w-4 mr-2 text-gray-400" />
                    <span className="text-sm">{profile?.email}</span>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <Phone className="h-4 w-4 mr-2 text-gray-400" />
                    <span className="text-sm">{profile?.phone}</span>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <MessageSquare className="h-4 w-4 mr-2 text-gray-400" />
                    <span className="text-sm">{myReviews.length} reseñas dadas</span>
                  </div>
                </div>

                {profile?.description && (
                  <p className="text-sm text-gray-600 mt-4">{profile.description}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Profesionales Disponibles</CardTitle>
              <Users className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{professionals.length}</div>
              <p className="text-xs opacity-80">
                En toda la plataforma
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Reseñas Realizadas</CardTitle>
              <Star className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{myReviews.length}</div>
              <p className="text-xs opacity-80">
                Profesionales calificados
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conexiones Activas</CardTitle>
              <TrendingUp className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">15</div>
              <p className="text-xs opacity-80">
                +5 este mes
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Acciones Rápidas</CardTitle>
            <CardDescription>Accede a las funcionalidades principales</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button 
                className="h-20 flex flex-col items-center justify-center space-y-2 bg-blue-600 hover:bg-blue-700"
                onClick={() => navigate('/professionals')}
              >
                <Search className="h-6 w-6" />
                <span>Buscar Profesionales</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-20 flex flex-col items-center justify-center space-y-2"
                onClick={() => navigate('/professionals')}
              >
                <Users className="h-6 w-6" />
                <span>Ver Todos los Profesionales</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-20 flex flex-col items-center justify-center space-y-2"
              >
                <Plus className="h-6 w-6" />
                <span>Publicar Solicitud</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Approved Requests - Payment & Details Flow */}
        {sentRequests.filter(req => req.status === 'approved').length > 0 && (
          <Card className="mb-8 border-green-500 border-2">
            <CardHeader className="bg-green-50">
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-green-600 animate-pulse" />
                <CardTitle className="text-green-900">
                  Solicitudes Aprobadas ({sentRequests.filter(req => req.status === 'approved').length})
                </CardTitle>
              </div>
              <CardDescription>
                Procede con el pago y envía los detalles del servicio
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {sentRequests
                  .filter(req => req.status === 'approved')
                  .map((request) => (
                    <ServiceRequestFlow 
                      key={request.id} 
                      request={request} 
                      onUpdate={fetchDashboardData}
                    />
                  ))}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Top Professionals */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Mejores Profesionales</CardTitle>
                  <CardDescription>
                    Los profesionales mejor calificados
                  </CardDescription>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigate('/professionals')}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Ver todos
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {getTopProfessionals().map((professional) => (
                  <div 
                    key={professional.id} 
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => navigate('/professionals')}
                  >
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-blue-600 text-white">
                          {getInitials(professional.full_name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-gray-900">{professional.full_name}</p>
                        <p className="text-sm text-gray-500 flex items-center">
                          <MapPin className="h-3 w-3 mr-1" />
                          {professional.location}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center space-x-1 mb-1">
                        {renderStars(Math.floor(professional.average_rating || 0))}
                        <span className="text-sm text-gray-600">
                          {professional.average_rating?.toFixed(1) || '0.0'}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1 justify-end">
                        {professional.specialties?.slice(0, 2).map((specialty, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {specialty}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
                {getTopProfessionals().length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No hay profesionales registrados aún</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* My Reviews */}
          <Card>
            <CardHeader>
              <CardTitle>Mis Reseñas</CardTitle>
              <CardDescription>
                Reseñas que has dado a profesionales
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {myReviews.slice(0, 5).map((review) => (
                  <div key={review.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900">
                        Profesional calificado
                      </span>
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
                {myReviews.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Aún no has dado reseñas</p>
                    <p className="text-xs mt-2">
                      Busca profesionales y califica tu experiencia con ellos
                    </p>
                    <Button 
                      className="mt-4"
                      onClick={() => navigate('/professionals')}
                    >
                      Buscar Profesionales
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Services Offered */}
        {profile?.services_offered && profile.services_offered.length > 0 && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Servicios que Ofrecemos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {profile.services_offered.map((service, index) => (
                  <Badge key={index} variant="secondary" className="text-sm py-2 px-4">
                    <Briefcase className="h-4 w-4 mr-2" />
                    {service}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

export default CompanyDashboard;
