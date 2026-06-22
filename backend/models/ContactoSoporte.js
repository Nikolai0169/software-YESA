/**
 * ============================================
 * MODELO CONTACTO SOPORTE
 * ============================================
 * Almacena los mensajes de contacto enviados por usuarios a través del formulario de soporte.
 * Se usa en la página FAQ para que los usuarios se comuniquen con el equipo de soporte.
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ContactoSoporte = sequelize.define('ContactoSoporte', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  usuarioId: {
  type: DataTypes.INTEGER,
  allowNull: true,  // null = enviado sin estar logueado
  references: {
    model: 'usuarios',
    key: 'id',
  },
  onDelete: 'SET NULL',
  onUpdate: 'CASCADE',
},
  nombre: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      len: [3, 100],
    },
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      isEmail: true,
    },
  },
  asunto: {
    type: DataTypes.STRING(200),
    allowNull: false,
    validate: {
      len: [5, 200],
    },
  },
  mensaje: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      len: [1, 5000],
    },
  },
  estado: {
    type: DataTypes.ENUM('pendiente', 'revisado', 'respondido', 'cerrado'),
    defaultValue: 'pendiente',
  },
  respuesta: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  fechaRespuesta: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  tableName: 'contacto_soporte',
  timestamps: true,
  underscored: true,
});

module.exports = ContactoSoporte;
