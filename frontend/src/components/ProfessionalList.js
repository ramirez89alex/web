import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { useAuth } from '../App';
import { toast } from 'sonner';
import {
  Search,
  Filter,
  MapPin,
  Star,
  Clock,
  DollarSign,
  Mail,
  Phone,
  Award,
  Briefcase,
  Eye,
  MessageSquare,
  Users,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const SPECIALTIES = [
  "Ortopedia",
  "Columna",
  "Neurología",
  "Cirugía General",
  "Urología",
  "Otorrinolaringología",
  "Maxilofasial",
  "Biologicos",
  "laparoscopia y artroscopia"
];

function ProfessionalList() {
  const { user } = useAuth();
  const [professionals, setProfessionals] = useState([]);
  const [filteredProfessionals, setFilteredProfessionals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedProfessional, setSelectedProfessional] = useState(null);
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [reviewData, setReviewData] = useState({
    rating: 5,
    comment: '',
    collaboration_type: '',
    reviewer_name: user?.full_name || ''
  });
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    fetchProfessionals();
  }, []);

  useEffect(() => {
    filterProfessionals();
  }, [professionals, searchTerm, selectedSpecialty, selectedLocation]);

  const fetchProfessionals = async () => {
    try {
      const response = await axios.get(`${API}/professionals`);
      setProfessionals(response.data);
    } catch (error) {
      console.error('Error fetching professionals:', error);
      toast.error('Error al cargar los profesionales');
    } finally {
      setLoading(false);
    }
  };

  const filterProfessionals = () => {
    let filtered = professionals;

    // Search by name or bio
    if (searchTerm) {
      filtered = filtered.filter(prof => 
        prof.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prof.bio.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by specialty
    if (selectedSpecialty) {
      filtered = filtered.filter(prof => 
        prof.specialties.includes(selectedSpecialty)
      );
    }

    // Filter by location
    if (selectedLocation) {
      filtered = filtered.filter(prof => 
        prof.location.toLowerCase().includes(selectedLocation.toLowerCase())
      );
    }

    setFilteredProfessionals(filtered);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedSpecialty('');
    setSelectedLocation('');
  };

  const handleSubmitReview = async () => {
    if (!selectedProfessional || !reviewData.comment.trim()) {
      toast.error('Por favor completa todos los campos');
      return;
    }

    setSubmittingReview(true);
    
    try {
      await axios.post(`${API}/reviews`, {
        reviewed_user_id: selectedProfessional.id,
        reviewer_user_id: user.id,
        reviewer_name: reviewData.reviewer_name,
        reviewer_type: user.user_type,
        rating: reviewData.rating,
        comment: reviewData.comment,
        collaboration_type: reviewData.collaboration_type
      });

      toast.success('Reseña enviada correctamente');
      setShowReviewDialog(false);
      setReviewData({
        rating: 5,
        comment: '',
        collaboration_type: '',
        reviewer_name: user?.full_name || ''
      });
      
      // Refresh professionals to update ratings
      fetchProfessionals();
    } catch (error) {
      console.error('Error submitting review:', error);
      const message = error.response?.data?.detail || 'Error al enviar la reseña';
      toast.error(message);
    } finally {
      setSubmittingReview(false);
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="flex items-center space-x-4">
                    <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-24"></div>
                      <div className="h-3 bg-gray-200 rounded w-16"></div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-200 rounded"></div>
                    <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8" data-testid="professionals-list">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Buscar Profesionales IQX</h1>
          <p className="text-gray-600">Encuentra los mejores profesionales médicos en Bogotá</p>
        </div>

        {/* Search and Filters */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="space-y-4">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar por nombre o descripción..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  data-testid="search-input"
                />
              </div>

              {/* Filter Toggle */}
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2"
                  data-testid="filter-toggle"
                >
                  <Filter className="h-4 w-4" />
                  Filtros
                  {showFilters ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
                
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Users className="h-4 w-4" />
                  {filteredProfessionals.length} profesionales encontrados
                </div>
              </div>

              {/* Filters */}
              {showFilters && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
                  <div className="space-y-2">
                    <Label>Especialidad</Label>
                    <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
                      <SelectTrigger>
                        <SelectValue placeholder="Todas las especialidades" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Todas las especialidades</SelectItem>
                        {SPECIALTIES.map(specialty => (
                          <SelectItem key={specialty} value={specialty}>
                            {specialty}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Ubicación</Label>
                    <Input
                      placeholder="Ej: Bogotá"
                      value={selectedLocation}
                      onChange={(e) => setSelectedLocation(e.target.value)}
                    />
                  </div>
                  
                  <div className="flex items-end">
                    <Button variant="outline" onClick={clearFilters} className="w-full">
                      Limpiar Filtros
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Professionals Grid */}
        {filteredProfessionals.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProfessionals.map((professional) => (
              <Card key={professional.id} className="hover:shadow-lg transition-shadow card-hover">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={professional.profile_image} alt={professional.full_name} />
                        <AvatarFallback className="bg-blue-600 text-white">
                          {getInitials(professional.full_name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-lg">{professional.full_name}</CardTitle>
                        <CardDescription className="flex items-center">
                          <MapPin className="h-3 w-3 mr-1" />
                          {professional.location}
                        </CardDescription>
                      </div>
                    </div>
                    {getStatusBadge(professional.availability_status)}
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Rating */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1">
                      {renderStars(Math.floor(professional.average_rating || 0))}
                      <span className="text-sm text-gray-600 ml-1">
                        {professional.average_rating?.toFixed(1) || '0.0'} ({professional.total_reviews || 0})
                      </span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="h-3 w-3 mr-1" />
                      {professional.experience_years} años
                    </div>
                  </div>

                  {/* Specialties */}
                  <div className="flex flex-wrap gap-1">
                    {professional.specialties?.slice(0, 3).map((specialty, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {specialty}
                      </Badge>
                    ))}
                    {professional.specialties?.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{professional.specialties.length - 3} más
                      </Badge>
                    )}
                  </div>

                  {/* Bio */}
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {professional.bio || 'Sin descripción disponible'}
                  </p>

                  {/* Price */}
                  {professional.hourly_rate && (
                    <div className="flex items-center text-sm font-medium text-green-600">
                      <DollarSign className="h-4 w-4 mr-1" />
                      ${professional.hourly_rate.toLocaleString()} COP/hora
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => setSelectedProfessional(professional)}
                          data-testid={`view-profile-${professional.id}`}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Ver Perfil
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-3">
                            <Avatar className="h-12 w-12">
                              <AvatarImage src={professional.profile_image} alt={professional.full_name} />
                              <AvatarFallback className="bg-blue-600 text-white">
                                {getInitials(professional.full_name)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h3 className="text-xl font-bold">{professional.full_name}</h3>
                              <p className="text-sm text-gray-600 flex items-center">
                                <MapPin className="h-3 w-3 mr-1" />
                                {professional.location}
                              </p>
                            </div>
                          </DialogTitle>
                        </DialogHeader>
                        
                        <div className="space-y-6">
                          {/* Basic Info */}
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label className="text-sm font-medium text-gray-500">Experiencia</Label>
                              <p className="flex items-center mt-1">
                                <Clock className="h-4 w-4 mr-2 text-gray-400" />
                                {professional.experience_years} años
                              </p>
                            </div>
                            <div>
                              <Label className="text-sm font-medium text-gray-500">Calificación</Label>
                              <div className="flex items-center mt-1">
                                {renderStars(Math.floor(professional.average_rating || 0))}
                                <span className="text-sm text-gray-600 ml-2">
                                  {professional.average_rating?.toFixed(1) || '0.0'}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Contact Info - Only visible for non-company users */}
                          {user?.user_type !== 'company' && (
                            <div>
                              <Label className="text-sm font-medium text-gray-500 mb-2 block">Contacto</Label>
                              <div className="space-y-2">
                                <div className="flex items-center">
                                  <Mail className="h-4 w-4 mr-2 text-gray-400" />
                                  <span className="text-sm">{professional.email}</span>
                                </div>
                                <div className="flex items-center">
                                  <Phone className="h-4 w-4 mr-2 text-gray-400" />
                                  <span className="text-sm">{professional.phone}</span>
                                </div>
                              </div>
                            </div>
                          )}
                          
                          {/* Service Request Button for Companies */}
                          {user?.user_type === 'company' && (
                            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                              <p className="text-sm text-gray-600 mb-3">
                                Para obtener los datos de contacto de este profesional, envía una solicitud de servicio.
                              </p>
                              <Button
                                className="w-full bg-blue-600 hover:bg-blue-700"
                                onClick={() => {
                                  setSelectedProfessional(professional);
                                  setShowServiceRequestDialog(true);
                                }}
                              >
                                <Briefcase className="h-4 w-4 mr-2" />
                                Contratar Servicio
                              </Button>
                            </div>
                          )}

                          {/* Specialties */}
                          <div>
                            <Label className="text-sm font-medium text-gray-500 mb-2 block">Especialidades</Label>
                            <div className="flex flex-wrap gap-2">
                              {professional.specialties?.map((specialty, index) => (
                                <Badge key={index} variant="secondary">
                                  {specialty}
                                </Badge>
                              ))}
                            </div>
                          </div>

                          {/* Skills */}
                          {professional.skills && professional.skills.length > 0 && (
                            <div>
                              <Label className="text-sm font-medium text-gray-500 mb-2 block">Habilidades</Label>
                              <div className="flex flex-wrap gap-2">
                                {professional.skills.map((skill, index) => (
                                  <Badge key={index} variant="outline">
                                    {skill}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Bio */}
                          <div>
                            <Label className="text-sm font-medium text-gray-500 mb-2 block">Sobre mí</Label>
                            <p className="text-sm text-gray-700">
                              {professional.bio || 'Sin descripción disponible'}
                            </p>
                          </div>

                          {/* Education */}
                          {professional.education && (
                            <div>
                              <Label className="text-sm font-medium text-gray-500 mb-2 block">Educación</Label>
                              <p className="text-sm text-gray-700 flex items-start">
                                <Award className="h-4 w-4 mr-2 text-gray-400 mt-0.5" />
                                {professional.education}
                              </p>
                            </div>
                          )}

                          {/* Certifications */}
                          {professional.certifications && professional.certifications.length > 0 && (
                            <div>
                              <Label className="text-sm font-medium text-gray-500 mb-2 block">Certificaciones</Label>
                              <div className="space-y-2">
                                {professional.certifications.map((cert, index) => (
                                  <div key={index} className="flex items-center p-2 bg-gray-50 rounded-lg">
                                    <Award className="h-4 w-4 mr-2 text-blue-600" />
                                    <span className="text-sm">{cert}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Pricing */}
                          {professional.hourly_rate && (
                            <div>
                              <Label className="text-sm font-medium text-gray-500 mb-2 block">Tarifa</Label>
                              <div className="flex items-center text-lg font-semibold text-green-600">
                                <DollarSign className="h-5 w-5 mr-1" />
                                ${professional.hourly_rate.toLocaleString()} COP/hora
                              </div>
                            </div>
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>

                    {user?.user_type !== 'professional' && (
                      <Button
                        size="sm"
                        className="flex-1 bg-blue-600 hover:bg-blue-700"
                        onClick={() => {
                          setSelectedProfessional(professional);
                          setShowReviewDialog(true);
                        }}
                        data-testid={`review-professional-${professional.id}`}
                      >
                        <MessageSquare className="h-4 w-4 mr-1" />
                        Reseñar
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12">
              <div className="text-center text-gray-500">
                <Users className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">No se encontraron profesionales</h3>
                <p className="text-sm">Intenta ajustar tus filtros de búsqueda</p>
                <Button variant="outline" onClick={clearFilters} className="mt-4">
                  Limpiar Filtros
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Review Dialog */}
        <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Escribir Reseña</DialogTitle>
              <DialogDescription>
                Comparte tu experiencia trabajando con {selectedProfessional?.full_name}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Tu nombre</Label>
                <Input
                  value={reviewData.reviewer_name}
                  onChange={(e) => setReviewData({...reviewData, reviewer_name: e.target.value})}
                  placeholder="Nombre completo"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Calificación</Label>
                <div className="flex items-center space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewData({...reviewData, rating: star})}
                      className="focus:outline-none"
                    >
                      <Star
                        className={`h-6 w-6 cursor-pointer transition-colors ${
                          star <= reviewData.rating 
                            ? 'text-yellow-400 fill-current' 
                            : 'text-gray-300 hover:text-yellow-300'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="ml-2 text-sm text-gray-600">
                    {reviewData.rating} estrella{reviewData.rating !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Tipo de colaboración</Label>
                <Input
                  value={reviewData.collaboration_type}
                  onChange={(e) => setReviewData({...reviewData, collaboration_type: e.target.value})}
                  placeholder="Ej: Cirugía de rodilla, Consulta, etc."
                />
              </div>
              
              <div className="space-y-2">
                <Label>Comentario</Label>
                <Textarea
                  value={reviewData.comment}
                  onChange={(e) => setReviewData({...reviewData, comment: e.target.value})}
                  placeholder="Describe tu experiencia trabajando con este profesional..."
                  rows={4}
                  required
                />
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setShowReviewDialog(false)}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleSubmitReview}
                  disabled={submittingReview || !reviewData.comment.trim()}
                  className="bg-blue-600 hover:bg-blue-700"
                  data-testid="submit-review-button"
                >
                  {submittingReview ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Enviando...
                    </div>
                  ) : (
                    'Enviar Reseña'
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

export default ProfessionalList;
