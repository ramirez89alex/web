import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Label } from './ui/label';
import { useAuth } from '../App';
import { Eye, EyeOff, Stethoscope, Users, Building } from 'lucide-react';

function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    const result = await login(formData.email, formData.password);
    
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-cyan-50 px-4">
      <div className="w-full max-w-md animate-fade-in">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center items-center mb-4">
            <div className="bg-blue-600 p-3 rounded-full">
              <Stethoscope className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">IQX Profesionales</h1>
          <p className="text-gray-600">Conectando talento médico en Bogotá</p>
        </div>

        <Card className="glass border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold text-center text-gray-800">
              Iniciar Sesión
            </CardTitle>
            <CardDescription className="text-center text-gray-600">
              Ingresa a tu cuenta profesional
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Correo Electrónico
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="tu@email.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="form-input"
                  data-testid="login-email-input"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Contraseña
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    className="form-input pr-10"
                    data-testid="login-password-input"
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

              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white btn-hover-lift"
                disabled={isLoading}
                data-testid="login-submit-button"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Iniciando sesión...
                  </div>
                ) : (
                  'Iniciar Sesión'
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                ¿No tienes cuenta?{' '}
                <Link
                  to="/register"
                  className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
                  data-testid="register-link"
                >
                  Regístrate aquí
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Feature highlights */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
          <div className="flex flex-col items-center p-4 bg-white/50 rounded-lg">
            <Stethoscope className="h-8 w-8 text-blue-600 mb-2" />
            <p className="text-sm font-medium text-gray-700">Profesionales IQX</p>
          </div>
          <div className="flex flex-col items-center p-4 bg-white/50 rounded-lg">
            <Building className="h-8 w-8 text-green-600 mb-2" />
            <p className="text-sm font-medium text-gray-700">Empresas</p>
          </div>
          <div className="flex flex-col items-center p-4 bg-white/50 rounded-lg">
            <Users className="h-8 w-8 text-purple-600 mb-2" />
            <p className="text-sm font-medium text-gray-700">Proveedores</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
