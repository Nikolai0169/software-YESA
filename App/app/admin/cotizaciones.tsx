import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Link } from 'expo-router';
import useAdminRole from '../../src/hooks/useAdminRole';
import { Colors } from '../../constants/theme';
import cotizacionesService from '../../src/services/cotizacionesService';

const statusOptions = [
  { value: 'pendiente', label: 'Pendiente' },
  { value: 'cotizado', label: 'Cotizado' },
  { value: 'convertida', label: 'Convertida' },
  { value: 'aceptado', label: 'Aceptado' },
  { value: 'rechazado', label: 'Rechazado' },
];

const formatCurrency = (value: number | string | undefined) => {
  const numericValue = Number(value || 0);
  return numericValue.toLocaleString('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  });
};

const normalizeCotizacion = (cotizacion: any) => ({
  ...cotizacion,
  id: cotizacion?.id ?? cotizacion?._id,
  nombre: cotizacion?.nombre || 'Cotización personalizada',
  estado: String(cotizacion?.estado || 'pendiente').toLowerCase(),
  precio: Number(cotizacion?.precio || 0),
  notas: cotizacion?.notas || '',
  items: Array.isArray(cotizacion?.items) ? cotizacion.items : [],
});

export default function CotizacionesAdmin() {
  const { isChecking, isAuthorized } = useAdminRole();
  const [cotizaciones, setCotizaciones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | number | null>(null);
  const [selectedId, setSelectedId] = useState<string | number | null>(null);
  const [precioDraft, setPrecioDraft] = useState('');
  const [estadoDraft, setEstadoDraft] = useState('cotizado');
  const [notasDraft, setNotasDraft] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const selectedCotizacion = useMemo(
    () => cotizaciones.find((cotizacion) => String(cotizacion.id) === String(selectedId)) || null,
    [cotizaciones, selectedId]
  );

  useEffect(() => {
    loadCotizaciones();
  }, []);

  useEffect(() => {
    if (!selectedCotizacion) {
      setPrecioDraft('');
      setEstadoDraft('cotizado');
      setNotasDraft('');
      return;
    }

    setPrecioDraft(selectedCotizacion.precio ? String(selectedCotizacion.precio) : '');
    setEstadoDraft(selectedCotizacion.estado || 'cotizado');
    setNotasDraft(selectedCotizacion.notas || '');
  }, [selectedCotizacion]);

  async function loadCotizaciones() {
    setLoading(true);
    setErrorMessage(null);
    try {
      const list = await cotizacionesService.getCotizaciones();
      setCotizaciones(Array.isArray(list) ? list.map(normalizeCotizacion) : []);
    } catch (error) {
      console.error('Error cargando cotizaciones:', error);
      setErrorMessage('No se pudieron cargar las cotizaciones. Intenta nuevamente.');
      setCotizaciones([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveChanges() {
    if (!selectedCotizacion || savingId !== null) {
      return;
    }

    const precio = Number(precioDraft);
    if (!Number.isFinite(precio) || precio <= 0) {
      Alert.alert('Validación', 'Ingresa un precio válido mayor a 0.');
      return;
    }

    setSavingId(selectedCotizacion.id);
    try {
      setErrorMessage(null);
      const response = await cotizacionesService.updateCotizacion(selectedCotizacion.id, {
        precio,
        estado: estadoDraft,
        notas: notasDraft.trim(),
      });

      const updated = normalizeCotizacion(response?.cotizacion || response);
      setCotizaciones((prev) =>
        prev.map((cotizacion) => (String(cotizacion.id) === String(updated.id) ? { ...cotizacion, ...updated } : cotizacion))
      );
      setSelectedId(updated.id);
      setSuccessMessage('Cotización actualizada correctamente.');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error('Error actualizando cotización:', error);
      setErrorMessage('No se pudo actualizar la cotización. Intenta nuevamente.');
    } finally {
      setSavingId(null);
    }
  }

  if (isChecking || loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.light.primary} />
      </View>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Cotizaciones</Text>
      <Text style={styles.subtitle}>
        Revisa las cotizaciones, cambia su estado y ajusta el precio directamente desde la app.
      </Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Resumen</Text>
        <Text style={styles.cardText}>Total: {cotizaciones.length}</Text>
        <Text style={styles.cardText}>Cotizaciones pendientes y cotizadas del módulo administrativo.</Text>
      </View>

      {errorMessage ? (
        <View style={styles.alertCardError}>
          <Text style={styles.alertText}>{errorMessage}</Text>
        </View>
      ) : null}

      {successMessage ? (
        <View style={styles.alertCardSuccess}>
          <Text style={styles.alertText}>{successMessage}</Text>
        </View>
      ) : null}

      {cotizaciones.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.cardTitle}>No hay cotizaciones</Text>
          <Text style={styles.cardText}>Cuando llegue una solicitud, aparecerá aquí para revisión.</Text>
        </View>
      ) : (
        cotizaciones.map((cotizacion) => {
          const isSelected = String(selectedId) === String(cotizacion.id);
          return (
            <TouchableOpacity
              key={String(cotizacion.id)}
              style={[styles.quoteCard, isSelected && styles.quoteCardSelected]}
              onPress={() => setSelectedId(cotizacion.id)}
            >
              <View style={styles.quoteHeader}>
                <Text style={styles.quoteTitle}>{cotizacion.nombre}</Text>
                <View style={styles.statusBadge}>
                  <Text style={styles.statusText}>{cotizacion.estado}</Text>
                </View>
              </View>
                  <Text style={styles.quoteMeta}>ID: {cotizacion.id}</Text>
              <Text style={styles.quoteMeta}>Precio: {formatCurrency(cotizacion.precio)}</Text>
              <Text style={styles.quoteMeta}>Items: {Array.isArray(cotizacion.items) ? cotizacion.items.length : 0}</Text>
              <Text style={styles.quoteMeta}>Usuario: {cotizacion.usuario?.nombre || cotizacion.usuario?.email || 'Anónimo'}</Text>
              {cotizacion.notas ? <Text style={styles.quoteMeta}>Notas: {cotizacion.notas}</Text> : null}
              <Text style={styles.quoteMeta}>Creado: {cotizacion.createdAt ? new Date(cotizacion.createdAt).toLocaleString() : 'N/A'}</Text>
            </TouchableOpacity>
          );
        })
      )}

      {selectedCotizacion ? (
        <View style={styles.editorCard}>
          <Text style={styles.cardTitle}>Editar cotización</Text>

          <Text style={styles.inputLabel}>Precio</Text>
          <TextInput
            style={styles.input}
            value={precioDraft}
            onChangeText={setPrecioDraft}
            keyboardType="numeric"
            placeholder="Ej. 50000"
            placeholderTextColor="#94a3b8"
          />

          <Text style={styles.inputLabel}>Estado</Text>
          <View style={styles.statusGrid}>
            {statusOptions.map((option) => {
              const active = estadoDraft === option.value;
              return (
                <TouchableOpacity
                  key={option.value}
                  style={[styles.statusOption, active && styles.statusOptionActive]}
                  onPress={() => setEstadoDraft(option.value)}
                >
                  <Text style={[styles.statusOptionText, active && styles.statusOptionTextActive]}>{option.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={styles.inputLabel}>Notas</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={notasDraft}
            onChangeText={setNotasDraft}
            placeholder="Observaciones para el cliente"
            placeholderTextColor="#94a3b8"
            multiline
          />

          <TouchableOpacity
            style={[styles.saveButton, savingId !== null && styles.saveButtonDisabled]}
            onPress={handleSaveChanges}
            disabled={savingId !== null}
          >
            <Text style={styles.saveButtonText}>
              {savingId !== null ? 'Guardando...' : 'Guardar cambios'}
            </Text>
          </TouchableOpacity>
        </View>
      ) : null}

      <Link href="/admin/dashboard" asChild>
        <TouchableOpacity style={styles.backButton}>
          <Text style={styles.backButtonText}>Volver al panel admin</Text>
        </TouchableOpacity>
      </Link>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  content: {
    padding: 18,
    paddingBottom: 30,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.light.background,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.light.text,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    color: Colors.light.icon,
    marginBottom: 20,
  },
  card: {
    backgroundColor: Colors.light.surface,
    borderRadius: 18,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
    marginBottom: 16,
  },
  emptyCard: {
    backgroundColor: Colors.light.surface,
    borderRadius: 18,
    padding: 20,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: 10,
  },
  cardText: {
    fontSize: 14,
    color: Colors.light.icon,
    lineHeight: 20,
  },
  quoteCard: {
    backgroundColor: Colors.light.surface,
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  quoteCardSelected: {
    borderColor: Colors.light.primary,
  },
  quoteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  quoteTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: Colors.light.text,
  },
  statusBadge: {
    backgroundColor: Colors.light.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  statusText: {
    color: Colors.light.surface,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  quoteMeta: {
    color: Colors.light.icon,
    fontSize: 13,
    marginTop: 4,
  },
  editorCard: {
    backgroundColor: Colors.light.surface,
    borderRadius: 18,
    padding: 18,
    marginTop: 4,
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: 8,
    marginTop: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#dbe3ee',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: Colors.light.text,
    backgroundColor: '#fff',
  },
  textArea: {
    minHeight: 90,
    textAlignVertical: 'top',
  },
  statusGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statusOption: {
    borderWidth: 1,
    borderColor: Colors.light.primary,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  statusOptionActive: {
    backgroundColor: Colors.light.primary,
  },
  statusOptionText: {
    color: Colors.light.primary,
    fontWeight: '700',
  },
  statusOptionTextActive: {
    color: '#fff',
  },
  saveButton: {
    backgroundColor: Colors.light.primary,
    paddingVertical: 16,
    borderRadius: 16,
    marginTop: 16,
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    color: Colors.light.surface,
    textAlign: 'center',
    fontWeight: '700',
    fontSize: 16,
  },
  backButton: {
    backgroundColor: Colors.light.primary,
    paddingVertical: 16,
    borderRadius: 16,
    marginBottom: 10,
  },
  alertCardError: {
    backgroundColor: '#fdecea',
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
  },
  alertCardSuccess: {
    backgroundColor: '#ecfdf5',
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
  },
  alertText: {
    color: Colors.light.text,
    fontSize: 13,
    lineHeight: 18,
  },
  backButtonText: {
    color: Colors.light.surface,
    textAlign: 'center',
    fontWeight: '700',
    fontSize: 16,
  },
});
