import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { useAuth } from '../App';
import { toast } from 'sonner';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Star,
  Award,
  Briefcase,
  GraduationCap,
  Clock,
  DollarSign,
  Edit,
  Save,
  X,
  Plus
} from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const SPECIALTIES = [
  "Ortopedia", "Columna", "Traumatología", "Cardiología", "Neurología",
  "Anestesiología", "Cirugía General", "Ginecología", "Urología", "Oftalmología",
  "Otorrinolaringología", "Dermatología", "Radiología", "Patología", "Medicina Interna"
];

function ProfessionalProfile() {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [newSkill, setNewSkill] = useState('');
  const [newCertification, setNewCertification] = useState('');
  
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    location: '',
    bio: '',
    education: '',
    experience_years: 0,
    hourly_rate: '',
    specialties: [],
    skills: [],
    certifications: [],
    availability_status: 'available'
  });

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchReviews();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const response = await axios.get(`${API}/professionals/me`);
      const profileData = response.data;
      setProfile(profileData);
      
      // If user is professional, also fetch professional-specific data
      if (user.user_type === 'professional') {
        setFormData({
          full_name: profileData.full_name || '',
          phone: profileData.phone || '',
          location: profileData.location || '',
          bio: profileData.bio || '',
          education: profileData.education || '',
          experience_years: profileData.experience_years || 0,
          hourly_rate: profileData.hourly_rate ? profileData.hourly_rate.toString() : '',
          specialties: profileData.specialties || [],
          skills: profileData.skills || [],
          certifications: profileData.certifications || [],
          availability_status: profileData.availability_status || 'available'
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Error al cargar el perfil');
    }
  };

  const fetchReviews = async () => {
    try {
      const response = await axios.get(`${API}/reviews/professional/${user.id}`);
      setReviews(response.data);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const addToArray = (field, value, setter) => {
    if (value.trim() && !formData[field].includes(value.trim())) {
      setFormData(prev => ({
        ...prev,
        [field]: [...prev[field], value.trim()]
      }));
      setter('');
    }
  };

  const removeFromArray = (field, index) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const updateData = { ...formData };
      if (updateData.hourly_rate) {
        updateData.hourly_rate = parseFloat(updateData.hourly_rate);
      }

      const response = await axios.put(`${API}/professionals/me`, updateData);
      
      setProfile(response.data);
      updateUser(response.data);
      setIsEditing(false);
      toast.success('Perfil actualizado correctamente');
    } catch (error) {
      console.error('Error updating profile:', error);
      const message = error.response?.data?.detail || 'Error al actualizar el perfil';
      toast.error(message);
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

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Header */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
              <Avatar className="h-24 w-24">
                <AvatarImage src={profile.profile_image} alt={profile.full_name} />
                <AvatarFallback className="bg-blue-600 text-white text-2xl">
                  {getInitials(profile.full_name)}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{profile.full_name}</h1>
                    <div className="flex items-center space-x-4 text-gray-600 mb-4">
                      <div className="flex items-center">
                        <Mail className="h-4 w-4 mr-1" />
                        <span>{profile.email}</span>
                      </div>
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 mr-1" />
                        <span>{profile.phone}</span>
                      </div>
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        <span>{profile.location}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end space-y-2">
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center space-x-1">
                        {renderStars(Math.floor(profile.average_rating || 0))}
                        <span className="text-sm font-medium text-gray-600">
                          {profile.average_rating?.toFixed(1) || '0.0'} ({profile.total_reviews || 0} reseñas)
                        </span>
                      </div>
                    </div>
                    {getStatusBadge(profile.availability_status)}
                  </div>
                </div>
                
                {user.user_type === 'professional' && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {profile.specialties?.map((specialty, index) => (
                      <Badge key={index} variant="secondary">
                        {specialty}
                      </Badge>
                    ))}
                  </div>
                )}
                
                <div className="flex items-center justify-between">
                  <p className="text-gray-600">{profile.bio || 'Sin descripción aún'}</p>
                  <Button
                    onClick={() => setIsEditing(!isEditing)}
                    variant={isEditing ? "outline" : "default"}
                    className="ml-4"
                    data-testid="edit-profile-button"
                  >
                    {isEditing ? (
                      <><X className="h-4 w-4 mr-2" />Cancelar</>
                    ) : (
                      <><Edit className="h-4 w-4 mr-2" />Editar Perfil</>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList>
            <TabsTrigger value="profile">Perfil</TabsTrigger>
            <TabsTrigger value="reviews">Reseñas ({reviews.length})</TabsTrigger>
            <TabsTrigger value="stats">Estadísticas</TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            {isEditing ? (
              <Card>
                <CardHeader>
                  <CardTitle>Editar Perfil</CardTitle>
                  <CardDescription>Actualiza tu información profesional</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="full_name">Nombre Completo</Label>
                        <Input
                          id="full_name"
                          name="full_name"
                          value={formData.full_name}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="phone">Teléfono</Label>
                        <Input
                          id="phone"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="location">Ubicación</Label>
                        <Input
                          id="location"
                          name="location"
                          value={formData.location}
                          onChange={handleInputChange}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="experience_years">Años de Experiencia</Label>
                        <Input
                          id="experience_years"
                          name="experience_years"
                          type="number"
                          min="0"
                          max="50"
                          value={formData.experience_years}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bio">Biografía Profesional</Label>
                      <Textarea
                        id="bio"
                        name="bio"
                        rows={4}
                        value={formData.bio}
                        onChange={handleInputChange}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="education">Educación</Label>
                      <Input
                        id="education"
                        name="education"
                        value={formData.education}
                        onChange={handleInputChange}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="hourly_rate">Tarifa por Hora (COP)</Label>
                        <Input
                          id="hourly_rate"
                          name="hourly_rate"
                          type="number"
                          value={formData.hourly_rate}
                          onChange={handleInputChange}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Estado de Disponibilidad</Label>
                        <Select value={formData.availability_status} onValueChange={(value) => handleSelectChange('availability_status', value)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="available">Disponible</SelectItem>
                            <SelectItem value="busy">Ocupado</SelectItem>
                            <SelectItem value="unavailable">No disponible</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Specialties */}
                    <div className="space-y-2">
                      <Label>Especialidades</Label>
                      <Select onValueChange={(value) => {
                        if (!formData.specialties.includes(value)) {
                          setFormData(prev => ({
                            ...prev,
                            specialties: [...prev.specialties, value]
                          }));
                        }
                      }}>
                        <SelectTrigger>
                          <SelectValue placeholder="Añadir especialidad" />
                        </SelectTrigger>
                        <SelectContent>
                          {SPECIALTIES.map(specialty => (
                            <SelectItem key={specialty} value={specialty}>
                              {specialty}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {formData.specialties.map((specialty, index) => (
                          <Badge key={index} variant="secondary" className="flex items-center gap-1">
                            {specialty}
                            <X
                              className="h-3 w-3 cursor-pointer"
                              onClick={() => removeFromArray('specialties', index)}
                            />
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Skills */}
                    <div className="space-y-2">
                      <Label>Habilidades Técnicas</Label>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Ej: Cirugía laparoscópica"
                          value={newSkill}
                          onChange={(e) => setNewSkill(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addToArray('skills', newSkill, setNewSkill))}
                        />
                        <Button
                          type="button"
                          onClick={() => addToArray('skills', newSkill, setNewSkill)}
                          size="sm"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {formData.skills.map((skill, index) => (
                          <Badge key={index} variant="outline" className="flex items-center gap-1">
                            {skill}
                            <X
                              className="h-3 w-3 cursor-pointer"
                              onClick={() => removeFromArray('skills', index)}
                            />
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Certifications */}
                    <div className="space-y-2">
                      <Label>Certificaciones</Label>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Ej: Certificación en Trauma"
                          value={newCertification}
                          onChange={(e) => setNewCertification(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addToArray('certifications', newCertification, setNewCertification))}
                        />
                        <Button
                          type="button"
                          onClick={() => addToArray('certifications', newCertification, setNewCertification)}
                          size="sm"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {formData.certifications.map((cert, index) => (
                          <Badge key={index} variant="outline" className="flex items-center gap-1">
                            {cert}
                            <X
                              className="h-3 w-3 cursor-pointer"
                              onClick={() => removeFromArray('certifications', index)}
                            />
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-end space-x-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsEditing(false)}
                      >
                        Cancelar
                      </Button>
                      <Button
                        type="submit"
                        disabled={loading}
                        className="bg-blue-600 hover:bg-blue-700"
                        data-testid="save-profile-button"
                      >
                        {loading ? (
                          <div className="flex items-center">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Guardando...
                          </div>
                        ) : (
                          <><Save className="h-4 w-4 mr-2" />Guardar Cambios</>
                        )}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Professional Info */}
                <div className="lg:col-span-2 space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Briefcase className="h-5 w-5 mr-2" />
                        Información Profesional
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm font-medium text-gray-500">Experiencia</Label>
                          <p className="flex items-center mt-1">
                            <Clock className="h-4 w-4 mr-2 text-gray-400" />
                            {profile.experience_years} años
                          </p>
                        </div>
                        {profile.hourly_rate && (
                          <div>
                            <Label className="text-sm font-medium text-gray-500">Tarifa por Hora</Label>
                            <p className="flex items-center mt-1">
                              <DollarSign className="h-4 w-4 mr-2 text-gray-400" />
                              ${profile.hourly_rate?.toLocaleString()} COP
                            </p>
                          </div>
                        )}
                      </div>
                      
                      {profile.education && (
                        <div>
                          <Label className="text-sm font-medium text-gray-500">Educación</Label>
                          <p className="flex items-start mt-1">
                            <GraduationCap className="h-4 w-4 mr-2 text-gray-400 mt-0.5" />
                            {profile.education}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Skills */}
                  {profile.skills && profile.skills.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <Award className="h-5 w-5 mr-2" />
                          Habilidades Técnicas
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2">
                          {profile.skills.map((skill, index) => (
                            <Badge key={index} variant="secondary">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Certifications */}
                  {profile.certifications && profile.certifications.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <Award className="h-5 w-5 mr-2" />
                          Certificaciones
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {profile.certifications.map((cert, index) => (
                            <div key={index} className="flex items-center p-2 bg-gray-50 rounded-lg">
                              <Award className="h-4 w-4 mr-2 text-blue-600" />
                              <span>{cert}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Contacto</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center">
                        <Mail className="h-4 w-4 mr-3 text-gray-400" />
                        <span className="text-sm">{profile.email}</span>
                      </div>
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 mr-3 text-gray-400" />
                        <span className="text-sm">{profile.phone}</span>
                      </div>
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-3 text-gray-400" />
                        <span className="text-sm">{profile.location}</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Estadísticas</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Calificación</span>
                        <div className="flex items-center">
                          <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                          <span className="font-medium">{profile.average_rating?.toFixed(1) || '0.0'}</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Reseñas</span>
                        <span className="font-medium">{profile.total_reviews || 0}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Miembro desde</span>
                        <span className="font-medium">
                          {new Date(profile.created_at).toLocaleDateString('es-ES', { 
                            year: 'numeric', 
                            month: 'short' 
                          })}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </TabsContent>

          {/* Reviews Tab */}
          <TabsContent value="reviews">
            <Card>
              <CardHeader>
                <CardTitle>Reseñas y Calificaciones</CardTitle>
                <CardDescription>
                  Opiniones de empresas y colegas sobre tu trabajo
                </CardDescription>
              </CardHeader>
              <CardContent>
                {reviews.length > 0 ? (
                  <div className="space-y-4">
                    {reviews.map((review) => (
                      <div key={review.id} className="border-b border-gray-200 pb-4 last:border-b-0">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">{review.reviewer_name}</span>
                            <Badge variant="secondary">{review.reviewer_type}</Badge>
                          </div>
                          <div className="flex items-center space-x-1">
                            {renderStars(review.rating)}
                            <span className="text-sm text-gray-600 ml-2">
                              {new Date(review.created_at).toLocaleDateString('es-ES')}
                            </span>
                          </div>
                        </div>
                        <p className="text-gray-700 mb-2">{review.comment}</p>
                        {review.collaboration_type && (
                          <Badge variant="outline" className="text-xs">
                            {review.collaboration_type}
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Star className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No tienes reseñas aún</p>
                    <p className="text-sm">Las reseñas aparecerán cuando empieces a trabajar con empresas.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Stats Tab */}
          <TabsContent value="stats">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Calificación Promedio</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-blue-600 mb-2">
                        {profile.average_rating?.toFixed(1) || '0.0'}
                      </div>
                      <div className="flex items-center justify-center mb-2">
                        {renderStars(Math.floor(profile.average_rating || 0))}
                      </div>
                      <p className="text-sm text-gray-500">
                        Basado en {profile.total_reviews || 0} reseñas
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Experiencia</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-green-600 mb-2">
                      {profile.experience_years || 0}
                    </div>
                    <p className="text-sm text-gray-500">Años de experiencia</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Especialidades</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-purple-600 mb-2">
                      {profile.specialties?.length || 0}
                    </div>
                    <p className="text-sm text-gray-500">Áreas de especialización</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default ProfessionalProfile;
