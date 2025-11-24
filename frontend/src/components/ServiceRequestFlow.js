import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Avatar, AvatarFallback } from './ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { useAuth } from '../App';
import { toast } from 'sonner';
import {
  CheckCircle,
  CreditCard,
  FileText,
  Clock,
  MapPin,
  User,
  Building2,
  AlertCircle
} from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function ServiceRequestFlow({ request, onUpdate }) {
  const { user } = useAuth();
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [payment, setPayment] = useState(null);
  const [serviceDetails, setServiceDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const [paymentData, setPaymentData] = useState({
    amount: ''
  });

  const [detailsData, setDetailsData] = useState({
    date_time: '',
    location: '',
    access_authorization: '',
    surgeon_name: '',
    operating_room: '',
    estimated_duration: '',
    additional_notes: ''
  });

  useEffect(() => {
    if (request.status === 'approved') {
      fetchPaymentAndDetails();
    }
  }, [request]);

  const fetchPaymentAndDetails = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = { 
        headers: { Authorization: `Bearer ${token}` },
        validateStatus: (status) => status < 500 // Don't throw on 404
      };

      // Try to fetch payment
      const paymentRes = await axios.get(`${API}/payments/by-request/${request.id}`, config);
      if (paymentRes.status === 200) {
        setPayment(paymentRes.data);

        // If payment exists, try to fetch service details
        const detailsRes = await axios.get(`${API}/service-details/by-request/${request.id}`, config);
        if (detailsRes.status === 200) {
          setServiceDetails(detailsRes.data);
        }
      }
    } catch (error) {
      // Silently handle errors - this is expected when payment/details don't exist yet
    }
  };

  const handlePayment = async () => {
    if (!paymentData.amount || parseFloat(paymentData.amount) <= 0) {
      toast.error('Por favor ingresa un monto válido');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API}/payments`,
        {
          service_request_id: request.id,
          amount: parseFloat(paymentData.amount),
          payment_method: 'simulated'
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success('¡Pago procesado exitosamente! Ahora puedes enviar los detalles del servicio.');
      setShowPaymentDialog(false);
      await fetchPaymentAndDetails();
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error processing payment:', error);
      toast.error(error.response?.data?.detail || 'Error al procesar el pago');
    } finally {
      setLoading(false);
    }
  };

  const handleSendDetails = async () => {
    if (!detailsData.date_time || !detailsData.location || !detailsData.surgeon_name) {
      toast.error('Por favor completa todos los campos obligatorios');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API}/service-details`,
        {
          service_request_id: request.id,
          ...detailsData
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success('¡Detalles del servicio enviados! El profesional ha sido notificado.');
      setShowDetailsDialog(false);
      await fetchPaymentAndDetails();
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error sending details:', error);
      toast.error(error.response?.data?.detail || 'Error al enviar detalles');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = () => {
    if (!payment) {
      return <Badge className="bg-yellow-100 text-yellow-800">Pendiente de Pago</Badge>;
    }
    if (payment && !serviceDetails) {
      return <Badge className="bg-blue-100 text-blue-800">Pendiente de Detalles</Badge>;
    }
    if (serviceDetails) {
      return <Badge className="bg-green-100 text-green-800">Detalles Enviados</Badge>;
    }
    return null;
  };

  const renderActions = () => {
    // If not approved, don't show actions
    if (request.status !== 'approved') {
      return null;
    }

    // If no payment, show payment button
    if (!payment) {
      return (
        <Button
          onClick={() => setShowPaymentDialog(true)}
          className="bg-green-600 hover:bg-green-700"
        >
          <CreditCard className="h-4 w-4 mr-2" />
          Realizar Pago
        </Button>
      );
    }

    // If payment but no details, show details button
    if (payment && !serviceDetails) {
      return (
        <Button
          onClick={() => setShowDetailsDialog(true)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <FileText className="h-4 w-4 mr-2" />
          Enviar Detalles del Servicio
        </Button>
      );
    }

    // If everything is done
    return (
      <div className="flex items-center text-green-600">
        <CheckCircle className="h-5 w-5 mr-2" />
        <span className="font-medium">Servicio Coordinado</span>
      </div>
    );
  };

  return (
    <>
      <div className="flex items-center justify-between p-4 border rounded-lg bg-white">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-blue-600 text-white">
                PR
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">Solicitud de Servicio</p>
              <p className="text-sm text-gray-600">{request.service_type}</p>
            </div>
          </div>
          {getStatusBadge()}
        </div>
        <div>
          {renderActions()}
        </div>
      </div>

      {/* Payment Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Realizar Pago del Servicio</DialogTitle>
            <DialogDescription>
              Pago simulado para garantizar el servicio del profesional
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <p className="text-sm text-gray-700">
                <AlertCircle className="h-4 w-4 inline mr-2" />
                Este pago se mantiene en garantía (escrow) hasta que el servicio sea completado.
              </p>
            </div>

            <div className="space-y-2">
              <Label>Monto a Pagar (COP)</Label>
              <Input
                type="number"
                placeholder="Ej: 500000"
                value={paymentData.amount}
                onChange={(e) => setPaymentData({ ...paymentData, amount: e.target.value })}
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowPaymentDialog(false)}>
                Cancelar
              </Button>
              <Button
                onClick={handlePayment}
                disabled={loading}
                className="bg-green-600 hover:bg-green-700"
              >
                {loading ? 'Procesando...' : 'Confirmar Pago'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Service Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalles del Servicio</DialogTitle>
            <DialogDescription>
              Proporciona la información necesaria para coordinar el servicio
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Fecha y Hora *</Label>
                <Input
                  type="datetime-local"
                  value={detailsData.date_time}
                  onChange={(e) => setDetailsData({ ...detailsData, date_time: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Duración Estimada *</Label>
                <Input
                  placeholder="Ej: 2 horas"
                  value={detailsData.estimated_duration}
                  onChange={(e) => setDetailsData({ ...detailsData, estimated_duration: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Lugar / Dirección *</Label>
              <Input
                placeholder="Dirección completa del centro médico"
                value={detailsData.location}
                onChange={(e) => setDetailsData({ ...detailsData, location: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Autorización de Ingreso *</Label>
              <Input
                placeholder="Código o información de acceso"
                value={detailsData.access_authorization}
                onChange={(e) => setDetailsData({ ...detailsData, access_authorization: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Médico Encargado *</Label>
                <Input
                  placeholder="Nombre del cirujano"
                  value={detailsData.surgeon_name}
                  onChange={(e) => setDetailsData({ ...detailsData, surgeon_name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Número de Quirófano *</Label>
                <Input
                  placeholder="Ej: Quirófano 3"
                  value={detailsData.operating_room}
                  onChange={(e) => setDetailsData({ ...detailsData, operating_room: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Notas Adicionales</Label>
              <Textarea
                placeholder="Información adicional relevante..."
                value={detailsData.additional_notes}
                onChange={(e) => setDetailsData({ ...detailsData, additional_notes: e.target.value })}
                rows={3}
              />
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => setShowDetailsDialog(false)}>
                Cancelar
              </Button>
              <Button
                onClick={handleSendDetails}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {loading ? 'Enviando...' : 'Enviar Detalles'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default ServiceRequestFlow;
