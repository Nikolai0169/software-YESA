/**
 * ============================================
 * MODELO FAVORITO
 * ============================================
 * Tabla que guarda los productos favoritos de cada usuario.
 * Cada fila representa un favorito: usuario + producto.
 * Se usa para persistir la lista de favoritos en el backend.
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Favorito = sequelize.define('Favorito', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  usuarioId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'usuarios',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
  },
  productoId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'productos',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
  }
}, {
  tableName: 'favoritos',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['usuarioId', 'productoId']
    }
  ]
});

module.exports = Favorito;
