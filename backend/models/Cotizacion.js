/**
 * ============================================
 * MODELO COTIZACIÓN
 * ============================================
 * Guarda las cotizaciones generadas desde el módulo de personalización.
 * Utiliza Sequelize para mapear la tabla MySQL 'cotizaciones'.
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

// Define la tabla de cotizaciones y sus campos principales para persistir diseños y precios cotizados.
const Cotizacion = sequelize.define('Cotizacion', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  usuarioId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  usuarioEmail: {
    type: DataTypes.STRING(200),
    allowNull: true,
    validate: {
      isEmail: {
        msg: 'El correo del usuario debe ser un email válido',
      },
    },
  },
  nombre: {
    type: DataTypes.STRING(200),
    allowNull: true,
  },
  modelo: {
    type: DataTypes.STRING(100),
    allowNull: false,
    defaultValue: 'taza',
  },
  colorInterior: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },
  colorBase: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },
  colorExterior: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },
  colorAsa: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },
  textInterior: {
    type: DataTypes.STRING(200),
    allowNull: true,
  },
  textExterior: {
    type: DataTypes.STRING(200),
    allowNull: true,
  },
  textureUrl: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  overlayText: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  overlayTextFontFamily: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  overlayTextFontSize: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  overlayTextColor: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },
  // Convierte el arreglo de diseños guardados en texto JSON para almacenarlo en la base de datos.
  items: {
    type: DataTypes.TEXT('long'),
    allowNull: true,
    get() {
      const raw = this.getDataValue('items');
      return raw ? JSON.parse(raw) : null;
    },
    set(value) {
      this.setDataValue('items', value ? JSON.stringify(value) : null);
    },
  },
  textureOffsetX: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0,
  },
  textureOffsetY: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0,
  },
  textureScale: {
    type: DataTypes.FLOAT,
    allowNull: true,
    defaultValue: 1,
  },
  zoom: {
    type: DataTypes.FLOAT,
    allowNull: true,
    defaultValue: 1,
  },
  precio: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
  },
  estado: {
    type: DataTypes.ENUM('pendiente', 'cotizado', 'convertida', 'rechazado'),
    allowNull: false,
    defaultValue: 'pendiente',
  },
  notas: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'cotizaciones',
  timestamps: true,
});

module.exports = Cotizacion;
