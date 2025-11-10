import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { useAuth } from '../App';
import {
  Users,
  Star,
  Clock,
  MapPin,
  Briefcase,
  TrendingUp,
  Eye,
  MessageSquare,
  Plus,
  Filter
} from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalProfessionals: 0,
    totalReviews: 0,
    averageRating: 0,
    activeRequests: 0
  });
  const [recentProfessionals, setRecentProfessionals] = useState([]);
  const [recentReviews, setRecentReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [professionalsRes, reviewsRes] = await Promise.all([
        axios.get(`${API}/professionals`),
        axios.get(`${API}/reviews`)
      ]);

      const professionals = professionalsRes.data;
      const reviews = reviewsRes.data;

      // Calculate stats
      const totalReviews = reviews.length;
      const averageRating = totalReviews > 0 
        ? reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews 
        : 0;

      setStats({
        totalProfessionals: professionals.length,
        totalReviews,
        averageRating: averageRating.toFixed(1),
        activeRequests: 12 // Mock data for now
      });

      setRecentProfessionals(professionals.slice(0, 5));
      setRecentReviews(reviews.slice(0, 5));
      
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'busy':
        return 'bg-yellow-100 text-yellow-800';
      case 'unavailable':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'available':
        return 'Disponible';
      case 'busy':
        return 'Ocupado';
      case 'unavailable':
        return 'No disponible';
      default:
        return 'Desconocido';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8" data-testid="dashboard">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            ¡Bienvenido, {user?.full_name}!
          </h1>
          <p className="text-gray-600">
            {user?.user_type === 'professional' && 'Gestiona tu perfil profesional y conecta con oportunidades'}
            {user?.user_type === 'company' && 'Encuentra los mejores profesionales IQX para tu equipo'}
            {user?.user_type === 'supplier' && 'Conecta con empresas y profesionales del sector médico'}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Profesionales Activos</CardTitle>
              <Users className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalProfessionals}</div>
              <p className="text-xs opacity-80">
                +12% desde el mes pasado
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Calificación Promedio</CardTitle>
              <Star className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.averageRating}</div>
              <p className="text-xs opacity-80">
                Basado en {stats.totalReviews} reseñas
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Solicitudes Activas</CardTitle>
              <Clock className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeRequests}</div>
              <p className="text-xs opacity-80">
                +3 nuevas esta semana
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conexiones</CardTitle>
              <TrendingUp className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">89</div>
              <p className="text-xs opacity-80">
                +23% este mes
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Professionals */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Profesionales Recientes</CardTitle>
                  <CardDescription>
                    Últimos profesionales registrados en la plataforma
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4 mr-2" />
                  Ver todos
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentProfessionals.map((professional) => (
                  <div key={professional.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className="bg-blue-100 p-2 rounded-full">
                        <Users className="h-4 w-4 text-blue-600" />
                      </div>
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
                        {renderStars(Math.floor(professional.average_rating))}
                        <span className="text-sm text-gray-600">({professional.total_reviews})</span>
                      </div>
                      <Badge className={getStatusColor(professional.availability_status)}>
                        {getStatusText(professional.availability_status)}
                      </Badge>
                    </div>
                  </div>
                ))}
                {recentProfessionals.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No hay profesionales registrados aún</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Reviews */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Reseñas Recientes</CardTitle>
                  <CardDescription>
                    Últimas calificaciones y comentarios
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Ver todas
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentReviews.map((review) => (
                  <div key={review.id} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-gray-900">{review.reviewer_name}</span>
                        <Badge variant="secondary">{review.reviewer_type}</Badge>
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
                {recentReviews.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No hay reseñas disponibles aún</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Acciones Rápidas</CardTitle>
            <CardDescription>Accede rápidamente a las funcionalidades principales</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {user?.user_type === 'professional' && (
                <>
                  <Button className="h-20 flex flex-col items-center justify-center space-y-2 bg-blue-600 hover:bg-blue-700">
                    <Plus className="h-6 w-6" />
                    <span>Actualizar Perfil</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2">
                    <Briefcase className="h-6 w-6" />
                    <span>Ver Oportunidades</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2">
                    <MessageSquare className="h-6 w-6" />
                    <span>Mensajes</span>
                  </Button>
                </>
              )}
              
              {user?.user_type === 'company' && (
                <>
                  <Button className="h-20 flex flex-col items-center justify-center space-y-2 bg-green-600 hover:bg-green-700">
                    <Plus className="h-6 w-6" />
                    <span>Publicar Solicitud</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2">
                    <Filter className="h-6 w-6" />
                    <span>Buscar Profesionales</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2">
                    <Users className="h-6 w-6" />
                    <span>Gestionar Equipo</span>
                  </Button>
                </>
              )}
              
              {user?.user_type === 'supplier' && (
                <>
                  <Button className="h-20 flex flex-col items-center justify-center space-y-2 bg-purple-600 hover:bg-purple-700">
                    <Plus className="h-6 w-6" />
                    <span>Añadir Productos</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2">
                    <TrendingUp className="h-6 w-6" />
                    <span>Ver Estadísticas</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2">
                    <MessageSquare className="h-6 w-6" />
                    <span>Contactar Clientes</span>
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default Dashboard;
