/**
 * ============================================
 * CONTROLADOR SOPORTE
 * ============================================
 * Maneja las operaciones relacionadas con contacto de soporte:
 * - Envío de mensajes de contacto desde el formulario FAQ
 * - Obtención de mensajes para administrador
 * - Respuesta a mensajes
 */

const ContactoSoporte = require('../models/ContactoSoporte');

/**
 * POST /api/support/contact
 * Enviar un nuevo mensaje de contacto desde el formulario FAQ
 * Body: { nombre, email, asunto, mensaje }
 */
exports.enviarContacto = async (req, res) => {
  try {
    const { nombre, email, asunto, mensaje } = req.body;

    // Validación básica
    if (!nombre || !email || !asunto || !mensaje) {
      return res.status(400).json({
        success: false,
        message: 'Por favor completa todos los campos requeridos',
      });
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Por favor ingresa un email válido',
      });
    }

    // Crear el contacto en la base de datos
    const contacto = await ContactoSoporte.create({
      nombre: nombre.trim(),
      email: email.trim(),
      asunto: asunto.trim(),
      mensaje: mensaje.trim(),
      estado: 'pendiente',
    });

    return res.status(201).json({
      success: true,
      message: 'Tu mensaje ha sido enviado exitosamente. Nos pondremos en contacto pronto.',
      data: {
        id: contacto.id,
        estado: contacto.estado,
      },
    });
  } catch (error) {
    console.error('Error al enviar contacto de soporte:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al procesar tu solicitud. Por favor intenta más tarde.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * GET /api/support/contactos
 * Obtener todos los mensajes de contacto (solo administrador)
 * Query: ?estado=pendiente&page=1&limit=10
 */
exports.obtenerContactos = async (req, res) => {
  try {
    const { estado, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const whereCondition = estado ? { estado } : {};

    const { count, rows } = await ContactoSoporte.findAndCountAll({
      where: whereCondition,
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    return res.status(200).json({
      success: true,
      data: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    console.error('Error al obtener contactos:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al obtener los mensajes de contacto',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * GET /api/support/contactos/:id
 * Obtener un mensaje de contacto específico (solo administrador)
 */
exports.obtenerContactoPorId = async (req, res) => {
  try {
    const { id } = req.params;

    const contacto = await ContactoSoporte.findByPk(id);

    if (!contacto) {
      return res.status(404).json({
        success: false,
        message: 'Mensaje de contacto no encontrado',
      });
    }

    return res.status(200).json({
      success: true,
      data: contacto,
    });
  } catch (error) {
    console.error('Error al obtener contacto:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al obtener el mensaje',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * PUT /api/support/contactos/:id/responder
 * Responder a un mensaje de contacto (solo administrador)
 * Body: { respuesta }
 */
exports.responderContacto = async (req, res) => {
  try {
    const { id } = req.params;
    const { respuesta } = req.body;

    if (!respuesta || !respuesta.trim()) {
      return res.status(400).json({
        success: false,
        message: 'La respuesta no puede estar vacía',
      });
    }

    const contacto = await ContactoSoporte.findByPk(id);

    if (!contacto) {
      return res.status(404).json({
        success: false,
        message: 'Mensaje de contacto no encontrado',
      });
    }

    // Actualizar el contacto con la respuesta
    contacto.respuesta = respuesta.trim();
    contacto.estado = 'respondido';
    contacto.fechaRespuesta = new Date();
    await contacto.save();

    return res.status(200).json({
      success: true,
      message: 'Respuesta enviada exitosamente',
      data: contacto,
    });
  } catch (error) {
    console.error('Error al responder contacto:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al enviar la respuesta',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * DELETE /api/support/contactos/:id
 * Eliminar un mensaje de contacto (solo administrador)
 */
exports.eliminarContacto = async (req, res) => {
  try {
    const { id } = req.params;

    const contacto = await ContactoSoporte.findByPk(id);

    if (!contacto) {
      return res.status(404).json({
        success: false,
        message: 'Mensaje de contacto no encontrado',
      });
    }

    await contacto.destroy();

    return res.status(200).json({
      success: true,
      message: 'Mensaje eliminado exitosamente',
    });
  } catch (error) {
    console.error('Error al eliminar contacto:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al eliminar el mensaje',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};
