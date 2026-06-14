/**
 * Controlador de reseñas
 */
const Resena = require('../models/Resena');

exports.crearResena = async (req, res) => {
  try {
    const { productoId, usuarioId, nombre, email, calificacion, comentario } = req.body;
    if (!productoId || !calificacion || !comentario) {
      return res.status(400).json({ success: false, message: 'Faltan campos requeridos' });
    }

    const nueva = await Resena.create({
      productoId,
      usuarioId: usuarioId || null,
      nombre: nombre || null,
      email: email || null,
      calificacion,
      comentario,
      aprobado: true,
    });

    return res.status(201).json({ success: true, message: 'Reseña creada', data: nueva });
  } catch (error) {
    console.error('Error crear reseña:', error);
    return res.status(500).json({ success: false, message: 'Error al crear reseña' });
  }
};

exports.obtenerResenasPorProducto = async (req, res) => {
  try {
    const { id } = req.params; // producto id
    const resenas = await Resena.findAll({ where: { productoId: id, aprobado: true }, order: [['createdAt', 'DESC']] });
    return res.status(200).json({ success: true, data: resenas });
  } catch (error) {
    console.error('Error obtener reseñas:', error);
    return res.status(500).json({ success: false, message: 'Error al obtener reseñas' });
  }
};
