/**
 * ============================================
 * CONTROLADOR DE PRODUCTOS (Admin)
 * ============================================
 * CRUD completo de productos con subida de imágenes (Multer).
 * Incluye: listar, ver, crear, actualizar, toggle, eliminar, gestión de stock.
 * Solo accesible por administradores (protegido por middleware checkRole).
 * Las rutas están definidas en routes/admin.routes.js
 */

const Producto = require('../models/Producto');
const Categoria = require('../models/Categoria');
const Subcategoria = require('../models/Subcategoria');
const path = require('path');
const fs = require('fs').promises;

// ✅ FUNCIÓN AUXILIAR PARA CONSTRUIR URLs DE IMÁGENES
const construirURLProducto = (producto) => {
  if (!producto) return producto;
  
  if (producto.imagen && !producto.imagen.startsWith('http')) {
    const baseURL = process.env.BACKEND_URL || 'http://localhost:5000';
    producto.imagen = `${baseURL}/uploads/${producto.imagen}`;
  }
  return producto;
};

// ✅ FUNCIÓN AUXILIAR PARA CONSTRUIR URLs EN ARRAYS
const construirURLsProductos = (productos) => {
  if (Array.isArray(productos)) {
    return productos.map(construirURLProducto);
  }
  return construirURLProducto(productos);
};

/**
 * Obtener todos los productos (admin)
 */
const getProductos = async (req, res) => {
  try {
    const { 
      categoriaId, 
      subcategoriaId, 
      activo, 
      conStock,
      buscar,
      pagina = 1,
      limite = 100
    } = req.query;
    
    const where = {};
    if (categoriaId) where.categoriaId = categoriaId;
    if (subcategoriaId) where.subcategoriaId = subcategoriaId;
    if (activo !== undefined) where.activo = activo === 'true';
    if (conStock === 'true') where.stock = { [require('sequelize').Op.gt]: 0 };
    
    if (buscar) {
      const { Op } = require('sequelize');
      where[Op.or] = [
        { nombre: { [Op.like]: `%${buscar}%` } },
        { descripcion: { [Op.like]: `%${buscar}%` } }
      ];
    }
    
    const offset = (parseInt(pagina) - 1) * parseInt(limite);
    
    const opciones = {
      where,
      include: [
        { model: Categoria, as: 'categoria', attributes: ['id', 'nombre'] },
        { model: Subcategoria, as: 'subcategoria', attributes: ['id', 'nombre'] }
      ],
      limit: parseInt(limite),
      offset,
      order: [['nombre', 'ASC']]
    };
    
    const { count, rows: productos } = await Producto.findAndCountAll(opciones);
    
    // ✅ CONSTRUIR URLs
    const productosConURL = construirURLsProductos(productos);
    
    res.json({
      success: true,
      data: {
        productos: productosConURL,
        paginacion: {
          total: count,
          pagina: parseInt(pagina),
          limite: parseInt(limite),
          totalPaginas: Math.ceil(count / parseInt(limite))
        }
      }
    });
    
  } catch (error) {
    console.error('Error en getProductos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener productos',
      error: error.message
    });
  }
};

/**
 * Obtener un producto por ID
 */
const getProductoById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const producto = await Producto.findByPk(id, {
      include: [
        { model: Categoria, as: 'categoria', attributes: ['id', 'nombre', 'activo'] },
        { model: Subcategoria, as: 'subcategoria', attributes: ['id', 'nombre', 'activo'] }
      ]
    });
    
    if (!producto) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }
    
    // ✅ CONSTRUIR URL
    const productoConURL = construirURLProducto(producto.toJSON ? producto.toJSON() : producto);
    
    res.json({
      success: true,
      data: {
        producto: productoConURL
      }
    });
    
  } catch (error) {
    console.error('Error en getProductoById:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener producto',
      error: error.message
    });
  }
};

/**
 * Crear nuevo producto
 */
