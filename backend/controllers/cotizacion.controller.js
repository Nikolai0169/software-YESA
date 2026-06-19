/**
 * ============================================
 * CONTROLADOR DE COTIZACIONES
 * ============================================
 * Maneja las acciones que solo el administrador puede ver o modificar.
 */

const Cotizacion = require('../models/Cotizacion');
const Usuario = require('../models/Usuario');

// Obtiene todas las cotizaciones registradas para mostrarlas en el panel administrativo.
const getCotizaciones = async (req, res) => {
  try {
    const cotizaciones = await Cotizacion.findAll({
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: Usuario,
          as: 'usuario',
          attributes: ['id', 'nombre', 'email'],
        },
      ],
    });

    res.json({ success: true, cotizaciones });
  } catch (error) {
    console.error('Error obteniendo cotizaciones:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener cotizaciones',
      error: error.message,
    });
  }
};

// Busca una cotización específica por su identificador para mostrar su detalle completo.
const getCotizacionById = async (req, res) => {
  try {
    const { id } = req.params;
    const cotizacion = await Cotizacion.findByPk(id, {
      include: [
        {
          model: Usuario,
          as: 'usuario',
          attributes: ['id', 'nombre', 'email'],
        },
      ],
    });

    if (!cotizacion) {
      return res.status(404).json({
        success: false,
        message: 'Cotización no encontrada',
      });
    }

    res.json({ success: true, cotizacion });
  } catch (error) {
    console.error('Error obteniendo cotización:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener cotización',
      error: error.message,
    });
  }
};

// Actualiza el precio, estado y notas de una cotización ya existente.
const actualizarCotizacion = async (req, res) => {
  try {
    const { id } = req.params;
    const body = req.body || {};
    const { estado, precio, notas } = body;

    const cotizacion = await Cotizacion.findByPk(id);
    if (!cotizacion) {
      return res.status(404).json({
        success: false,
        message: 'Cotización no encontrada',
      });
    }

    const precioNumerico = precio !== undefined && precio !== null ? Number(precio) : undefined;

    if (precioNumerico !== undefined && Number.isNaN(precioNumerico)) {
      return res.status(400).json({
        success: false,
        message: 'El precio de cotización debe ser un número válido',
      });
    }

    if (precioNumerico !== undefined && precioNumerico <= 0) {
      return res.status(400).json({
        success: false,
        message: 'El precio de cotización debe ser mayor a 0',
      });
    }

    const estadoActualizado = estado || (precioNumerico !== undefined && cotizacion.estado === 'pendiente' ? 'cotizado' : cotizacion.estado);

    await cotizacion.update({
      estado: estadoActualizado,
      precio: precioNumerico !== undefined ? precioNumerico : cotizacion.precio,
      notas: notas !== undefined ? notas : cotizacion.notas,
    });

    res.json({ success: true, cotizacion });
  } catch (error) {
    console.error('Error actualizando cotización:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar cotización',
      error: error.message,
    });
  }
};

const eliminarCotizacion = async (req, res) => {
  try {
    const { id } = req.params;
    const cotizacion = await Cotizacion.findByPk(id);

    if (!cotizacion) {
      return res.status(404).json({
        success: false,
        message: 'Cotización no encontrada',
      });
    }

    if (cotizacion.estado !== 'rechazado') {
      return res.status(400).json({
        success: false,
        message: 'Solo se pueden eliminar cotizaciones con estado rechazado',
      });
    }

    await cotizacion.destroy();

    res.json({
      success: true,
      message: 'Cotización eliminada correctamente',
      id: cotizacion.id,
    });
  } catch (error) {
    console.error('Error eliminando cotización:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar cotización',
      error: error.message,
    });
  }
};

const eliminarCotizaciones = async (req, res) => {
  try {
    const { ids } = req.body || {};

    if (Array.isArray(ids) && ids.length > 0) {
      const cotizaciones = await Cotizacion.findAll({ where: { id: ids } });

      if (cotizaciones.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'No se encontraron cotizaciones para eliminar',
        });
      }

      const noRechazadas = cotizaciones.filter((cotizacion) => cotizacion.estado !== 'rechazado');
      if (noRechazadas.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Solo se pueden eliminar cotizaciones con estado rechazado',
        });
      }

      await Cotizacion.destroy({ where: { id: ids, estado: 'rechazado' } });

      return res.json({
        success: true,
        message: 'Cotizaciones eliminadas correctamente',
        eliminadas: ids.length,
      });
    }

    const cotizacionesRechazadas = await Cotizacion.findAll({ where: { estado: 'rechazado' } });
    if (cotizacionesRechazadas.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No hay cotizaciones rechazadas para eliminar',
      });
    }

    await Cotizacion.destroy({ where: { estado: 'rechazado' } });

    res.json({
      success: true,
      message: 'Cotizaciones rechazadas eliminadas correctamente',
      eliminadas: cotizacionesRechazadas.length,
    });
  } catch (error) {
    console.error('Error eliminando cotizaciones:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar cotizaciones',
      error: error.message,
    });
  }
};

module.exports = {
  getCotizaciones,
  getCotizacionById,
  actualizarCotizacion,
  eliminarCotizacion,
  eliminarCotizaciones,
};
