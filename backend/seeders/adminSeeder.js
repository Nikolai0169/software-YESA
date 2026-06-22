/**
 * ============================================
 * SEEDER - DATOS COMPLETOS DEL SISTEMA
 * ============================================
 * Este archivo ejecuta el seeder de datos completos
 * Se ejecuta automáticamente al iniciar el servidor
 */

// Importar el seeder de datos completos
const { seedDatosCompletos } = require('./datosCompletos.seeder');

const isTestEnv = process.env.NODE_ENV === 'test';
const log = isTestEnv ? () => {} : console.log.bind(console);

/**
 * Función principal que ejecuta todos los seeders
 */
const seedAdmin = async () => {
  try {
    // Ejecutar el seeder de datos completos
    await seedDatosCompletos();
  } catch (error) {
    console.error('❌ Error al ejecutar seeder:', error.message);
    throw error;
  }
};

/**
 * Función principal que ejecuta todos los seeders
 */
const runSeeders = async () => {
  try {
    log('\n🌱 Ejecutando seeders...\n');
    
    // Ejecutar seeder de datos completos
    await seedDatosCompletos();
    
    log('\n✅ Seeders ejecutados correctamente\n');
    
  } catch (error) {
    if (!isTestEnv) {
      console.error('\n❌ Error al ejecutar seeders:', error.message);
    }
    throw error;
  }
};

// Exportar las funciones
module.exports = {
  seedAdmin,
  runSeeders
};
