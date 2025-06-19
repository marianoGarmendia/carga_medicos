import React, { useEffect, useState } from 'react';
import { Calendar, User, Stethoscope, Shield, CreditCard, Clock, Send,  AlertCircle, Plus, Edit, Trash2 } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';


const BASE_URL_BACKEND = import.meta.env.VITE_BASE_URL_BACKEND || 'http://localhost:3000';

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

interface Medico {
  id: string;
  fechaCarga: string;
  especialidad: string;
  nombreMedico: string;
  apellidoMedico: string;
  categoria: string;
  obraSocial: string;
  diasAtencion: string[];
}

type ActiveSection = 'registro' | 'actualizar' | 'eliminar' | 'send_actualizar'

const especialidades = [
  'Cardiología',
  'Dermatología',
  'Endocrinología',
  'Gastroenterología',
  'Ginecología',
  'Neurología',
  'Oftalmología',
  'Pediatría',
  'Psiquiatría',
  'Traumatología',
  'Urología',
  'Reumatología'
];

const categorias = [
  'A',
  'B',
  'C',
  
];

// const obrasSociales = [
//   'OSDE',
//   'Swiss Medical',
//   'Medicus',
//   'Galeno',
//   'Sancor Salud',
//   'IOMA',
//   'PAMI',
//   'Obra Social Unión Personal',
//   'Particular'
// ];

interface SearchMedicos {
  apellido_medico: string;
  nombre_medico: string;
  especialidad: string;
  fecha_carga: string;
  id: number;
  obra_social: string;
  categoria: string;
}

const diasSemana = [
  'Lunes',
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes',
  'Sábado'
];

type SelectMedicToSearch = string[];



