/**
 * Este archivo es el formulario para crear o editar un producto en el panel de administrador
 * modo crear se llega desde el boton + crear producto en admin/productos 
 * no se recibe ningun parametro de ruta 
 * modo editar se llega al presionar un producto en la lista 
 * se recbe el parametro producto en le url/api como json 
 * al guardar exitosamente regresa a la pantañña anterior con router.back
 */
 

//manejo de variables de estado local
import {useState, useEffect} from 'react';
//importar componentes
//dimensions obtiene el ancho y alto de la pantalla para hacer diseños responsivos
//flatilist lista optimizada con virtualizacion para mostras grandes cantidades de datos 
//modal mostrar detalles de contenido en ventana emergente
import {ActivityIndicator, ScrollView, StyleSheet,TextInput, Text, Alert, Button, View, TouchableOpacity} from 'react-native';
import apiClient from '../../src/api/apiClient';

//lee los parametros de la url para obtener el id del pedido
import {useLocalSearchParams, useRouter} from 'expo-router';//navegacion y parametros de ruta
import {createProduct, updateProduct} from '../../src/services/adminService';
/**
 * tipo de producto 
 * estructura del producto recibido como parametro cuando edita
 */

type Producto = {
    id?: number,
  nombre?: string,
  descripcion?: string,
    precio?: number
    stock?: number,
    imagen?: string,
};

