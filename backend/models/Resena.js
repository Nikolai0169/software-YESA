/**
 * MODELO Reseña
 */
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Resena = sequelize.define('Resena', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  productoId: { type: DataTypes.INTEGER, allowNull: false },
  usuarioId: { type: DataTypes.INTEGER, allowNull: true },
  nombre: { type: DataTypes.STRING(100), allowNull: true },
  email: { type: DataTypes.STRING(100), allowNull: true, validate: { isEmail: true } },
  calificacion: { type: DataTypes.DECIMAL(2, 1), allowNull: false, validate: { min: 0.5, max: 5 } },
  comentario: { type: DataTypes.TEXT, allowNull: false },
  aprobado: { type: DataTypes.BOOLEAN, defaultValue: true },
}, {
  tableName: 'resenas',
  timestamps: true,
  underscored: true,
});

module.exports = Resena;
