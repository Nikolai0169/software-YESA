import { useEffect, useState } from 'react';
import { View, ActivityIndicator, FlatList, Pressable, Alert, StyleSheet } from 'react-native';
import { ThemedText } from '../../components/themed-text';
import apiClient from '../../src/api/apiClient';
import { useAuth } from '../../src/context/authContext';

type Subcategoria = { id?: number; nombre?: string; descripcion?: string; categoriaId?: number; categoria?: { id?: number }; activo?: boolean };

export default function AdminSubcategoriasScreen() {
  const { user } = useAuth() as { user?: { rol?: string } };
  const isAdmin = user?.rol === 'administrador';

  const [subcategorias, setSubcategorias] = useState<Subcategoria[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSub = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/admin/subcategorias');
      const data = res.data?.data?.subcategorias || [];
      setSubcategorias(Array.isArray(data) ? data : []);
    } catch (error: unknown) {
      Alert.alert('Error', (error as {message?:string})?.message || 'No se pudieron cargar subcategorías');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSub(); }, []);

  const toggle = async (id?: number) => {
    if (!id) return;
    try { await apiClient.patch(`/admin/subcategorias/${id}/toggle`); fetchSub(); } catch (err: unknown) { Alert.alert('Error', (err as {message?:string})?.message || 'No se pudo cambiar'); }
  };

  const eliminar = async (id?: number) => {
    if (!id) return;
    Alert.alert('Eliminar', 'Confirma eliminar esta subcategoría?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: async () => {
        try { await apiClient.delete(`/admin/subcategorias/${id}`); fetchSub(); } catch (err: unknown) { Alert.alert('Error', (err as {message?:string})?.message || 'No se pudo eliminar'); }
      } }
    ]);
  };

  return (
    <View style={styles.container}>
      <ThemedText type="title">Subcategorías</ThemedText>
      {loading ? <ActivityIndicator size="large" /> : (
        <FlatList
          data={subcategorias}
          keyExtractor={(i) => String(i.id)}
          renderItem={({item}) => (
            <View style={styles.row}>
              <View style={{flex:1}}>
                <ThemedText type="defaultSemiBold">{item.nombre}</ThemedText>
                <ThemedText>Categoria: {String(item.categoriaId ?? item.categoria?.id ?? '-')}</ThemedText>
              </View>
              <View style={styles.actions}>
                <Pressable onPress={() => toggle(item.id)} style={styles.btn}><ThemedText>{item.activo ? 'Desactivar' : 'Activar'}</ThemedText></Pressable>
                {isAdmin && <Pressable onPress={() => eliminar(item.id)} style={[styles.btn, styles.danger]}><ThemedText>Eliminar</ThemedText></Pressable>}
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex:1, padding:16, backgroundColor:'#fff' },
  row: { flexDirection:'row', padding:12, borderWidth:1, borderColor:'#eee', borderRadius:8, marginBottom:8, alignItems:'center' },
  actions: { flexDirection:'column', gap:6 },
  btn: { paddingVertical:6, paddingHorizontal:10, borderRadius:6, backgroundColor:'#e5e7eb', marginBottom:6 },
  danger: { backgroundColor:'#f87171' }
});
