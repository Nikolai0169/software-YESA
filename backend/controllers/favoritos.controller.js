/**
 * ============================================
 * CONTROLADOR DE FAVORITOS
 * ============================================
 * Operaciones para gestionar la lista de favoritos de un usuario.
 */

const Favorito = require('../models/Favorito');
const Producto = require('../models/Producto');

const construirURLProducto = (producto) => {
  if (!producto) return producto;

  const baseURL = process.env.BACKEND_URL || 'http://localhost:5000';

  if (producto.imagenes && Array.isArray(producto.imagenes)) {
    producto.imagenes = producto.imagenes.map((imagen) => {
      if (!imagen) return imagen;
      return imagen.startsWith('http') ? imagen : `${baseURL}/uploads/${imagen}`;
    });
    if (!producto.imagen && producto.imagenes.length) {
      producto.imagen = producto.imagenes[0];
    }
  }

  if (producto.imagen && !producto.imagen.startsWith('http')) {
    producto.imagen = `${baseURL}/uploads/${producto.imagen}`;
  }

  return producto;
};

const getFavoritos = async (req, res) => {
  try {
    const usuarioId = req.usuario.id;

    const favoritos = await Favorito.findAll({
      where: { usuarioId },
      include: [
        {
          model: Producto,
          as: 'producto',
          attributes: ['id', 'nombre', 'descripcion', 'precio', 'stock', 'imagen', 'imagenes', 'activo', 'categoriaId', 'subcategoriaId']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    const favoritosConURL = favoritos.map((favorito) => {
      const favoritoJSON = favorito.toJSON();
      favoritoJSON.producto = construirURLProducto(favoritoJSON.producto || {});
      return favoritoJSON;
    });

    res.json({
      success: true,
      data: {
        favoritos: favoritosConURL
      }
    });
  } catch (error) {
    console.error('Error en getFavoritos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener favoritos',
      error: error.message
    });
  }
};

const agregarAFavoritos = async (req, res) => {
  try {
    const usuarioId = req.usuario.id;
    const { productoId } = req.body;

    if (!productoId) {
      return res.status(400).json({
        success: false,
        message: 'Se requiere productoId'
      });
    }

    const producto = await Producto.findByPk(productoId);
    if (!producto || !producto.activo) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado o no disponible'
      });
    }

    const [favorito, created] = await Favorito.findOrCreate({
      where: { usuarioId, productoId },
      defaults: { usuarioId, productoId }
    });

    if (!created) {
      return res.status(200).json({
        success: true,
        message: 'Producto ya estaba en favoritos',
        data: { favorito }
      });
    }

    res.status(201).json({
      success: true,
      message: 'Producto agregado a favoritos',
      data: { favorito }
    });
  } catch (error) {
    console.error('Error en agregarAFavoritos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al agregar favorito',
      error: error.message
    });
  }
};

const eliminarFavorito = async (req, res) => {
  try {
    const usuarioId = req.usuario.id;
    const { productoId } = req.params;

    const favorito = await Favorito.findOne({
      where: { usuarioId, productoId }
    });

    if (!favorito) {
      return res.status(404).json({
        success: false,
        message: 'Favorito no encontrado'
      });
    }

    await favorito.destroy();

    res.json({
      success: true,
      message: 'Producto eliminado de favoritos'
    });
  } catch (error) {
    console.error('Error en eliminarFavorito:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar favorito',
      error: error.message
    });
  }
};

module.exports = {
  getFavoritos,
  agregarAFavoritos,
  eliminarFavorito
};
