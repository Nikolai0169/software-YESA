const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Diseño = sequelize.define('Diseño', {
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
  },
  nombre: {
    type: DataTypes.STRING(200),
    allowNull: true,
  },
  modelo: {
    type: DataTypes.STRING(100),
    allowNull: true,
    defaultValue: 'taza',
  },
  imagen: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  color: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  especificaciones: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  estado: {
    type: DataTypes.STRING(50),
    allowNull: false,
    defaultValue: 'guardado',
  },
  metadata: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {},
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
  notas: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'disenos',
  timestamps: true,
});

module.exports = Diseño;
