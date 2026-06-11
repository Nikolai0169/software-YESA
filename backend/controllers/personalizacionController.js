const Producto = require("../models/Producto");
const Cotizacion = require('../models/Cotizacion');

// Guardar diseño
exports.guardarDiseno = async (req, res) => {
  try {
    const { imagen, color, especificaciones } = req.body;
    const nuevoDiseno = await Producto.create({
      imagen,
      color,
      especificaciones,
      estado: "guardado",
    });
    res.json({ mensaje: "Diseño guardado correctamente", diseno: nuevoDiseno });
  } catch (error) {
    console.error('Error al guardar diseño:', error);
    res.status(500).json({ error: "Error al guardar el diseño" });
  }
};

// Cotizar producto
exports.cotizarProducto = async (req, res) => {
  try {
    const disenos = Array.isArray(req.body.disenos) ? req.body.disenos : [req.body];
    const textureActive = disenos.some((item) => Boolean(item.hasTexture) || Boolean(item.textureUrl));
    const firstDesign = disenos[0] || {};
    const isMultiple = disenos.length > 1;

    const items = disenos.map((design, index) => ({
      nombre: design.nombre || `Diseño ${index + 1}`,
      modelo: design.modelo || 'taza',
      colorInterior: design.colorInterior,
      colorBase: design.colorBase,
      colorExterior: design.colorExterior,
      colorAsa: design.colorAsa,
      textInterior: design.textInterior,
      textExterior: design.textExterior,
      textureUrl: design.textureUrl || null,
      overlayText: design.overlayText,
      overlayTextFontFamily: design.overlayTextFontFamily,
      overlayTextFontSize: design.overlayTextFontSize,
      overlayTextColor: design.overlayTextColor,
      textureOffsetX: design.textureOffsetX,
      textureOffsetY: design.textureOffsetY,
      textureScale: design.textureScale,
      zoom: design.zoom,
      notas: design.notas,
    }));

    const nuevaCotizacion = await Cotizacion.create({
      usuarioId: req.usuario ? req.usuario.id : null,
      usuarioEmail: req.usuario ? req.usuario.email : null,
      nombre: isMultiple
        ? `Cotización múltiple (${disenos.length} diseños)`
        : firstDesign.nombre || 'Cotización de producto personalizado',
      modelo: isMultiple ? 'multiple' : firstDesign.modelo,
      colorInterior: isMultiple ? null : firstDesign.colorInterior,
      colorBase: isMultiple ? null : firstDesign.colorBase,
      colorExterior: isMultiple ? null : firstDesign.colorExterior,
      colorAsa: isMultiple ? null : firstDesign.colorAsa,
      textInterior: isMultiple ? null : firstDesign.textInterior,
      textExterior: isMultiple ? null : firstDesign.textExterior,
      textureUrl: !isMultiple ? (firstDesign.textureUrl || null) : null,
      overlayText: isMultiple ? null : firstDesign.overlayText,
      overlayTextFontFamily: isMultiple ? null : firstDesign.overlayTextFontFamily,
      overlayTextFontSize: isMultiple ? null : firstDesign.overlayTextFontSize,
      overlayTextColor: isMultiple ? null : firstDesign.overlayTextColor,
      textureOffsetX: isMultiple ? 0 : firstDesign.textureOffsetX,
      textureOffsetY: isMultiple ? 0 : firstDesign.textureOffsetY,
      textureScale: isMultiple ? 1 : firstDesign.textureScale,
      zoom: isMultiple ? 1 : firstDesign.zoom,
      items,
      precio: 0,
      estado: 'pendiente',
      notas: `Cotización con ${disenos.length} diseño(s) pendiente(s) de revisión`,
    });

    res.json({ mensaje: 'Cotización enviada y pendiente', cotizacion: nuevaCotizacion });
  } catch (error) {
    console.error('Error al cotizar producto:', error);
    res.status(500).json({ error: 'Error al cotizar producto' });
  }
};

// Obtener modelos base
exports.obtenerModelos = async (req, res) => {
  try {
    const modelos = [
      { nombre: "Taza", archivo: "/models/taza.glb" },
      { nombre: "Anillo", archivo: "/models/anillo.glb" },
      { nombre: "Plato", archivo: "/models/plato.glb" },
    ];
    res.json(modelos);
  } catch (error) {
    console.error('Error al obtener modelos:', error);
    res.status(500).json({ error: "Error al obtener modelos" });
  }
};

// Obtener cotizaciones del usuario autenticado
exports.obtenerMisCotizaciones = async (req, res) => {
  try {
    if (!req.usuario) {
      return res.status(401).json({ success: false, message: 'No autorizado' });
    }

    const usuarioId = req.usuario.id;
    const cotizaciones = await Cotizacion.findAll({
      where: { usuarioId },
      order: [['createdAt', 'DESC']],
    });

    res.json({ success: true, cotizaciones });
  } catch (error) {
    console.error('Error obteniendo cotizaciones del usuario:', error);
    res.status(500).json({ success: false, message: 'Error al obtener cotizaciones' });
  }
};

// Obtener una cotización por id SOLO si pertenece al usuario (o si es admin)
exports.obtenerCotizacionPorUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const cotizacion = await Cotizacion.findByPk(id);
    if (!cotizacion) {
      return res.status(404).json({ success: false, message: 'Cotización no encontrada' });
    }

    // Si no hay usuario autenticado, negar acceso
    if (!req.usuario) {
      return res.status(401).json({ success: false, message: 'No autorizado' });
    }

    // Permitir si es administrador o propietario
    if (req.usuario.rol === 'administrador' || cotizacion.usuarioId === req.usuario.id) {
      return res.json({ success: true, cotizacion });
    }

    return res.status(403).json({ success: false, message: 'Acceso denegado' });
  } catch (error) {
    console.error('Error obteniendo cotización por usuario:', error);
    res.status(500).json({ success: false, message: 'Error al obtener cotización' });
  }
};
