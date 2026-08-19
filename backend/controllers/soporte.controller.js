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

    // Validar formato de email usando validación robusta sin patrones susceptibles a backtracking
    function isValidEmail(email) {
      if (typeof email !== 'string') return false;
      const atIndex = email.indexOf('@');
      if (atIndex <= 0) return false;
      const local = email.slice(0, atIndex);
      const domain = email.slice(atIndex + 1);
      if (!local || !domain) return false;
      if (local.length > 64 || domain.length > 255) return false;
      if (domain.indexOf('.') === -1) return false;

      const localAllowed = /^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+$/;
      const domainAllowed = /^[A-Za-z0-9.-]+$/;
      if (!localAllowed.test(local)) return false;
      if (!domainAllowed.test(domain)) return false;

      const labels = domain.split('.');
      for (const label of labels) {
        if (!label.length || label.length > 63) return false;
        if (label.startsWith('-') || label.endsWith('-')) return false;
      }

      return true;
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'Por favor ingresa un email válido',
      });
    }

    const contacto = await ContactoSoporte.create({
  nombre: nombre.trim(),
  email: email.trim(),
  asunto: asunto.trim(),
  mensaje: mensaje.trim(),
  estado: 'pendiente',
  usuarioId: req.usuario?.id || null,
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
      limit: Number.parseInt(limit),
      offset: Number.parseInt(offset),
    });

    return res.status(200).json({
      success: true,
      data: rows,
      pagination: {
        total: count,
        page: Number.parseInt(page),
        limit: Number.parseInt(limit),
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

    if (!respuesta?.trim()) {
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

    if (contacto.estado !== 'respondido') {
      return res.status(400).json({
        success: false,
        message: 'Solo se pueden cerrar tickets luego de haberlos respondido',
      });
    }

    contacto.estado = 'cerrado';
    await contacto.save();

    return res.status(200).json({
      success: true,
      message: 'Mensaje cerrado exitosamente',
      data: contacto,
    });
  } catch (error) {
    console.error('Error al eliminar contacto:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al cerrar el mensaje',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};
/**
 * GET /api/support/mis-consultas
 * Obtener las consultas del usuario logueado
 */
exports.misConsultas = async (req, res) => {
  try {
      console.log('Usuario en req:', req.usuario);
    const consultas = await ContactoSoporte.findAll({
      where: { usuarioId: req.usuario.id },
      order: [['createdAt', 'DESC']],
    });

    return res.status(200).json({
      success: true,
      data: consultas,
    });
  } catch (error) {
    console.error('Error al obtener consultas:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al obtener tus consultas',
    });
  }
};