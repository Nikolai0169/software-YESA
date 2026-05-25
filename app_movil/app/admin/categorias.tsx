import { useEffect, useState } from 'react';
import { View, ActivityIndicator, FlatList, Pressable, Alert, StyleSheet, TextInput, Modal, Button } from 'react-native';
import { ThemedText } from '../../components/themed-text';
import apiClient from '../../src/api/apiClient';
import { useAuth } from '../../src/context/authContext';

type Categoria = { id?: number; nombre?: string; descripcion?: string; activo?: boolean };

export default function AdminCategorias() {
  const { user } = useAuth() as { user?: { rol?: string } };
  const isAdmin = user?.rol === 'administrador';

  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editing, setEditing] = useState<Categoria | null>(null);
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');

  const fetchCategorias = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/admin/categorias');
      const data = res.data?.data?.categorias || [];
      setCategorias(Array.isArray(data) ? data : []);
    } catch (error: unknown) {
      Alert.alert('Error', (error as {message?:string})?.message || 'No se pudieron cargar categorías');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCategorias(); }, []);

  const openCreate = () => {
    setEditing(null);
    setNombre('');
    setDescripcion('');
    setModalVisible(true);
  };

  const openEdit = (c: Categoria) => {
    setEditing(c);
    setNombre(c.nombre || '');
    setDescripcion(c.descripcion || '');
    setModalVisible(true);
  };

  const submit = async () => {
    if (!nombre.trim()) { Alert.alert('Error', 'El nombre es obligatorio'); return; }
    try {
      if (editing && editing.id) {
        await apiClient.put(`/admin/categorias/${editing.id}`, { nombre, descripcion });
        Alert.alert('Éxito', 'Categoría actualizada');
      } else {
        await apiClient.post('/admin/categorias', { nombre, descripcion });
        Alert.alert('Éxito', 'Categoría creada');
      }
      setModalVisible(false);
      fetchCategorias();
    } catch (error: unknown) {
      Alert.alert('Error', (error as {message?:string})?.message || 'No se pudo guardar');
    }
  };

  const toggleCategoria = async (id?: number) => {
    if (!id) return;
    try {
      await apiClient.patch(`/admin/categorias/${id}/toggle`);
      fetchCategorias();
    } catch (error: unknown) {
      Alert.alert('Error', (error as {message?:string})?.message || 'No se pudo cambiar estado');
    }
  };

  const eliminar = (id?: number) => {
    // En la app móvil no permitimos eliminar categorías.
    // Mostramos una alerta informativa en lugar de llamar al backend.
    Alert.alert('Acción no permitida', 'No se puede eliminar categoria desde app movil');
  };

  return (
    <View style={styles.container}>
      <ThemedText type="title">Categorías</ThemedText>
      <Pressable style={[styles.actionBtn, { borderColor: '#10b981' }]} onPress={openCreate}>
        <ThemedText style={{ color: '#10b981' }}>+ Nueva Categoría</ThemedText>
      </Pressable>

      {loading ? <ActivityIndicator size="large" /> : (
        <FlatList
          data={categorias}
          keyExtractor={(i) => String(i.id)}
          renderItem={({item}) => (
            <View style={styles.row}>
              <View style={{flex:1}}>
                <ThemedText type="defaultSemiBold">{item.nombre}</ThemedText>
                <ThemedText>{item.descripcion}</ThemedText>
              </View>
              <View style={styles.actions}>
                <Pressable onPress={() => openEdit(item)} style={styles.btn}><ThemedText>Editar</ThemedText></Pressable>
                <Pressable onPress={() => toggleCategoria(item.id)} style={styles.btn}><ThemedText>{item.activo ? 'Desactivar' : 'Activar'}</ThemedText></Pressable>
                {isAdmin && <Pressable onPress={() => eliminar(item.id)} style={[styles.btn, styles.danger]}><ThemedText>Eliminar</ThemedText></Pressable>}
              </View>
            </View>
          )}
        />
      )}

      <Modal visible={modalVisible} animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <View style={{padding:16, flex:1, backgroundColor:'#fff'}}>
          <ThemedText type="title">{editing ? 'Editar' : 'Crear'} Categoría</ThemedText>
          <ThemedText style={{marginTop:8}}>Nombre</ThemedText>
          <TextInput style={styles.input} value={nombre} onChangeText={setNombre} />
          <ThemedText>Descripción</ThemedText>
          <TextInput style={[styles.input, {height:100}]} value={descripcion} onChangeText={setDescripcion} multiline />
          <View style={{marginTop:12}}>
            <Button title="Guardar" onPress={submit} />
            <View style={{height:8}} />
            <Button title="Cancelar" onPress={() => setModalVisible(false)} color="#9ca3af" />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex:1, padding:16, backgroundColor:'#fff' },
  row: { flexDirection:'row', padding:12, borderWidth:1, borderColor:'#eee', borderRadius:8, marginBottom:8, alignItems:'center' },
  actions: { flexDirection:'column', gap:6 },
  btn: { paddingVertical:6, paddingHorizontal:10, borderRadius:6, backgroundColor:'#e5e7eb', marginBottom:6 },
  danger: { backgroundColor:'#f87171' },
  actionBtn: { borderWidth:1, borderRadius:8, padding:10, alignItems:'center', marginVertical:12 },
  input: { borderWidth:1, borderColor:'#e5e7eb', borderRadius:6, padding:8, marginTop:6, marginBottom:6 }
});