const crearProducto = async (req, res) => {
  try {
    const { nombre, descripcion, precio, stock, categoriaId, subcategoriaId } = req.body;
    
    if (!nombre || !precio || !categoriaId || !subcategoriaId) {
      return res.status(400).json({
        success: false,
        message: 'Faltan campos requeridos: nombre, precio, categoriaId y subcategoriaId'
      });
    }
    
    const categoria = await Categoria.findByPk(categoriaId);
    if (!categoria || !categoria.activo) {
      return res.status(400).json({
        success: false,
        message: `La categoría está inactiva o no existe`
      });
    }
    
    const subcategoria = await Subcategoria.findByPk(subcategoriaId);
    if (!subcategoria || !subcategoria.activo) {
      return res.status(400).json({
        success: false,
        message: `La subcategoría está inactiva o no existe`
      });
    }
    
    if (subcategoria.categoriaId !== parseInt(categoriaId)) {
      return res.status(400).json({
        success: false,
        message: `La subcategoría no pertenece a la categoría seleccionada`
      });
    }
    
    if (parseFloat(precio) <= 0) {
      return res.status(400).json({
        success: false,
        message: 'El precio debe ser mayor a 0'
      });
    }
    
    if (parseInt(stock) < 0) {
      return res.status(400).json({
        success: false,
        message: 'El stock no puede ser negativo'
      });
    }
    
    const imagen = req.file ? req.file.filename : null;
    
    const nuevoProducto = await Producto.create({
      nombre,
      descripcion: descripcion || null,
      precio: parseFloat(precio),
      stock: parseInt(stock) || 0,
      categoriaId: parseInt(categoriaId),
      subcategoriaId: parseInt(subcategoriaId),
      imagen,
      activo: true
    });
    
    await nuevoProducto.reload({
      include: [
        { model: Categoria, as: 'categoria', attributes: ['id', 'nombre'] },
        { model: Subcategoria, as: 'subcategoria', attributes: ['id', 'nombre'] }
      ]
    });
    
    // ✅ CONSTRUIR URL
    const productoConURL = construirURLProducto(nuevoProducto.toJSON ? nuevoProducto.toJSON() : nuevoProducto);
    
    res.status(201).json({
      success: true,
      message: 'Producto creado exitosamente',
      data: {
        producto: productoConURL
      }
    });
    
  } catch (error) {
    console.error('Error en crearProducto:', error);
    
    if (req.file) {
      const rutaImagen = path.join(__dirname, '../uploads', req.file.filename);
      try {
        await fs.unlink(rutaImagen);
      } catch (err) {
        console.error('Error al eliminar imagen:', err);
      }
    }
    
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Error de validación',
        errores: error.errors.map(e => e.message)
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error al crear producto',
      error: error.message
    });
  }
};

/**
 * Actualizar producto
 */
const actualizarProducto = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion, precio, stock, categoriaId, subcategoriaId, activo } = req.body;
    
    const producto = await Producto.findByPk(id);
    if (!producto) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }
    
    if (nombre) producto.nombre = nombre;
    if (descripcion !== undefined) producto.descripcion = descripcion || null;
    if (precio !== undefined) producto.precio = parseFloat(precio);
    if (stock !== undefined) producto.stock = parseInt(stock);
    if (categoriaId) producto.categoriaId = parseInt(categoriaId);
    if (subcategoriaId) producto.subcategoriaId = parseInt(subcategoriaId);
    if (activo !== undefined) producto.activo = activo;
    
    if (req.file) {
      if (producto.imagen) {
        const rutaVieja = path.join(__dirname, '../uploads', producto.imagen);
        try {
          await fs.unlink(rutaVieja);
        } catch (err) {
          console.error('Error al eliminar imagen antigua:', err);
        }
      }
      producto.imagen = req.file.filename;
    }
    
    await producto.save();
    
    await producto.reload({
      include: [
        { model: Categoria, as: 'categoria', attributes: ['id', 'nombre'] },
        { model: Subcategoria, as: 'subcategoria', attributes: ['id', 'nombre'] }
      ]
    });
    
    // ✅ CONSTRUIR URL
    const productoConURL = construirURLProducto(producto.toJSON ? producto.toJSON() : producto);
    
    res.json({
      success: true,
      message: 'Producto actualizado exitosamente',
      data: {
        producto: productoConURL
      }
    });
    
  } catch (error) {
    console.error('Error en actualizarProducto:', error);
    
    if (req.file) {
      const rutaImagen = path.join(__dirname, '../uploads', req.file.filename);
      try {
        await fs.unlink(rutaImagen);
      } catch (err) {
        console.error('Error al eliminar imagen:', err);
      }
    }
    
    res.status(500).json({
      success: false,
      message: 'Error al actualizar producto',
      error: error.message
    });
  }
};