export default function AdminProductoForm() {
    /**
     * navegacion 
     * useRouter permite navegar programaticamente
     */
    const router = useRouter();
    /**
     * Parametros de ruta 
     * el parametro producto es opcional solo existe en modo editar
     * expo-router son strings 
     */
    const params = useLocalSearchParams<{producto?: string}>();

    /**
     * Producto recibido
     * si existe el parametro intenta parsearlo como un json 
     * si falla el parse (JSON mal formado), lo deja coomo undefined (modo de creacion)
     */
    let producto: Producto | undefined;
    if(params.producto) {
        try {
            producto = JSON.parse(params.producto) as Producto;
        }catch {
            producto = undefined; //fallo silencioso se trata como formulario vacio
        }
    }

    /**
     * Modod formulario
     * editing = true modo edicion (producto recibido)
     * editing = false modo creacion 
     */
    const editing = !!producto;

    /**
     * Estado local de campos el formulario
     * los campos se inicializan con los valores del producto si se esta editando 
     * o en cadena si vacia se esta creando
     * El operador ?? devuelve el lado derecho solo si el izquierdo es null / undefined 
     */

    const [nombre, setNombre] = useState(producto?.nombre ?? '');
    const [descripcion, setDescripcion] = useState(producto?.descripcion ?? '');
    //precio y stock se guardan como string para facilitar la entrada de textInput
    const [precio, setPrecio] = useState(producto?.precio?.toString() ?? '');
    const [stock, setStock] = useState(producto?.stock?.toString() ?? '');
    const [imagen, setImagen] = useState(producto?.imagen ?? '');
    const [loading, setLoading] = useState(false);
    const [categorias, setCategorias] = useState<any[]>([]);
    const [subcategorias, setSubcategorias] = useState<any[]>([]);
    const [selectedCategoriaId, setSelectedCategoriaId] = useState<number | undefined>(
      (producto as any)?.categoriaId || (producto as any)?.categoria?.id
    );
    const [selectedSubcategoriaId, setSelectedSubcategoriaId] = useState<number | undefined>(
      (producto as any)?.subcategoriaId || (producto as any)?.subcategoria?.id
    );

    /**
     * funcion handleSubmit
     * valida los campos llama al servicio correspondiente (crear o actualizar)
     * y regresa a la pantalla anterior si fue exitoso
     */
    const handleSubmit = async() => {
        //validacion basica los 4 campos obligatorios no pueden estar vacios
      if(!nombre || !descripcion || !precio || !stock) {
        Alert.alert('Error', 'Todos los campos son obligatorios');
            return; //detiene la ejecucion al hacer la peticion http
        }

      //categoria y subcategoria son obligatorias en el backend
      if(!selectedCategoriaId || !selectedSubcategoriaId) {
        Alert.alert('Error', 'Faltan campos requeridos: categoriaId y subcategoriaId');
        return;
      }

        setLoading(true);//deshabilita el boton durante la peticion http 
        try {
            //construye el objeto de datos convirtiendo precio y stock a numeros 
            const data = {
                nombre,
                descripcion,
                precio: parseFloat(precio),
                stock: parseInt(stock, 10),
              imagen,
              categoriaId: selectedCategoriaId,
              subcategoriaId: selectedSubcategoriaId,
            };

            if(editing && producto) {
                //modo edicion llama a updateProduct con el id del prdoucto
                //se usa id como fallback 
                await updateProduct(producto.id || producto.id, data);
                Alert.alert('Exitoso', 'Producto actualizado correctamente');
            }else {
                //cuando el formulario esta vacio se comporta como creacion 
                await createProduct(data);
                Alert.alert('Exitoso', 'Producto creado correctamente');
            }
            router.back(); //regresa a admin/productos despues de guardar
        }catch (error: unknown) {
          //si la peticion falla muestra error con el mensaje del backend si existe
          const msg = (error as {message?: string})?.message || 'No se pudo guardar el producto';
          Alert.alert('Error', msg);
        }finally {
            setLoading(false); //habilita el boton nuevamente
        }
    };

    useEffect(() => {
      //carga categorias y subcategorias desde endpoints admin
      let mounted = true;
      const load = async () => {
        try {
          const cats = await apiClient.get('/admin/categorias');
          const subs = await apiClient.get('/admin/subcategorias');
          if(!mounted) return;
          const catsData = cats.data?.data?.categorias || [];
          const subsData = subs.data?.data?.subcategorias || [];
          setCategorias(Array.isArray(catsData) ? catsData : []);
          setSubcategorias(Array.isArray(subsData) ? subsData : []);
        }catch(err) {
          //no bloquear el formulario, solo loguear
          console.warn('No se pudieron cargar categorias/subcategorias', err);
        }
      };
      load();
      return () => { mounted = false };
    }, []);

    // ── RENDERIZADO ───────────────────────────────────────────────────────────
  return (
    <ScrollView contentContainerStyle={styles.container}>

      {/* ── CAMPO: Nombre ───────────────────────────────────────────────── */}
      <Text style={styles.label}>Nombre</Text>
      <TextInput
        style={styles.input}
        value={nombre}
        onChangeText={setNombre} // Actualiza el estado al escribir.
      />

      {/* ── CAMPO: Descripción ──────────────────────────────────────────── */}
      <Text style={styles.label}>Descripcion</Text>
      <TextInput
        style={styles.input}
        value={descripcion}
        onChangeText={setDescripcion}
        multiline // Permite múltiples líneas para textos largos.
      />

      {/* ── CAMPO: Precio ───────────────────────────────────────────────── */}
      <Text style={styles.label}>Precio</Text>
      <TextInput
        style={styles.input}
        value={precio}
        onChangeText={setPrecio}
        keyboardType="numeric" // Muestra teclado numérico en dispositivos móviles.
      />

      {/* ── CAMPO: Stock ────────────────────────────────────────────────── */}
      <Text style={styles.label}>Stock</Text>
      <TextInput
        style={styles.input}
        value={stock}
        onChangeText={setStock}
        keyboardType="numeric"
      />

      {/* ── CAMPO: URL Imagen ───────────────────────────────────────────── */}
      <Text style={styles.label}>URL Imagen</Text>
      <TextInput
        style={styles.input}
        value={imagen}
        onChangeText={setImagen}
        // Sin keyboardType especial: admite cualquier texto (URL o ruta).
      />

      {/* ── CAMPO: Categoría ───────────────────────────────────────────── */}
      <Text style={styles.label}>Categoría</Text>
      <View style={{flexDirection: 'row', flexWrap: 'wrap'}}>
        {categorias.map((c) => (
          <TouchableOpacity
            key={c.id}
            onPress={() => setSelectedCategoriaId(c.id)}
            style={[styles.chip, selectedCategoriaId === c.id ? styles.chipSelected : null]}
          >
            <Text style={selectedCategoriaId === c.id ? styles.chipTextSelected : styles.chipText}>{c.nombre || c.name}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ── CAMPO: Subcategoría ───────────────────────────────────────── */}
      <Text style={styles.label}>Subcategoría</Text>
      <View style={{flexDirection: 'row', flexWrap: 'wrap'}}>
        {subcategorias
          .filter((s) => !selectedCategoriaId || s.categoriaId === selectedCategoriaId || s.categoria?.id === selectedCategoriaId)
          .map((s) => (
          <TouchableOpacity
            key={s.id}
            onPress={() => setSelectedSubcategoriaId(s.id)}
            style={[styles.chip, selectedSubcategoriaId === s.id ? styles.chipSelected : null]}
          >
            <Text style={selectedSubcategoriaId === s.id ? styles.chipTextSelected : styles.chipText}>{s.nombre || s.name}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ── BOTÓN DE GUARDAR ────────────────────────────────────────────── */}
      {/* El título cambia según el modo: "Actualizar" si edita, "Crear" si es nuevo. */}
      {/* disabled evita envíos múltiples mientras loading=true. */}
      <Button
        title={editing ? 'Actualizar' : 'Crear'}
        onPress={handleSubmit}
        disabled={loading}
      />
    </ScrollView>
  );
}

// ── ESTILOS ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  // Contenedor del ScrollView: padding interior, fondo blanco.
  // flexGrow: 1 hace que ocupe toda la pantalla aunque el contenido sea corto.
  container: { padding: 20, backgroundColor: '#fff', flexGrow: 1 },
  // Etiqueta de campo: negrita con margen superior para separar campos.
  label: { fontWeight: 'bold', marginTop: 10 },
  // Campo de texto: borde gris, esquinas ligeramente redondeadas, padding interior.
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 5, padding: 8, marginTop: 5, marginBottom: 10 },
  chip: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 16, backgroundColor: '#f3f4f6', marginRight: 8, marginBottom: 8 },
  chipSelected: { backgroundColor: '#2563eb' },
  chipText: { color: '#111' },
  chipTextSelected: { color: '#fff' },
});