function App() {
  const [activeSection, setActiveSection] = useState<ActiveSection>('registro');
  const [searchMedicos , setSearchMedicos] = useState<SearchMedicos[]>([]);
  const [selectedmedicoToSearch , setSelectedMedicoToSearch] = useState<SelectMedicToSearch>([]);
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
  // const [ setSearchTerm] = useState('');
  const [selectedMedico, setSelectedMedico] = useState<Medico | null>(null);
  const [medicos, setMedicos] = useState<Medico[]>([]);
  // const [isLoading, setIsLoading] = useState(false);



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
    setSelectedMedico(null);
    setSearchMedicos([]);
    setSelectedMedicoToSearch([]);
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

    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  

  //   const handleInputChangeToUpdate = (field: keyof FormData, value: string) => {
  //   setFormDataToUpdate(prev => ({
  //     ...prev,
  //     [field]: value
  //   }));

  //   if (errors[field]) {
  //     setErrors(prev => ({
  //       ...prev,
  //       [field]: ''
  //     }));
  //   }
  // };

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

  // const searchMedicos = async () => {
  //   if (!searchTerm.trim()) {
  //     toast.error('Por favor, ingrese un término de búsqueda');
  //     return;
  //   }

  //   setIsLoading(true);
  //   try {
  //     const response = await fetch(`${BASE_URL_BACKEND}/api/medicos/search?q=${encodeURIComponent(searchTerm)}`);
  //     if (response.ok) {
  //       const data = await response.json();
  //       setMedicos(data);
  //     } else {
  //       throw new Error('Error en la búsqueda');
  //     }
  //   } catch (error) {
  //     console.error('Error searching medicos:', error);
  //     toast.error('Error al buscar médicos. Por favor, intente nuevamente.');
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  const loadMedicoData = (medico: Medico) => {
    setSelectedMedico(medico);
    setFormData({
      fechaCarga: medico.fechaCarga,
      especialidad: medico.especialidad,
      nombreMedico: medico.nombreMedico,
      apellidoMedico: medico.apellidoMedico,
      categoria: medico.categoria,
      obraSocial: medico.obraSocial,
      diasAtencion: medico.diasAtencion
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Por favor, complete todos los campos requeridos');
      return;
    }

    setIsSubmitting(true);

    try {
      const endpoint = activeSection === 'registro' ? '/api/guardar-medico' : `/api/medicos/${selectedMedico?.id}`;
      const method = activeSection === 'registro' ? 'POST' : 'PUT';

      const response = await fetch(`${BASE_URL_BACKEND}${endpoint}`, {
        method,
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
        const successMessage = activeSection === 'registro' 
          ? '¡Médico registrado exitosamente!' 
          : '¡Médico actualizado exitosamente!';
        
        toast.success(successMessage, {
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
        
        resetForm();
      } else {
        throw new Error('Error en el servidor');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      const errorMessage = activeSection === 'registro' 
        ? 'Error al registrar médico. Por favor, intente nuevamente.'
        : 'Error al actualizar médico. Por favor, intente nuevamente.';
      
      toast.error(errorMessage, {
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

  const handleDelete = async (medicoId: string) => {
    if (!window.confirm('¿Está seguro de que desea eliminar este médico? Esta acción no se puede deshacer.')) {
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`${BASE_URL_BACKEND}/api/medicos/${medicoId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('¡Médico eliminado exitosamente!', {
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
        
        // Refresh the search results
        setMedicos(medicos.filter(m => m.id !== medicoId));
       
      } else {
        throw new Error('Error en el servidor');
      }
    } catch (error) {
      console.error('Error deleting medico:', error);
      toast.error('Error al eliminar médico. Por favor, intente nuevamente.', {
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

  // Seleccionar el medico para actualizar o eliminar
  // const handleSearchMedicos = (searchValue: string[]) => {
  //   setSelectedMedicoToSearch(searchValue)

  // }

  // Traer los medicos
  const handleGetMedicos = async () => {
    try {
      const response = await fetch(`${BASE_URL_BACKEND}/api/medicos`);
      const medicosData = await response.json();
      if (response.ok) {
        setSearchMedicos(medicosData);
      } else {
        throw new Error('Error al obtener los médicos');
      }
      
    } catch (error) {
      console.log('Error al obtener los médicos:', error);
      
    }
  }

  useEffect(() => {
    console.log("Medicos:", searchMedicos); 
    
  },[searchMedicos])

  const handleSectionChange = (section: ActiveSection) => {
    if(section === "actualizar" || section === "eliminar") {
      handleGetMedicos();
    }
    setActiveSection(section);
    resetForm();
    // setSearchTerm('');
    setMedicos([]);
  };


  const handleUpdateMedico = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log("nombre" , selectedmedicoToSearch[0]);
    console.log("apellido", selectedmedicoToSearch[1]);
    console.log("especialidad", formData.especialidad);
    console.log("obra social", formData.obraSocial);
    console.log("categoria", formData.categoria);
    console.log("dias atencion", formData.diasAtencion);
    
try {
  const response = await fetch(`${BASE_URL_BACKEND}/api/actualizar-medico`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      nombre_medico: selectedmedicoToSearch[0],
      apellido_medico: selectedmedicoToSearch[1],
      especialidad: formData.especialidad,
      obra_social: formData.obraSocial,
      categoria: formData.categoria,
      dias_atencion: formData.diasAtencion
    })
  })

  if (response.ok) {
    const data = await response.json();
    console.log("data", data);
    toast.success('Médico actualizado exitosamente', {
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
    
    resetForm();
    setSelectedMedico(null);
    handleGetMedicos(); // Refrescar la lista de médicos
  }

} catch (error) {
  console.error("Error al actualizar médico:", error);
  toast.error('Error al actualizar médico. Por favor, intente nuevamente.', {
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
  
}finally {
      setIsSubmitting(false);
    }
    
  }

  const getSectionConfig = () => {
    switch (activeSection) {
      case 'registro':
        return {
          title: 'Registro de Médico',
          subtitle: 'Complete todos los campos para registrar un nuevo profesional',
          buttonText: 'Registrar Médico',
          buttonIcon: <Send className="h-5 w-5" />,
          gradient: 'from-blue-600 to-blue-700',
          hoverGradient: 'hover:from-blue-700 hover:to-blue-800'
        };
      case 'actualizar':
        return {
          title: 'Actualizar Médico',
          subtitle: 'Busque y seleccione el médico que desea actualizar',
          buttonText: 'Actualizar Médico',
          buttonIcon: <Edit className="h-5 w-5" />,
          gradient: 'from-amber-600 to-amber-700',
          hoverGradient: 'hover:from-amber-700 hover:to-amber-800'
        };
      case 'eliminar':
        return {
          title: 'Eliminar Médico',
          subtitle: 'Busque y seleccione el médico que desea eliminar',
          buttonText: 'Eliminar Médico',
          buttonIcon: <Trash2 className="h-5 w-5" />,
          gradient: 'from-red-600 to-red-700',
          hoverGradient: 'hover:from-red-700 hover:to-red-800'
        };
          case 'send_actualizar':
        return {
          title: 'Actualizar Médico',
          subtitle: '',
          buttonText: 'Actualizar Médico',
          buttonIcon: <Send className="h-5 w-5" />,
          gradient: 'from-amber-600 to-amber-700',
          hoverGradient: 'hover:from-amber-700 hover:to-amber-800'
        };
    }
  };

  const config = getSectionConfig();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <Toaster />
      
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-blue-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-600 p-3 rounded-xl">
                <Stethoscope className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Sistema de Gestión Médica IMAR</h1>
                <p className="text-gray-600 mt-1">Gestión integral de profesionales y especialidades</p>
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex space-x-3">
              <button
                onClick={() => handleSectionChange('registro')}
                className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                  activeSection === 'registro'
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg'
                    : 'bg-white text-blue-600 border-2 border-blue-200 hover:border-blue-300 hover:bg-blue-50'
                }`}
              >
                <Plus className="h-5 w-5" />
                <span>Registrar</span>
              </button>

              <button
                onClick={() => handleSectionChange('actualizar')}
                className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                  activeSection === 'actualizar'
                    ? 'bg-gradient-to-r from-amber-600 to-amber-700 text-white shadow-lg'
                    : 'bg-white text-amber-600 border-2 border-amber-200 hover:border-amber-300 hover:bg-amber-50'
                }`}
              >
                <Edit className="h-5 w-5" />
                <span>Actualizar</span>
              </button>

              <button
                onClick={() => handleSectionChange('eliminar')}
                className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                  activeSection === 'eliminar'
                    ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg'
                    : 'bg-white text-red-600 border-2 border-red-200 hover:border-red-300 hover:bg-red-50'
                }`}
              >
                <Trash2 className="h-5 w-5" />
                <span>Eliminar</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className={`bg-gradient-to-r ${config.gradient} px-8 py-6`}>
            <h2 className="text-2xl font-semibold text-white">{config.title}</h2>
            <p className="text-blue-100 mt-2">{config.subtitle}</p>
          </div>

          {/* Search Section for Update and Delete */}
          {(activeSection === 'actualizar' || activeSection === 'eliminar') && (
            <div className="p-8 border-b border-gray-200">
              <div className="space-y-4">
                <div className="flex space-x-4">
                  <div className="flex-1">
                     <select
                    value={selectedmedicoToSearch.join(',')}
                    onChange={(e) =>  setSelectedMedicoToSearch(e.target.value.split(','))}
                    className={`w-full px-4 py-3  border rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.especialidad ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <option value="">Seleccione un médico</option>
                    {searchMedicos && searchMedicos.map((med) => (
                      <option key={med.id} value={ [med.nombre_medico , med.apellido_medico] }> {med.nombre_medico + " " + med.apellido_medico}</option>
                    ))}
                  </select>
                  <form onSubmit={(e) => handleUpdateMedico(e)} className='flex gap-4 flex-col py-4'>
                     <div className="space-y-2">
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                  <CreditCard className="h-4 w-4 text-blue-600" />
                  <span>Obra Social</span>
                </label>
             

               <input
                    type="text"
                    value={formData.obraSocial}
                    onChange={(e) => handleInputChange('obraSocial', e.target.value)}
                    placeholder="Ingresa las obras sociales o su modalidad con las que trabaja"
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
              <div>
                 <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full bg-gradient-to-r from-amber-600 to-amber-800 text-white py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-200 hover:from-amber-700 hover:to-amber-800 focus:outline-none  focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2`}
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Procesando...</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-5 w-5" />
                      <span>Actualizar</span>
                    </>
                  )}
                </button>
              </div>
                  </form>
                    
                    {/* <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Buscar por nombre, apellido o especialidad..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      onKeyPress={(e) => e.key === 'Enter' && searchMedicos()}
                    /> */}
                  </div>
                  {/* <button
                    onClick={searchMedicos}
                    disabled={isLoading}
                    className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors duration-200 flex items-center space-x-2"
                  >
                    <Search className="h-5 w-5" />
                    <span>{isLoading ? 'Buscando...' : 'Buscar'}</span>
                  </button> */}

                </div>

                {/* Search Results */}
                {medicos.length > 0 && (
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {medicos.map((medico) => (
                      <div
                        key={medico.id}
                        className={`p-4 border rounded-xl cursor-pointer transition-all duration-200 ${
                          selectedMedico?.id === medico.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                        onClick={() => loadMedicoData(medico)}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold text-gray-900">
                              Dr. {medico.nombreMedico} {medico.apellidoMedico}
                            </h3>
                            <p className="text-sm text-gray-600">{medico.especialidad}</p>
                            <p className="text-sm text-gray-500">{medico.categoria} - {medico.obraSocial}</p>
                          </div>
                          {activeSection === 'eliminar' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(medico.id);
                              }}
                              className="px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors duration-200 text-sm font-medium"
                            >
                              Eliminar
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Form Section */}
          {(activeSection === 'registro' || (activeSection === 'actualizar' && selectedMedico)) && (
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
                  <select
                    value={formData.especialidad}
                    onChange={(e) => handleInputChange('especialidad', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.especialidad ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <option value="">Seleccione una especialidad</option>
                    {especialidades.map((esp) => (
                      <option key={esp} value={esp}>{esp}</option>
                    ))}
                  </select>
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
                {/* <select
                  value={formData.obraSocial}
                  onChange={(e) => handleInputChange('obraSocial', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.obraSocial ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <option value="">Seleccione una obra social</option>
                  {obrasSociales.map((obra) => (
                    <option key={obra} value={obra}>{obra}</option>
                  ))}
                </select> */}

               <input
                    type="text"
                    value={formData.obraSocial}
                    onChange={(e) => handleInputChange('obraSocial', e.target.value)}
                    placeholder="Ingresa las obras sociales o su modalidad con las que trabaja"
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
                  className={`w-full bg-gradient-to-r ${config.gradient} text-white py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-200 ${config.hoverGradient} focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2`}
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Procesando...</span>
                    </>
                  ) : (
                    <>
                      {config.buttonIcon}
                      <span>{config.buttonText}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Empty state for update/delete without selection */}
          {/* {((activeSection === 'actualizar' && !selectedMedico) || activeSection === 'eliminar') && medicos.length === 0 && searchTerm === '' && (
            <div className="p-12 text-center">
              <div className="text-gray-400 mb-4">
                <Search className="h-16 w-16 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {activeSection === 'actualizar' ? 'Buscar médico para actualizar' : 'Buscar médico para eliminar'}
              </h3>
              <p className="text-gray-600">
                Use el campo de búsqueda para encontrar el médico que desea {activeSection === 'actualizar' ? 'actualizar' : 'eliminar'}.
              </p>
            </div>
          )} */}
        </div>
      </div>
    </div>
  );
}

export default App;