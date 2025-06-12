const crearMedico = async ({fechacarga ,especialidad, nombreMedico, obraSocial, categoria, diasAtencion, apellidoMedico}) => {
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
}