/**
 * Activar/Desactivar producto (toggle)
 * Ruta: PATCH /api/admin/productos/:id/toggle
 */
const toggleProducto = async (req, res) => {
  try {
    const { id } = req.params;
    
    const producto = await Producto.findByPk(id);
    
    if (!producto) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }
    
    producto.activo = !producto.activo;
    await producto.save();
    
    // ✅ CONSTRUIR URL
    const productoConURL = construirURLProducto(producto.toJSON ? producto.toJSON() : producto);
    
    res.json({
      success: true,
      message: `Producto ${producto.activo ? 'activado' : 'desactivado'} exitosamente`,
      data: {
        producto: productoConURL
      }
    });
    
  } catch (error) {
    console.error('Error en toggleProducto:', error);
    res.status(500).json({
      success: false,
      message: 'Error al cambiar estado del producto',
      error: error.message
    });
  }
};

/**
 * Eliminar producto
 * Ruta: DELETE /api/admin/productos/:id
 */
const eliminarProducto = async (req, res) => {
  try {
    const { id } = req.params;
    
    const producto = await Producto.findByPk(id);
    
    if (!producto) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }
    
    await producto.destroy();
    
    res.json({
      success: true,
      message: 'Producto eliminado exitosamente'
    });
    
  } catch (error) {
    console.error('Error en eliminarProducto:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar producto',
      error: error.message
    });
  }
};

/**
 * Actualizar stock de un producto
 * Ruta: PATCH /api/admin/productos/:id/stock
 * Body: { cantidad, operacion: 'aumentar' | 'reducir' | 'establecer' }
 */
const actualizarStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { cantidad, operacion } = req.body;
    
    if (!cantidad || !operacion) {
      return res.status(400).json({
        success: false,
        message: 'Se requiere cantidad y operación'
      });
    }
    
    const cantidadNum = parseInt(cantidad);
    if (cantidadNum < 0) {
      return res.status(400).json({
        success: false,
        message: 'La cantidad no puede ser negativa'
      });
    }
    
    const producto = await Producto.findByPk(id);
    
    if (!producto) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }
    
    let nuevoStock;
    
    switch (operacion) {
      case 'aumentar':
        nuevoStock = producto.stock + cantidadNum;
        break;
      case 'reducir':
        if (cantidadNum > producto.stock) {
          return res.status(400).json({
            success: false,
            message: `No hay suficiente stock. Stock actual: ${producto.stock}`
          });
        }
        nuevoStock = producto.stock - cantidadNum;
        break;
      case 'establecer':
        nuevoStock = cantidadNum;
        break;
      default:
        return res.status(400).json({
          success: false,
          message: 'Operación inválida. Usa: aumentar, reducir o establecer'
        });
    }
    
    producto.stock = nuevoStock;
    await producto.save();
    
    // ✅ CONSTRUIR URL
    const productoConURL = construirURLProducto(producto.toJSON ? producto.toJSON() : producto);
    
    res.json({
      success: true,
      message: `Stock ${operacion === 'aumentar' ? 'aumentado' : operacion === 'reducir' ? 'reducido' : 'establecido'} exitosamente`,
      data: {
        producto: productoConURL,
        stockAnterior: operacion === 'establecer' ? null : (operacion === 'aumentar' ? producto.stock - cantidadNum : producto.stock + cantidadNum),
        stockNuevo: producto.stock
      }
    });
    
  } catch (error) {
    console.error('Error en actualizarStock:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar stock',
      error: error.message
    });
  }
};

// Exporta todas las funciones del controlador
module.exports = {
  getProductos,
  getProductoById,
  crearProducto,
  actualizarProducto,
  toggleProducto,
  eliminarProducto,
  actualizarStock
};