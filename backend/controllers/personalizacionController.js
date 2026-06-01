const Producto = require("../models/Producto");

// Guardar diseño
exports.guardarDiseno = async (req, res) => {
  try {
    const { imagen, color, especificaciones } = req.body;
    const nuevoDiseno = new Producto({
      imagen,
      color,
      especificaciones,
      estado: "guardado",
    });
    await nuevoDiseno.save();
    res.json({ mensaje: "Diseño guardado correctamente", diseno: nuevoDiseno });
  } catch (error) {
    res.status(500).json({ error: "Error al guardar el diseño" });
  }
};

// Cotizar producto
exports.cotizarProducto = async (req, res) => {
  try {
    const { tipoProducto, materiales, dimensiones } = req.body;

    // Ejemplo de cálculo simple
    const precioBase = 50;
    const costoMaterial = materiales === "oro" ? 200 : 100;
    const costoDimensiones = dimensiones > 10 ? 50 : 20;

    const cotizacion = precioBase + costoMaterial + costoDimensiones;

    res.json({ mensaje: "Cotización generada", precio: cotizacion });
  } catch (error) {
    res.status(500).json({ error: "Error al cotizar producto" });
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
    res.status(500).json({ error: "Error al obtener modelos" });
  }
};
