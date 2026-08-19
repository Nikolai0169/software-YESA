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
const path = require('node:path');
const fs = require('node:fs').promises;
const { normalizarRutaImagen } = require('../utils/imagenUrl');
const { resolverImagenProducto } = require('../utils/productoImagen');

// ✅ FUNCIÓN AUXILIAR PARA CONSTRUIR URLs DE IMÁGENES
const construirURLProducto = (producto, req) => {
  if (!producto) return producto;

  const normalizar = (imagen) => normalizarRutaImagen(imagen, req);

  if (producto.imagenes && typeof producto.imagenes === 'string') {
    try {
      producto.imagenes = JSON.parse(producto.imagenes);
    } catch (e) {
      producto.imagenes = [];
    }
  }

  if (producto.imagenes && Array.isArray(producto.imagenes)) {
    producto.imagenes = producto.imagenes.map((imagen) => {
      if (!imagen) return imagen;
      return normalizar(imagen);
    });

    if (!producto.imagen && producto.imagenes.length) {
      producto.imagen = producto.imagenes[0];
    }
  }

  if (producto.imagen) {
    producto.imagen = normalizar(producto.imagen);
  }

  return producto;
};

// ✅ FUNCIÓN AUXILIAR PARA CONSTRUIR URLs EN ARRAYS
const construirURLsProductos = (productos, req) => {
  if (Array.isArray(productos)) {
    return productos.map((producto) => construirURLProducto(producto, req));
  }
  return construirURLProducto(productos, req);
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
    
    const offset = (Number.parseInt(pagina) - 1) * Number.parseInt(limite);
    
    const opciones = {
      where,
      include: [
        { model: Categoria, as: 'categoria', attributes: ['id', 'nombre'] },
        { model: Subcategoria, as: 'subcategoria', attributes: ['id', 'nombre'] }
      ],
      limit: Number.parseInt(limite),
      offset,
      order: [['nombre', 'ASC']]
    };
    
    const { count, rows: productos } = await Producto.findAndCountAll(opciones);
    
    // ✅ CONSTRUIR URLs
    const productosConURL = construirURLsProductos(productos, req);
    
    res.json({
      success: true,
      data: {
        productos: productosConURL,
        paginacion: {
          total: count,
          pagina: Number.parseInt(pagina),
          limite: Number.parseInt(limite),
          totalPaginas: Math.ceil(count / Number.parseInt(limite))
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
    const productoConURL = construirURLProducto(producto.toJSON?.() ?? producto);
    
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
    if (!categoria?.activo) {
      return res.status(400).json({
        success: false,
        message: `La categoría está inactiva o no existe`
      });
    }
    
    const subcategoria = await Subcategoria.findByPk(subcategoriaId);
    if (!subcategoria?.activo) {
      return res.status(400).json({
        success: false,
        message: `La subcategoría está inactiva o no existe`
      });
    }
    
    if (subcategoria.categoriaId !== Number.parseInt(categoriaId)) {
      return res.status(400).json({
        success: false,
        message: `La subcategoría no pertenece a la categoría seleccionada`
      });
    }
    
    if (Number.parseFloat(precio) <= 0) {
      return res.status(400).json({
        success: false,
        message: 'El precio debe ser mayor a 0'
      });
    }
    
    if (Number.parseInt(stock) < 0) {
      return res.status(400).json({
        success: false,
        message: 'El stock no puede ser negativo'
      });
    }
    
    const { imagen, imagenes } = await resolverImagenProducto(req.body, req.files);

    const nuevoProducto = await Producto.create({
      nombre,
      descripcion: descripcion || null,
      precio: Number.parseFloat(precio),
      stock: Number.parseInt(stock) || 0,
      categoriaId: Number.parseInt(categoriaId),
      subcategoriaId: Number.parseInt(subcategoriaId),
      imagen,
      imagenes,
      activo: true
    });
    
    await nuevoProducto.reload({
      include: [
        { model: Categoria, as: 'categoria', attributes: ['id', 'nombre'] },
        { model: Subcategoria, as: 'subcategoria', attributes: ['id', 'nombre'] }
      ]
    });
    
    // ✅ CONSTRUIR URL
    const productoConURL = construirURLProducto(nuevoProducto.toJSON?.() ?? nuevoProducto, req);
    
    res.status(201).json({
      success: true,
      message: 'Producto creado exitosamente',
      data: {
        producto: productoConURL
      }
    });
    
  } catch (error) {
    console.error('Error en crearProducto:', error);

    const eliminarArchivoSubido = async (archivoSubido) => {
      const rutaImagen = path.join(__dirname, '../uploads', archivoSubido);
      try {
        await fs.unlink(rutaImagen);
      } catch (err) {
        console.error('Error al eliminar imagen:', err);
      }
    };

    if (req.file) {
      await eliminarArchivoSubido(req.file.filename);
    }

    if (req.files) {
      const archivos = [
        ...(req.files.imagenes || []),
        ...(req.files.imagen || [])
      ];
      await Promise.all(archivos.map(file => eliminarArchivoSubido(file.filename)));
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
const actualizarCamposProducto = (producto, campos) => {
  const { nombre, descripcion, precio, stock, categoriaId, subcategoriaId, activo } = campos;
  if (nombre) producto.nombre = nombre;
  if (descripcion !== undefined) producto.descripcion = descripcion || null;
  if (precio !== undefined) producto.precio = Number.parseFloat(precio);
  if (stock !== undefined) producto.stock = Number.parseInt(stock);
  if (categoriaId) producto.categoriaId = Number.parseInt(categoriaId);
  if (subcategoriaId) producto.subcategoriaId = Number.parseInt(subcategoriaId);
  if (activo !== undefined) producto.activo = activo;
};

const eliminarImagenesProducto = async (producto) => {
  let imagenes = [];
  if (producto.imagenes && Array.isArray(producto.imagenes)) {
    imagenes = producto.imagenes;
  } else if (producto.imagen) {
    imagenes = [producto.imagen];
  }

  await Promise.all(imagenes.filter(Boolean).map(async (imagen) => {
    const ruta = path.join(__dirname, '../uploads', imagen);
    try {
      await fs.unlink(ruta);
    } catch (err) {
      console.error('Error al eliminar imagen antigua:', err);
    }
  }));
};

const actualizarProducto = async (req, res) => {
  try {
    const { id } = req.params;
    const producto = await Producto.findByPk(id);
    if (!producto) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }
    
    actualizarCamposProducto(producto, req.body);
    
    const { imagen: imagenDesdeRequest, imagenes: nuevasImagenes } = await resolverImagenProducto(req.body, req.files);

    if (nuevasImagenes) {
      await eliminarImagenesProducto(producto);
      producto.imagenes = nuevasImagenes;
      producto.imagen = imagenDesdeRequest;
    }
    
    await producto.save();
    
    await producto.reload({
      include: [
        { model: Categoria, as: 'categoria', attributes: ['id', 'nombre'] },
        { model: Subcategoria, as: 'subcategoria', attributes: ['id', 'nombre'] }
      ]
    });
    
    // ✅ CONSTRUIR URL
    const productoConURL = construirURLProducto(producto.toJSON?.() ?? producto, req);
    
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
    const productoConURL = construirURLProducto(producto.toJSON?.() ?? producto, req);
    
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
const calcularStockActualizado = (stockActual, cantidad, operacion) => {
  const operaciones = {
    aumentar: () => stockActual + cantidad,
    reducir: () => stockActual - cantidad,
    establecer: () => cantidad,
  };
  const calcular = operaciones[operacion];

  if (!calcular) return { error: 'Operación inválida. Usa: aumentar, reducir o establecer' };
  if (operacion === 'reducir' && cantidad > stockActual) {
    return { error: `No hay suficiente stock. Stock actual: ${stockActual}` };
  }

  return { nuevoStock: calcular() };
};

const obtenerDetalleStock = (operacion, stockAnterior, stockNuevo) => {
  const etiquetas = {
    aumentar: 'aumentado',
    reducir: 'reducido',
    establecer: 'establecido',
  };

  return {
    mensaje: `Stock ${etiquetas[operacion]} exitosamente`,
    stockAnterior: operacion === 'establecer' ? null : stockAnterior,
    stockNuevo,
  };
};

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
    
    const cantidadNum = Number.parseInt(cantidad);
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
    
    const stockAnterior = producto.stock;
    const resultadoStock = calcularStockActualizado(stockAnterior, cantidadNum, operacion);
    if (resultadoStock.error) {
      return res.status(400).json({ success: false, message: resultadoStock.error });
    }

    producto.stock = resultadoStock.nuevoStock;
    await producto.save();
    
    // ✅ CONSTRUIR URL
    const productoConURL = construirURLProducto(producto.toJSON?.() ?? producto, req);
    const detalleStock = obtenerDetalleStock(operacion, stockAnterior, producto.stock);
    
    res.json({
      success: true,
      message: detalleStock.mensaje,
      data: {
        producto: productoConURL,
        stockAnterior: detalleStock.stockAnterior,
        stockNuevo: detalleStock.stockNuevo
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