/**
 * ============================================
 * SEEDER COMPLETO - DATOS DE PRUEBA
 * ============================================
 * Script para poblar la base de datos con datos de prueba completos
 * 
 * Crea:
 * - 1 Administrador
 * - 1 Auxiliar
 * - 5 Clientes
 * - 5 Categorías
 * - 15 Subcategorías (3 por categoría)
 * - 75 Productos (5 por subcategoría)
 */

const Usuario = require('../models/Usuario');
const Categoria = require('../models/Categoria');
const Subcategoria = require('../models/Subcategoria');
const Producto = require('../models/Producto');
const fs = require('fs').promises;
const path = require('path');

/**
 * Función principal del seeder
 */
const seedDatosCompletos = async () => {
  try {
    console.log('\n🌱 ========================================');
    console.log('   INICIANDO SEEDER DE DATOS COMPLETOS');
    console.log('========================================\n');

    // ==========================================
    // 1. CREAR USUARIOS
    // ==========================================
    console.log('👥 1. CREANDO USUARIOS...\n');

    // ADMINISTRADOR
    const adminExistente = await Usuario.findOne({ where: { email: 'admin@yesa.com' } });
    if (!adminExistente) {
      await Usuario.create({
        nombre: 'Administrador',
        apellido: 'Sistema',
        email: 'admin@yesa.com',
        password: 'admin1234',
        rol: 'administrador',
        telefono: '3001234567',
        direccion: 'YESA - Oficina Principal',
        activo: true
      });
      console.log('✅ Administrador creado');
      console.log('   📧 Usuario: admin@yesa.com');
      console.log('   🔑 Password: admin1234\n');
    } else {
      console.log('✅ Administrador ya existe\n');
    }

    // AUXILIAR
    const auxiliarExistente = await Usuario.findOne({ where: { email: 'auxiliar@yesa.com' } });
    if (!auxiliarExistente) {
      await Usuario.create({
        nombre: 'Auxiliar',
        apellido: 'Soporte',
        email: 'auxiliar@yesa.com',
        password: 'aux123',
        rol: 'auxiliar',
        telefono: '3009876543',
        direccion: 'YESA - Oficina Auxiliar',
        activo: true
      });
      console.log('✅ Auxiliar creado');
      console.log('   📧 Usuario: auxiliar@yesa.com');
      console.log('   🔑 Password: aux123\n');
    } else {
      console.log('✅ Auxiliar ya existe\n');
    }

    // CLIENTES (5)
    console.log('👤 Creando 5 clientes...');
    for (let i = 1; i <= 5; i++) {
      const clienteExistente = await Usuario.findOne({ where: { email: `cliente${i}@yesa.com` } });
      if (!clienteExistente) {
        await Usuario.create({
          nombre: `Cliente ${i}`,
          apellido: `Apellido ${i}`,
          email: `cliente${i}@yesa.com`,
          password: `cliente${i}`,
          rol: 'cliente',
          telefono: `300${1000000 + i}`,
          direccion: `Dirección del Cliente ${i}, Bogotá`,
          activo: true
        });
        console.log(`   ✅ Cliente ${i} - Email: cliente${i}@yesa.com - Pass: cliente${i}`);
      }
    }
    
    const usuariosCreados = await Usuario.count();
    console.log(`\n✅ Total: ${usuariosCreados} usuarios en la base de datos\n`);

    // ==========================================
    // 2. CREAR CATEGORÍAS
    // ==========================================
    console.log('📁 2. CREANDO CATEGORÍAS...\n');

    const categoriasExistentes = await Categoria.count();
    
    if (categoriasExistentes > 0) {
      console.log('⚠️  Ya existen categorías en la base de datos.\n');
    } else {
      const categoriasData = [
        {
          nombre: 'Alcancias',
          descripcion: 'Hermosas alcancías artesanales'
        },
        {
          nombre: 'Pocillos',
          descripcion: 'Pocillos unicos hechos a mano'
        },
        {
          nombre: 'Floreros',
          descripcion: 'Floreros decorativos únicos'
        },
        {
          nombre: 'Platos Llanos',
          descripcion: 'Platos llanos elegantes'
        },
        {
          nombre: 'Platos Hondos',
          descripcion: 'Platos hondos para sopas'
        },
        {
          nombre: 'Vasijas',
          descripcion: 'Vasijas tradicionales artesanales'
        },
      ];

      const categorias = [];
      for (const catData of categoriasData) {
        const categoria = await Categoria.create(catData);
        categorias.push(categoria);
        console.log(`   ✅ ${categoria.nombre}`);
      }
      console.log('\n✅ Total: 6 categorías creadas\n');

      // ==========================================
      // 3. CREAR SUBCATEGORÍAS (3 por categoría)
      // ==========================================
      console.log('📂 3. CREANDO SUBCATEGORÍAS...\n');

      const subcategoriasData = {
        'Alcancias': [
          { nombre: 'Cerámica', descripcion: 'Alcancias de larga duración hechas con cerámica' },
          { nombre: 'Yeso', descripcion: 'Alcancias de yeso' },
          { nombre: 'Metal', descripcion: 'Alcancias de metal mas resistentes' }
        ],
        'Pocillos': [
          { nombre: 'Cerámica', descripcion: 'Pocillos de larga duración hechos con cerámica' },
          { nombre: 'Porcelana', descripcion: 'Una variante mas fina, ligera y elegante' },
          { nombre: 'Vidrio', descripcion: 'Pocillos de vidrio, permite ver el contenido y jugar con estilos unicos' }
        ],
        'Floreros': [
          { nombre: 'Vidrio', descripcion: 'Floreros de vidrio, versatil y funcional para ver la calidad del agua' },
          { nombre: 'Cerámica', descripcion: 'Floreros de cerámica, resistentes con estetica calida' },
          { nombre: 'Cristal', descripcion: 'Floreros de cristal para aportar un toque de lujo y elegancia' }
        ],
        'Vasijas': [
          { nombre: 'Cerámica', descripcion: 'Vasijas de larga duración hechas con cerámica' },
          { nombre: 'Arcilla', descripcion: 'Vasijas de arcilla' },
          { nombre: 'Metal', descripcion: 'Vasijas de metal mas resistentes' }
        ],
        'Platos Llanos': [
          { nombre: 'Cerámica', descripcion: 'Platos llanos de cerámica' },
          { nombre: 'Porcelana', descripcion: 'Platos llanos de porcelana' },
          { nombre: 'Vidrio', descripcion: 'Platos llanos de vidrio' }
        ],
        'Platos Hondos': [
          { nombre: 'Cerámica', descripcion: 'Platos hondos de cerámica' },
          { nombre: 'Porcelana', descripcion: 'Platos hondos de porcelana' },
          { nombre: 'Vidrio', descripcion: 'Platos hondos de vidrio' }
        ],
      };

      const subcategorias = [];
      for (const categoria of categorias) {
        console.log(`📁 ${categoria.nombre}:`);
        const subsData = subcategoriasData[categoria.nombre];
        if (!Array.isArray(subsData)) {
          throw new Error(`No hay subcategorías definidas para la categoría '${categoria.nombre}'. Revisa subcategoriasData.`);
        }
        
        for (const subData of subsData) {
          const subcategoria = await Subcategoria.create({
            nombre: subData.nombre,
            descripcion: subData.descripcion,
            categoriaId: categoria.id,
            activo: true
          });
          subcategorias.push(subcategoria);
          console.log(`   ✅ ${subcategoria.nombre}`);
        }
        console.log('');
      }
      console.log('✅ Total: 15 subcategorías creadas\n');

      // ==========================================
      // 4. CREAR PRODUCTOS (2 por subcategoría)
      // ==========================================
      console.log('📦 4. CREANDO PRODUCTOS...\n');

      const productosData = {
        Alcancias: {
          'Cerámica': [
            { nombre: 'Alcancía de Cerámica básica', descripcion: 'Recipiente tradicional y sencillo para ahorrar, con acabado cerámico liso.', precio: 28000, stock: 14 },
            { nombre: 'Alcancía de Ceramica en forma de Cerdito', descripcion: 'El clásico diseño de cerdito elaborado en cerámica resistente.', precio: 30000, stock: 10 },
          ],
          Yeso: [
            { nombre: 'Alcancía de Yeso básica', descripcion: 'Opción económica y ligera de forma estándar, fabricada en yeso.', precio: 38000, stock: 5 },
            { nombre: 'Alcancía de Yeso con forma de animal', descripcion: 'Figura animal decorativa de yeso, ideal para personalizar o pintar.', precio: 42000, stock: 2 },
          ],
          Metal: [
            { nombre: 'Alcancía de Metal básica', descripcion: 'Caja metálica duradera y segura con un diseño funcional', precio: 17000, stock: 8 },
            { nombre: 'Alcancía de Metal con diseño de superhéroe', descripcion: 'Contenedor metálico decorado con motivos de superhéroes, ideal para niños.', precio: 22000, stock: 4 },
          ]
        },
        Pocillos: {
          'Cerámica': [
            { nombre: 'Pocillo Artesanal Violeta', descripcion: 'Único e irrepetible. Hecho a mano con un esmalte vibrante', precio: 17000, stock: 8 },
            { nombre: 'Pocillo Café Especial', descripcion: 'Pocillo de tonalidad Café perfecto para bebidas frias o calientes', precio: 19000, stock: 10 },
          ],
          Porcelana: [
            { nombre: 'Set de Pocillos', descripcion: 'Elegancia y ligereza en tu mesa. Piezas de alta resistencia con acabado minimalista.', precio: 48000, stock: 4 },
            { nombre: 'Pocillo Tintero', descripcion: 'El tamaño perfecto para tu espresso. Conserva el calor con un diseño clásico y fino.', precio: 19000, stock: 15 },
          ],
          Vidrio: [
            { nombre: 'Pocillo de Calavera', descripcion: 'Diseño de calavera para darle un aire distintivo a tu mesa', precio: 23000, stock: 7 },
            { nombre: 'Pocillo Tintero de Vidrio', descripcion: 'Perfecto para los amantes del café, con un vidrio resistente', precio: 19000, stock: 10 },
          ]
        },
        Floreros: {
          Vidrio: [
            { nombre: 'Florero de Vidrio Moderno', descripcion: 'Estilo minimalista y versátil. Su transparencia pura resalta la belleza natural de cualquier ramo.', precio: 40000, stock: 5 },
            { nombre: 'Florero de Vidrio Acanalado', descripcion: 'Textura clásica con un toque contemporáneo. Crea juegos de luz elegantes que realzan tus espacios.', precio: 45000, stock: 10 },
          ],
          'Cerámica': [
            { nombre: 'Florero Vintage con orejas', descripcion: 'Encanto artesanal con historia. Un diseño tradicional que aporta calidez y carácter a tu hogar.', precio: 36000, stock: 11 },
            { nombre: 'Florero en cerámica con lineas blancas', descripcion: 'Modernidad y contraste. El equilibrio perfecto entre la textura del barro y un diseño geométrico limpio.', precio: 40000, stock: 8 },
          ],
          Cristal: [
            { nombre: 'Florero alto de cristal', descripcion: 'Máximo brillo y sofisticación. Su altura y claridad lo hacen la pieza central ideal para eventos y cenas.', precio: 42000, stock: 8 },
            { nombre: 'Florero Venecia', descripcion: 'Fusión de materiales naturales. La calidez de la madera unida a la elegancia del cristal para un estilo orgánico.', precio: 48000, stock: 12 },
          ]
        },
        Vasijas: {
          'Cerámica': [
            { nombre: 'Jarra artesanal esmaltada', descripcion: 'Estilo y color para tu mesa. Ideal para servir o decorar con un toque brillante.', precio: 65000, stock: 10 },
            { nombre: 'Bowl decorativo mate', descripcion: 'Textura suave y diseño moderno. La pieza perfecta para centros de mesa con carácter.', precio: 55000, stock: 8 },
          ],
          Arcilla: [
            { nombre: 'Olla de barro curado', descripcion: 'Tradición en tu cocina. Conserva el calor y el sabor auténtico de tus preparaciones.', precio: 50000, stock: 5 },
            { nombre: 'Cazuela pequeña', descripcion: 'El encanto de lo rústico. Ideal para porciones individuales o salsas artesanales.', precio: 30000, stock: 15 },
          ],
          Metal: [
            { nombre: 'Copetín de metal martillado', descripcion: 'Elegancia artesanal. Su textura única resalta en cualquier celebración.', precio: 47000, stock: 10 },
            { nombre: 'Mini-balde de latón soldado', descripcion: 'Versátil y duradero. Un toque industrial-chic para organizar tus espacios.', precio: 40000, stock: 7 },
          ]
        },
        'Platos Llanos': {
          'Cerámica': [
            { nombre: 'Plato de gres con esmalte reactivo', descripcion: 'Arte puro en cada comida. Acabados únicos con colores que cobran vida.', precio: 45000, stock: 16 },
            { nombre: 'Plato irregular', descripcion: 'Belleza artesanal sin moldes. Diseño orgánico que celebra la imperfección hecha a mano.', precio: 40000, stock: 7 },
          ],
          Porcelana: [
            { nombre: 'Plato de porcelana con borde organico', descripcion: 'Delicadeza y estilo natural. La resistencia de la porcelana con un diseño único.', precio: 47000, stock: 8 },
            { nombre: 'Plato de porcelana con calcomania azul', descripcion: 'Clásico renovado. Un detalle de color artesanal para una mesa sofisticada.', precio: 30000, stock: 10 },
          ],
          Vidrio: [
            { nombre: 'Plato de vidrio templado', descripcion: 'Transparencia y máxima resistencia. Un básico duradero y elegante para el diario.', precio: 17000, stock: 6 },
            { nombre: 'Plato de Vidrio Craquelado', descripcion: 'Captura la luz en tu mesa. Efectos visuales increíbles para presentaciones especiales.', precio: 28000, stock: 13 },
          ]
        },
        'Platos Hondos': {
          'Cerámica': [
            { nombre: 'Bowl con acabado crudo', descripcion: 'Conexión con la tierra. Interior brillante para higiene y exterior rústico al tacto.', precio: 45000, stock: 5 },
            { nombre: 'Cuenco con base de pedestal', descripcion: 'Elevación y estilo. Una pieza escultural que resalta tus mejores recetas.', precio: 52000, stock: 12 },
          ],
          Porcelana: [
            { nombre: 'Cuenco de Tipo Pasta', descripcion: 'Diseño funcional y amplio. El aliado perfecto para pastas, cremas y ensaladas.', precio: 37000, stock: 10 },
            { nombre: 'Cuenco para Té', descripcion: 'Inspiración zen para tu mesa. Compacto y acogedor, ideal para sopas o desayunos.', precio: 30000, stock: 11 },
          ],
          Vidrio: [
            { nombre: 'Bol de vidrio soplado', descripcion: 'Esencia artesanal. Variaciones naturales que hacen de cada pieza algo irrepetible.', precio: 35000, stock: 9 },
            { nombre: 'Plato hondo de vidrio opaco', descripcion: 'Sofisticación minimalista. Su acabado suave aporta un toque de lujo moderno.', precio: 26000, stock: 4 },
          ]
        }
      };

      let totalProductos = 0;
      
      for (const subcategoria of subcategorias) {
        const categoria = categorias.find((cat) => cat.id === subcategoria.categoriaId);
        const productos = categoria ? productosData[categoria.nombre]?.[subcategoria.nombre] : undefined;

        if (!productos) {
          console.warn(`⚠️ No se encontraron productos para ${categoria?.nombre || 'Categoría desconocida'} / ${subcategoria.nombre}`);
          continue;
        }

        console.log(`📦 ${subcategoria.nombre} (${categoria.nombre}):`);
        
        for (const prodData of productos) {
          await Producto.create({
            nombre: prodData.nombre,
            descripcion: prodData.descripcion,
            precio: prodData.precio,
            stock: prodData.stock,
            categoriaId: subcategoria.categoriaId,
            subcategoriaId: subcategoria.id,
            imagen: 'producto-default.jpg', // Imagen por defecto
            activo: true
          });
          console.log(`   ✅ ${prodData.nombre} - $${prodData.precio.toLocaleString()}`);
          totalProductos++;
        }
        console.log('');
      }
      
      console.log(`✅ Total: ${totalProductos} productos creados\n`);
    }

    // ==========================================
    // RESUMEN FINAL
    // ==========================================
    console.log('\n🎉 ========================================');
    console.log('   SEEDER COMPLETADO EXITOSAMENTE');
    console.log('========================================\n');

    const totalUsuarios = await Usuario.count();
    const totalCategorias = await Categoria.count();
    const totalSubcategorias = await Subcategoria.count();
    const totalProductos = await Producto.count();

    console.log('📊 RESUMEN:');
    console.log(`   👥 Usuarios: ${totalUsuarios}`);
    console.log(`   📁 Categorías: ${totalCategorias}`);
    console.log(`   📂 Subcategorías: ${totalSubcategorias}`);
    console.log(`   📦 Productos: ${totalProductos}\n`);

    console.log('🔑 CREDENCIALES DE ACCESO:\n');
    console.log('   👨‍💼 ADMINISTRADOR');
    console.log('      Email: admin@yesa.com');
    console.log('      Password: admin1234\n');
    console.log('   👤 AUXILIARES');
    console.log('      Email: auxiliar@yesa.com');
    console.log('      Password: aux123\n');
    console.log('   🛍️  CLIENTES (5)');
    console.log('      Email: cliente1@yesa.com - Password: cliente1');
    console.log('      Email: cliente2@yesa.com - Password: cliente2');
    console.log('      Email: cliente3@yesa.com - Password: cliente3');
    console.log('      Email: cliente4@yesa.com - Password: cliente4');
    console.log('      Email: cliente5@yesa.com - Password: cliente5\n');

    console.log('========================================\n');

  } catch (error) {
    console.error('❌ Error en el seeder:', error.message);
    console.error(error);
    throw error;
  }
};

module.exports = { seedDatosCompletos };
