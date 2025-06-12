import React, { useState } from 'react';
import { Calendar, User, Stethoscope, Shield, CreditCard, Clock, Send, AlertCircle } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

interface FormData {
  fechaCarga: string;
  especialidad: string;
  nombreMedico: string;
  apellidoMedico: string;
  categoria: string;
  obraSocial: string;
  diasAtencion: string[];
}

interface FormErrors {
  [key: string]: string;
}

// const especialidades = [
//   'Cardiología',
//   'Dermatología',
//   'Endocrinología',
//   'Gastroenterología',
//   'Ginecología',
//   'Neurología',
//   'Oftalmología',
//   'Pediatría',
//   'Psiquiatría',
//   'Traumatología',
//   'Urología'
// ];

const categorias = [
  "A",
  "B",
  "C",

];

const obrasSociales = [
  'OSDE',
  'Swiss Medical',
  'Medicus',
  'Galeno',
  'Sancor Salud',
  'IOMA',
  'PAMI',
  'Obra Social Unión Personal',
  'Particular'
];

const diasSemana = [
  'Lunes',
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes',
  'Sábado'
];

function App() {
  const [formData, setFormData] = useState<FormData>({
    fechaCarga: new Date().toISOString().split('T')[0],
    especialidad: '',
    nombreMedico: '',
    apellidoMedico: '',
    categoria: '',
    obraSocial: '',
    diasAtencion: []
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setFormData({
      fechaCarga: new Date().toISOString().split('T')[0],
      especialidad: '',
      nombreMedico: '',
      apellidoMedico: '',
      categoria: '',
      obraSocial: '',
      diasAtencion: []
    });
    setErrors({});
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.fechaCarga) {
      newErrors.fechaCarga = 'La fecha de carga es requerida';
    }

    if (!formData.especialidad) {
      newErrors.especialidad = 'La especialidad es requerida';
    }

    if (!formData.nombreMedico.trim()) {
      newErrors.nombreMedico = 'El nombre del médico es requerido';
    }

    if (!formData.apellidoMedico.trim()) {
      newErrors.apellidoMedico = 'El apellido del médico es requerido';
    }

    if (!formData.categoria) {
      newErrors.categoria = 'La categoría del médico es requerida';
    }

    if (!formData.obraSocial) {
      newErrors.obraSocial = 'La obra social es requerida';
    }

    if (formData.diasAtencion.length === 0) {
      newErrors.diasAtencion = 'Debe seleccionar al menos un día de atención';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleDayToggle = (day: string) => {
    setFormData(prev => ({
      ...prev,
      diasAtencion: prev.diasAtencion.includes(day)
        ? prev.diasAtencion.filter(d => d !== day)
        : [...prev.diasAtencion, day]
    }));

    if (errors.diasAtencion) {
      setErrors(prev => ({
        ...prev,
        diasAtencion: ''
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Por favor, complete todos los campos requeridos');
      return;
    }

    
    console.log('Form Data:', formData.apellidoMedico);
    console.log('Form Data:', formData.diasAtencion);
    console.log('Form Data:', formData.obraSocial);
    console.log('Form Data:', formData.categoria);
    console.log('Form Data:', formData.especialidad);
    console.log('Form Data:', formData.fechaCarga);
    console.log('Form Data:', formData.nombreMedico);

    

    setIsSubmitting(true);

    try {
      // Replace with your actual endpoint
      const response = await fetch('https://fqfb9bqm-3000.brs.devtunnels.ms/api/guardar-medico', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fecha_carga: formData.fechaCarga,
          especialidad: formData.especialidad,
          nombre_medico: formData.nombreMedico,
          apellido_medico: formData.apellidoMedico,
          categoria: formData.categoria,
          obra_social: formData.obraSocial,
          dias_atencion: formData.diasAtencion
        })
      });

      if (response.ok) {
        toast.success('¡Médico registrado exitosamente!', {
          duration: 4000,
          position: 'top-center',
          style: {
            background: '#10B981',
            color: 'white',
            fontWeight: '600',
            padding: '16px 24px',
            borderRadius: '12px',
            fontSize: '16px'
          },
          iconTheme: {
            primary: 'white',
            secondary: '#10B981',
          },
        });
        
        // Reset form after successful submission
        resetForm();
      } else {
        throw new Error('Error en el servidor');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('Error al registrar médico. Por favor, intente nuevamente.', {
        duration: 4000,
        position: 'top-center',
        style: {
          background: '#EF4444',
          color: 'white',
          fontWeight: '600',
          padding: '16px 24px',
          borderRadius: '12px',
          fontSize: '16px'
        },
        iconTheme: {
          primary: 'white',
          secondary: '#EF4444',
        },
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Toast Container */}
      <Toaster />
      
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-blue-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-600 p-3 rounded-xl">
              <Stethoscope className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Sistema de Gestión Médica</h1>
              <p className="text-gray-600 mt-1">Registro de profesionales y especialidades</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6">
            <h2 className="text-2xl font-semibold text-white">Registro de Médico</h2>
            <p className="text-blue-100 mt-2">Complete todos los campos para registrar un nuevo profesional</p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            {/* Fecha de Carga */}
            <div className="space-y-2">
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                <Calendar className="h-4 w-4 text-blue-600" />
                <span>Fecha de Carga</span>
              </label>
              <input
                type="date"
                value={formData.fechaCarga}
                onChange={(e) => handleInputChange('fechaCarga', e.target.value)}
                className={`w-full px-4 py-3 border rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.fechaCarga ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                }`}
              />
              {errors.fechaCarga && (
                <p className="text-red-600 text-sm flex items-center space-x-1">
                  <AlertCircle className="h-4 w-4" />
                  <span>{errors.fechaCarga}</span>
                </p>
              )}
            </div>

            {/* Datos del Médico */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                  <User className="h-4 w-4 text-blue-600" />
                  <span>Nombre del Médico</span>
                </label>
                <input
                  type="text"
                  value={formData.nombreMedico}
                  onChange={(e) => handleInputChange('nombreMedico', e.target.value)}
                  placeholder="Ingrese el nombre"
                  className={`w-full px-4 py-3 border rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.nombreMedico ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                  }`}
                />
                {errors.nombreMedico && (
                  <p className="text-red-600 text-sm flex items-center space-x-1">
                    <AlertCircle className="h-4 w-4" />
                    <span>{errors.nombreMedico}</span>
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                  <User className="h-4 w-4 text-blue-600" />
                  <span>Apellido del Médico</span>
                </label>
                <input
                  type="text"
                  value={formData.apellidoMedico}
                  onChange={(e) => handleInputChange('apellidoMedico', e.target.value)}
                  placeholder="Ingrese el apellido"
                  className={`w-full px-4 py-3 border rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.apellidoMedico ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                  }`}
                />
                {errors.apellidoMedico && (
                  <p className="text-red-600 text-sm flex items-center space-x-1">
                    <AlertCircle className="h-4 w-4" />
                    <span>{errors.apellidoMedico}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Especialidad y Categoría */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                  <Stethoscope className="h-4 w-4 text-blue-600" />
                  <span>Especialidad</span>
                </label>
                <input
                  type="text"
                  value={formData.especialidad}
                  onChange={(e) => handleInputChange('especialidad', e.target.value)}
                  placeholder="Ingrese la especialidad"
                  className={`w-full px-4 py-3 border rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.especialidad ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                  }`}
                />
                {errors.especialidad && (
                  <p className="text-red-600 text-sm flex items-center space-x-1">
                    <AlertCircle className="h-4 w-4" />
                    <span>{errors.especialidad}</span>
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                  <Shield className="h-4 w-4 text-blue-600" />
                  <span>Categoría del Médico</span>
                </label>
                <select
                  value={formData.categoria}
                  onChange={(e) => handleInputChange('categoria', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.categoria ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <option value="">Seleccione una categoría</option>
                  {categorias.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                {errors.categoria && (
                  <p className="text-red-600 text-sm flex items-center space-x-1">
                    <AlertCircle className="h-4 w-4" />
                    <span>{errors.categoria}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Obra Social */}
            <div className="space-y-2">
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                <CreditCard className="h-4 w-4 text-blue-600" />
                <span>Obra Social</span>
              </label>
             
              <input
                  type="text"
                  value={formData.obraSocial}
                  onChange={(e) => handleInputChange('obraSocial', e.target.value)}
                  placeholder="Describir"
                  className={`w-full px-4 py-3 border rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                     errors.obraSocial ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                  }`}
                />
              {errors.obraSocial && (
                <p className="text-red-600 text-sm flex items-center space-x-1">
                  <AlertCircle className="h-4 w-4" />
                  <span>{errors.obraSocial}</span>
                </p>
              )}
            </div>

            {/* Días de Atención */}
            <div className="space-y-4">
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                <Clock className="h-4 w-4 text-blue-600" />
                <span>Días de Atención</span>
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {diasSemana.map((dia) => (
                  <button
                    key={dia}
                    type="button"
                    onClick={() => handleDayToggle(dia)}
                    className={`px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all duration-200 ${
                      formData.diasAtencion.includes(dia)
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50'
                    }`}
                  >
                    {dia}
                  </button>
                ))}
              </div>
              {errors.diasAtencion && (
                <p className="text-red-600 text-sm flex items-center space-x-1">
                  <AlertCircle className="h-4 w-4" />
                  <span>{errors.diasAtencion}</span>
                </p>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-6 border-t border-gray-200">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-200 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Registrando...</span>
                  </>
                ) : (
                  <>
                    <Send className="h-5 w-5" />
                    <span>Registrar Médico</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default App;