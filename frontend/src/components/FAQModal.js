/**
 * ============================================
 * MODAL DE PREGUNTAS FRECUENTES (FAQ)
 * ============================================
 * Popup global con preguntas frecuentes accesible desde cualquier página.
 */

import React, { useState } from 'react';
import { Modal, Accordion, Button } from 'react-bootstrap';

const FAQModal = ({ show, onHide }) => {
  const [activeKey, setActiveKey] = useState(null);

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
      respuesta: 'No es obligatorio registrarse para navegar por nuestro catálogo, pero sí es requerido para realizar compras, guardar favoritos y acceder al historial de pedidos. El registro es gratuito y solo toma unos minutos.'
    }
  ];

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton className="bg-primary text-white">
        <Modal.Title>
          <i className="bi bi-question-circle-fill me-2"></i>
          Preguntas Frecuentes
        </Modal.Title>
      </Modal.Header>

      <Modal.Body style={{ maxHeight: '60vh', overflowY: 'auto' }}>
        <p className="text-muted mb-4">
          Encuentra respuestas a las preguntas más comunes sobre nuestros productos y servicios.
        </p>

        <Accordion activeKey={activeKey} onSelect={setActiveKey}>
          {faqs.map((faq, index) => (
            <Accordion.Item key={faq.id} eventKey={index.toString()}>
              <Accordion.Header>
                <strong>{faq.pregunta}</strong>
              </Accordion.Header>
              <Accordion.Body>
                {faq.respuesta}
              </Accordion.Body>
            </Accordion.Item>
          ))}
        </Accordion>

        <div className="text-center mt-4">
          <p className="text-muted mb-2">¿No encuentras la respuesta que buscas?</p>
          <Button variant="outline-primary" size="sm">
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
  );
};

export default FAQModal;
