import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { useAuth } from '../App';
import { Eye, EyeOff, Stethoscope, Building, Package, Plus, X } from 'lucide-react';

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

const COMPANY_TYPES = [
  "Hospital", "Clínica", "Centro Médico", "Consultorio", "Laboratorio", "Centro de Diagnóstico"
];

const COMPANY_SIZES = [
  "Pequeña (1-50 empleados)", "Mediana (51-200 empleados)", "Grande (200+ empleados)"
];

function Register() {
  const [activeTab, setActiveTab] = useState('professional');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [newSkill, setNewSkill] = useState('');
  const [newRequirement, setNewRequirement] = useState('');
  const [newService, setNewService] = useState('');
  const [newProduct, setNewProduct] = useState('');
  
  const [formData, setFormData] = useState({
    // Common fields
    email: '',
    password: '',
    full_name: '',
    phone: '',
    location: 'Bogotá',
    user_type: 'professional',
    
    // Professional fields
    specialties: [],
    experience_years: 1,
    bio: '',
    education: '',
    certifications: [],
    hourly_rate: '',
    skills: [],
    areas_of_expertise: [],
    
    // Company fields
    company_name: '',
    company_type: '',
    description: '',
    size: '',
    services_offered: [],
    requirements: [],
    
    // Supplier fields
    products_services: []
  });
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleTabChange = (value) => {
    setActiveTab(value);
    setFormData(prev => ({ ...prev, user_type: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Prepare data based on user type
    const submitData = { ...formData };
    if (submitData.hourly_rate) {
      submitData.hourly_rate = parseFloat(submitData.hourly_rate);
    }
    
    const result = await register(submitData);
    
    if (result.success) {
      navigate('/dashboard');
    }
    
    setIsLoading(false);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 py-8 px-4">
      <div className="max-w-2xl mx-auto animate-fade-in">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center items-center mb-4">
            <div className="bg-blue-600 p-3 rounded-full">
              <Stethoscope className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Únete a IQX Profesionales</h1>
          <p className="text-gray-600">Regístrate y comienza a conectar con oportunidades médicas</p>
        </div>

        <Card className="glass border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold text-center text-gray-800">
              Crear Cuenta
            </CardTitle>
            <CardDescription className="text-center text-gray-600">
              Elige tu tipo de perfil para comenzar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="professional" className="flex items-center gap-2">
                  <Stethoscope className="h-4 w-4" />
                  Profesional IQX
                </TabsTrigger>
                <TabsTrigger value="company" className="flex items-center gap-2">
                  <Building className="h-4 w-4" />
                  Empresa
                </TabsTrigger>
                <TabsTrigger value="supplier" className="flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Proveedor
                </TabsTrigger>
              </TabsList>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Common Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Correo Electrónico</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="tu@email.com"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      data-testid="register-email-input"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password">Contraseña</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={handleInputChange}
                        required
                        className="pr-10"
                        data-testid="register-password-input"
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 flex items-center pr-3"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="full_name">Nombre Completo</Label>
                    <Input
                      id="full_name"
                      name="full_name"
                      placeholder="Juan Pérez"
                      value={formData.full_name}
                      onChange={handleInputChange}
                      required
                      data-testid="register-name-input"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone">Teléfono</Label>
                    <Input
                      id="phone"
                      name="phone"
                      placeholder="+57 300 123 4567"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      data-testid="register-phone-input"
                    />
                  </div>
                </div>

                {/* Professional Tab */}
                <TabsContent value="professional" className="space-y-4 mt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                          <SelectValue placeholder="Seleccionar especialidad" />
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
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="bio">Biografía Profesional</Label>
                    <Textarea
                      id="bio"
                      name="bio"
                      placeholder="Describe tu experiencia y enfoque profesional..."
                      value={formData.bio}
                      onChange={handleInputChange}
                      rows={3}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="education">Educación</Label>
                    <Input
                      id="education"
                      name="education"
                      placeholder="Universidad, títulos, certificaciones principales"
                      value={formData.education}
                      onChange={handleInputChange}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="hourly_rate">Tarifa por Hora (COP) - Opcional</Label>
                    <Input
                      id="hourly_rate"
                      name="hourly_rate"
                      type="number"
                      placeholder="150000"
                      value={formData.hourly_rate}
                      onChange={handleInputChange}
                    />
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
                </TabsContent>

                {/* Company Tab */}
                <TabsContent value="company" className="space-y-4 mt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="company_name">Nombre de la Empresa</Label>
                      <Input
                        id="company_name"
                        name="company_name"
                        placeholder="Hospital San José"
                        value={formData.company_name}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Tipo de Empresa</Label>
                      <Select onValueChange={(value) => handleSelectChange('company_type', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          {COMPANY_TYPES.map(type => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Tamaño de la Empresa</Label>
                    <Select onValueChange={(value) => handleSelectChange('size', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar tamaño" />
                      </SelectTrigger>
                      <SelectContent>
                        {COMPANY_SIZES.map(size => (
                          <SelectItem key={size} value={size}>
                            {size}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description">Descripción</Label>
                    <Textarea
                      id="description"
                      name="description"
                      placeholder="Describe tu empresa y servicios..."
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={3}
                    />
                  </div>

                  {/* Services Offered */}
                  <div className="space-y-2">
                    <Label>Servicios Ofrecidos</Label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Ej: Cirugía cardiovascular"
                        value={newService}
                        onChange={(e) => setNewService(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addToArray('services_offered', newService, setNewService))}
                      />
                      <Button
                        type="button"
                        onClick={() => addToArray('services_offered', newService, setNewService)}
                        size="sm"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.services_offered.map((service, index) => (
                        <Badge key={index} variant="outline" className="flex items-center gap-1">
                          {service}
                          <X
                            className="h-3 w-3 cursor-pointer"
                            onClick={() => removeFromArray('services_offered', index)}
                          />
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Requirements */}
                  <div className="space-y-2">
                    <Label>Requisitos para Profesionales</Label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Ej: 5+ años de experiencia"
                        value={newRequirement}
                        onChange={(e) => setNewRequirement(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addToArray('requirements', newRequirement, setNewRequirement))}
                      />
                      <Button
                        type="button"
                        onClick={() => addToArray('requirements', newRequirement, setNewRequirement)}
                        size="sm"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.requirements.map((req, index) => (
                        <Badge key={index} variant="outline" className="flex items-center gap-1">
                          {req}
                          <X
                            className="h-3 w-3 cursor-pointer"
                            onClick={() => removeFromArray('requirements', index)}
                          />
                        </Badge>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                {/* Supplier Tab */}
                <TabsContent value="supplier" className="space-y-4 mt-6">
                  <div className="space-y-2">
                    <Label htmlFor="supplier_company_name">Nombre de la Empresa</Label>
                    <Input
                      id="supplier_company_name"
                      name="company_name"
                      placeholder="MedSupplies Colombia"
                      value={formData.company_name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="supplier_description">Descripción</Label>
                    <Textarea
                      id="supplier_description"
                      name="description"
                      placeholder="Describe tu empresa y productos..."
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={3}
                    />
                  </div>

                  {/* Products/Services */}
                  <div className="space-y-2">
                    <Label>Productos y Servicios</Label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Ej: Equipos de ortopedia"
                        value={newProduct}
                        onChange={(e) => setNewProduct(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addToArray('products_services', newProduct, setNewProduct))}
                      />
                      <Button
                        type="button"
                        onClick={() => addToArray('products_services', newProduct, setNewProduct)}
                        size="sm"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.products_services.map((product, index) => (
                        <Badge key={index} variant="outline" className="flex items-center gap-1">
                          {product}
                          <X
                            className="h-3 w-3 cursor-pointer"
                            onClick={() => removeFromArray('products_services', index)}
                          />
                        </Badge>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <Button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white btn-hover-lift mt-6"
                  disabled={isLoading}
                  data-testid="register-submit-button"
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Creando cuenta...
                    </div>
                  ) : (
                    'Crear Cuenta'
                  )}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  ¿Ya tienes cuenta?{' '}
                  <Link
                    to="/login"
                    className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
                    data-testid="login-link"
                  >
                    Inicia sesión aquí
                  </Link>
                </p>
              </div>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default Register;
