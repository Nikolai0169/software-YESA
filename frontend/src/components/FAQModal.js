/**
 * ============================================
 * MODAL DE PREGUNTAS FRECUENTES (FAQ)
 * ============================================
 * Popup global con preguntas frecuentes accesible desde cualquier página.
 */

import React, { useState, useEffect } from 'react';
import { Modal, Accordion, Button } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';

const FAQModal = ({ show, onHide, openSection, setShowFAQ, openContact = false }) => {
  const [activeKey, setActiveKey] = useState(null);
  const [showContactForm, setShowContactForm] = useState(false);
  const [formMessage, setFormMessage] = useState('');
  const [nombreValue, setNombreValue] = useState('');
  const [emailValue, setEmailValue] = useState('');
  const [asuntoValue, setAsuntoValue] = useState('');
  const [mensajeValue, setMensajeValue] = useState('');
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();

  const faqs = [
    {
      id: 'envios',
      pregunta: '¿Cuáles son los tiempos de entrega?',
      respuesta: 'Los tiempos de entrega varían según tu ubicación. Para Bogotá y alrededores: 2-3 días hábiles. Para otras ciudades: 3-5 días hábiles. Ofrecemos envío gratuito en compras superiores a $100.000.'
    },
    {
      id: 'devoluciones',
      pregunta: '¿Cuál es la política de devoluciones?',
      respuesta: 'Aceptamos devoluciones dentro de los 30 días siguientes a la recepción del producto. El producto debe estar en su empaque original y sin uso. Los costos de envío de devolución corren por cuenta del cliente, excepto en casos de defecto de fábrica.'
    },
    {
      id: 'pagos',
      pregunta: '¿Qué métodos de pago aceptan?',
      respuesta: 'Aceptamos tarjetas de crédito y débito (Visa, MasterCard, American Express), transferencias bancarias, pagos en efectivo contra entrega y pagos electrónicos a través de PSE. Todos los pagos son procesados de forma segura.'
    },
    {
      id: 'garantia',
      pregunta: '¿Los productos tienen garantía?',
      respuesta: 'Sí, todos nuestros productos tienen garantía de 1 año contra defectos de fabricación. La garantía no cubre daños por uso indebido, accidentes o modificaciones no autorizadas.'
    },
    {
      id: 'stock',
      pregunta: '¿Cómo puedo verificar la disponibilidad de un producto?',
      respuesta: 'En la página de cada producto encontrarás información actualizada sobre el stock disponible. También puedes contactarnos directamente para confirmar disponibilidad antes de realizar tu compra.'
    },
    {
      id: 'personalizacion',
      pregunta: '¿Ofrecen personalización de productos?',
      respuesta: 'Sí, ofrecemos opciones de personalización para muchos de nuestros productos. Puedes elegir diferentes modelos 3D, colores y acabados. Los precios adicionales se muestran claramente durante el proceso de selección.'
    },
    {
      id: 'favoritos',
      pregunta: '¿Cómo funciona la lista de favoritos?',
      respuesta: 'Los usuarios registrados pueden guardar productos en su lista de favoritos para acceder fácilmente después. Solo necesitas hacer clic en el corazón en la página del producto. Tu lista es privada y se mantiene entre sesiones.'
    },
    {
      id: 'seguridad',
      pregunta: '¿Es seguro comprar en YESA?',
      respuesta: 'Sí, tu seguridad es nuestra prioridad. Utilizamos encriptación SSL para todas las transacciones, cumplimos con las normas de protección de datos y nunca almacenamos información de tarjetas de crédito en nuestros servidores.'
    },
    {
      id: 'contacto',
      pregunta: '¿Cómo puedo contactarlos?',
      respuesta: 'Puedes contactarnos a través de nuestro formulario web, por teléfono al 01-800-YESA, por WhatsApp al +57 300 123 4567, o visitando nuestras tiendas físicas. Nuestro horario de atención es de lunes a viernes de 8:00 AM a 6:00 PM.'
    },
    {
      id: 'registro',
      pregunta: '¿Es obligatorio registrarse para comprar?',
      respuesta: 'No es obligatorio registrarse para navegar por nuestro catálogo, pero sí es requerido para realizar compras, guardar favoritos y acceder al historial de pedidos. El registro es rápido y gratuito.'
    }
  ];

  // ✅ useEffect DESPUÉS de que faqs está definido
  useEffect(() => {
    if (openSection) {
      const faqIndex = faqs.findIndex(faq => faq.id === openSection);
      if (faqIndex !== -1) {
        setActiveKey(faqIndex.toString());
      }
    }
  }, [openSection, show]);

  // Si se solicita abrir directamente el formulario de contacto
  useEffect(() => {
    if (show && openContact) {
      setShowContactForm(true);
    }
  }, [show, openContact]);

  useEffect(() => {
    if (!show) {
      setShowContactForm(false);
      setFormMessage('');
      setAsuntoValue('');
      setMensajeValue('');
      if (!user) {
        setNombreValue('');
        setEmailValue('');
      }
    }
  }, [show, user]);

  useEffect(() => {
    if (showContactForm && user) {
      setNombreValue(user.nombre || '');
      setEmailValue(user.email || '');
    }
  }, [showContactForm, user]);

  useEffect(() => {
    if (show && isAuthenticated && new URLSearchParams(location.search).get('support') === '1') {
      setShowContactForm(true);
      if (user) {
        setNombreValue(user.nombre || '');
        setEmailValue(user.email || '');
      }
    }
  }, [show, isAuthenticated, location.search, user]);

  const navigate = useNavigate();

  const handleContactSupport = () => {
    setFormMessage('');

    if (!isAuthenticated) {
      onHide();
      navigate('/login', {
        state: {
          from: {
            pathname: location.pathname,
            search: location.search,
          },
          returnToSupport: true,
        },
      });
      return;
    }

    setShowContactForm(true);
  };
  
  

  const handleSendMessage = async (e) => {
  e.preventDefault();

  const token = localStorage.getItem('token');
  if (!token) {
    setFormMessage('❌ Debes iniciar sesión para enviar la consulta. Serás redirigido al login.');
    setTimeout(() => {
      onHide();
      navigate('/login');
    }, 1400);
    return;
  }

  const data = {
    nombre: nombreValue,
    email: emailValue,
    asunto: asuntoValue,
    mensaje: mensajeValue,
  };

  const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` };

  try {
    const response = await fetch('http://localhost:5000/api/support/contact', {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Error al enviar');
    }

    setFormMessage('✅ Mensaje enviado correctamente. Nos pondremos en contacto pronto.');
    setTimeout(() => {
      setShowContactForm(false);
      setFormMessage('');
      setAsuntoValue('');
      setMensajeValue('');
    }, 2000);
  } catch (error) {
    const message = error.message || '';
    if (message.toLowerCase().includes('401')) {
      setFormMessage('❌ Debes iniciar sesión para enviar una consulta. Redirigiendo al login...');
      setTimeout(() => {
        onHide();
        navigate('/login');
      }, 1200);
      return;
    }

    setFormMessage('❌ No se pudo enviar el mensaje. Intenta de nuevo.');
  }
};
  return (
    <>
      {/* MODAL DE PREGUNTAS FRECUENTES */}
      <Modal show={show && !showContactForm} onHide={onHide} size="lg" centered>
        <Modal.Header closeButton style={{ background: 'linear-gradient(135deg, var(--primary-color) 0%, var(--primary-dark) 100%)', color: '#fff' }}>
          <Modal.Title>
            <i className="bi bi-question-circle-fill me-2"></i>
            Preguntas Frecuentes
          </Modal.Title>
        </Modal.Header>

        <Modal.Body style={{ maxHeight: '60vh', overflowY: 'auto', backgroundColor: '#ffffff', color: '#000000' }}>
          <p className="text-muted mb-4" style={{ color: '#333333' }}>
            Encuentra respuestas a las preguntas más comunes sobre nuestros productos y servicios.
          </p>

          <Accordion activeKey={activeKey} onSelect={setActiveKey}>
            {faqs.map((faq, index) => (
              <Accordion.Item
                key={faq.id}
                eventKey={index.toString()}
                style={{ backgroundColor: '#ffffff', color: '#000000', border: '1px solid #e9ecef', borderRadius: '0.75rem', marginBottom: '0.75rem' }}
              >
                <Accordion.Header style={{ backgroundColor: '#ffffff', color: '#000000' }}>
                  <strong>{faq.pregunta}</strong>
                </Accordion.Header>
                <Accordion.Body style={{ backgroundColor: '#ffffff', color: '#000000' }}>
                  {faq.respuesta}
                </Accordion.Body>
              </Accordion.Item>
            ))}
          </Accordion>

          <div className="text-center mt-4">
            <p className="text-muted mb-2">¿No encuentras la respuesta que buscas?</p>
            <Button 
              variant="outline-primary" 
              size="sm"
              onClick={handleContactSupport}
            >
              <i className="bi bi-envelope me-1"></i>
              Contactar Soporte
            </Button>
          </div>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>

      {/* MODAL DE FORMULARIO DE CONTACTO */}
      <Modal 
        show={showContactForm} 
        onHide={() => setShowContactForm(false)} 
        size="md" 
        centered
      >
        <Modal.Header closeButton style={{ background: 'linear-gradient(135deg, var(--primary-color) 0%, var(--primary-dark) 100%)', color: '#fff' }}>
          <Modal.Title>
            <i className="bi bi-chat-dots me-2"></i>
            Contactar Soporte
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {formMessage ? (
            <div className="alert alert-success alert-dismissible fade show" role="alert">
              {formMessage}
            </div>
          ) : (
            <form onSubmit={handleSendMessage}>
              <div className="mb-3">
                <label htmlFor="nombre" className="form-label">
                  Nombre <span className="text-danger">*</span>
                </label>
                <input 
                  type="text" 
                  className="form-control" 
                  id="nombre" 
                  value={nombreValue}
                  onChange={(e) => setNombreValue(e.target.value)}
                  required 
                  placeholder="Tu nombre completo"
                />
              </div>

              <div className="mb-3">
                <label htmlFor="email" className="form-label">
                  Email <span className="text-danger">*</span>
                </label>
                <input 
                  type="email" 
                  className="form-control" 
                  id="email" 
                  value={emailValue}
                  onChange={(e) => setEmailValue(e.target.value)}
                  required 
                  placeholder="tu@email.com"
                />
              </div>

              <div className="mb-3">
                <label htmlFor="asunto" className="form-label">
                  Asunto <span className="text-danger">*</span>
                </label>
                <select 
                  className="form-select" 
                  id="asunto" 
                  value={asuntoValue}
                  onChange={(e) => setAsuntoValue(e.target.value)}
                  required
                >
                  <option value="">Selecciona un asunto...</option>
                  <option value="pedido">Pregunta sobre un pedido</option>
                  <option value="producto">Pregunta sobre un producto</option>
                  <option value="devolucion">Devolución o cambio</option>
                  <option value="pago">Problema de pago</option>
                  <option value="envio">Problema de envío</option>
                  <option value="otro">Otro</option>
                </select>
              </div>

              <div className="mb-3">
                <label htmlFor="mensaje" className="form-label">
                  Mensaje <span className="text-danger">*</span>
                </label>
                <textarea 
                  className="form-control" 
                  id="mensaje" 
                  value={mensajeValue}
                  onChange={(e) => setMensajeValue(e.target.value)}
                  rows="4" 
                  required 
                  placeholder="Cuéntanos con detalle tu pregunta o problema..."
                ></textarea>
              </div>

              <div className="d-grid gap-2">
                <Button 
                  variant="primary" 
                  type="submit"
                  className="text-white fw-bold"
                >
                  <i className="bi bi-send me-2"></i>
                  Enviar Mensaje
                </Button>
                <Button 
                  variant="outline-secondary" 
                  onClick={() => setShowContactForm(false)}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          )}
        </Modal.Body>
      </Modal>
    </>
  );
};

export default FAQModal;