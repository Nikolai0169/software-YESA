import React, { useState } from 'react';
import { ScrollView, StyleSheet, Pressable, View, TextInput, Alert, ActivityIndicator } from 'react-native';
import { ThemedText } from '../components/themed-text';
import { ThemedView } from '../components/themed-view';
import { useColorScheme } from '../hooks/use-color-scheme';
import { Colors } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { sendContactMessage } from '../src/services/supportService';
import { useAuth } from '../src/context/authContext';
import { useRouter } from 'expo-router';

const FAQS = [
  {
    id: 'envios',
    pregunta: '¿Cuáles son los tiempos de entrega?',
    respuesta:
      'Los tiempos de entrega varían según tu ubicación. Para Bogotá y alrededores: 2-3 días hábiles. Para otras ciudades: 3-5 días hábiles. Ofrecemos envío gratuito en compras superiores a $100.000.',
  },
  {
    id: 'devoluciones',
    pregunta: '¿Cuál es la política de devoluciones?',
    respuesta:
      'Aceptamos devoluciones dentro de los 30 días siguientes a la recepción del producto. El producto debe estar en su empaque original y sin uso. Los costos de envío de devolución corren por cuenta del cliente, excepto en casos de defecto de fábrica.',
  },
  {
    id: 'pagos',
    pregunta: '¿Qué métodos de pago aceptan?',
    respuesta:
      'Aceptamos tarjetas de crédito y débito (Visa, MasterCard, American Express), transferencias bancarias, pagos en efectivo contra entrega y pagos electrónicos a través de PSE. Todos los pagos son procesados de forma segura.',
  },
  {
    id: 'garantia',
    pregunta: '¿Los productos tienen garantía?',
    respuesta:
      'Sí, todos nuestros productos tienen garantía de 1 año contra defectos de fabricación. La garantía no cubre daños por uso indebido, accidentes o modificaciones no autorizadas.',
  },
  {
    id: 'personalizacion',
    pregunta: '¿Ofrecen personalización de productos?',
    respuesta:
      'Sí, ofrecemos opciones de personalización para muchos de nuestros productos. Puedes elegir diferentes modelos 3D, colores y acabados. Los precios adicionales se muestran claramente durante el proceso de selección.',
  },
  {
    id: 'contacto',
    pregunta: '¿Cómo puedo contactarlos?',
    respuesta:
      'Puedes contactarnos a través de nuestro formulario web, por teléfono al 01-800-YESA, por WhatsApp al +57 300 123 4567, o visitando nuestras tiendas físicas. Nuestro horario de atención es de lunes a viernes de 8:00 AM a 6:00 PM.',
  },
];

export default function FAQScreen() {
  const router = useRouter();
  const { isAuthenticated, isLoadingSession } = useAuth();
  const [open, setOpen] = useState<string | null>(null);
  const [formData, setFormData] = useState({ nombre: '', email: '', asunto: '', mensaje: '' });
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const theme = useColorScheme() ?? 'light';
  const primary = Colors[theme].primary;
  const primaryLight = Colors[theme].primaryLight;
  const surface = Colors[theme].surface;
  const surfaceSoft = Colors[theme].surfaceSoft;
  const borderColor = Colors[theme].border;
  const textColor = Colors[theme].text;

  const handleSubmit = async () => {
    if (isLoadingSession) return;
    if (!isAuthenticated) {
      Alert.alert('Debes iniciar sesión', 'Por favor inicia sesión para enviar una consulta');
      router.push('/login');
      return;
    }
    if (!formData.nombre.trim() || !formData.email.trim() || !formData.asunto.trim() || !formData.mensaje.trim()) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      Alert.alert('Error', 'Por favor ingresa un email válido');
      return;
    }

    setLoading(true);
    try {
      const response = await sendContactMessage(formData);

      if (response.success) {
        Alert.alert('Éxito', response.message);
        setFormData({ nombre: '', email: '', asunto: '', mensaje: '' });
        setShowForm(false);
      } else {
        Alert.alert('Error', response.message || 'No pudimos enviar tu mensaje. Intenta más tarde.');
      }
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', error.message || 'Error de conexión. Por favor intenta más tarde.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Preguntas Frecuentes</ThemedText>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <ThemedText style={[styles.lead, { color: textColor }]}>Encuentra respuestas a las preguntas más comunes sobre nuestros productos y servicios.</ThemedText>

        {FAQS.map((f) => (
          <Pressable
            key={f.id}
            onPress={() => setOpen(open === f.id ? null : f.id)}
            style={[styles.item, { backgroundColor: surface, borderColor }]}
          >
            <View style={styles.questionRow}>
              <ThemedText style={[styles.question, { color: textColor }]}>{f.pregunta}</ThemedText>
              <Ionicons name={open === f.id ? 'chevron-up' : 'chevron-down'} size={18} color={primary} />
            </View>
            {open === f.id ? <ThemedText style={[styles.answer, { color: textColor }]}>{f.respuesta}</ThemedText> : null}
          </Pressable>
        ))}

        {/* Sección de Contacto con Soporte */}
        <View style={[styles.contactSeparator, { backgroundColor: borderColor }]} />
        <ThemedText type="subtitle" style={[styles.contactTitle, { color: textColor }]}>¿No encontraste tu respuesta?</ThemedText>
        
        {!showForm ? (
          <Pressable
            style={[styles.contactButton, { backgroundColor: primary }]}
            onPress={() => {
              // Si la sesión todavía se está restaurando, evitar navegar hasta que termine
              if (isLoadingSession) return;

              if (!isAuthenticated) {
                // Redirigir al login para que el usuario inicie sesión antes de enviar el formulario
                router.push('/login');
                return;
              }

              setShowForm(true);
            }}
          >
            <Ionicons name="mail" size={20} color="#fff" style={{ marginRight: 8 }} />
            <ThemedText style={[styles.contactButtonText, { color: '#fff' }]}>Contactar Soporte</ThemedText>
          </Pressable>
        ) : (
          <View style={[styles.formContainer, { backgroundColor: surface, borderColor }]}> 
            <View style={styles.formHeader}>
              <ThemedText style={[styles.formTitle, { color: textColor }]}>Formulario de Contacto</ThemedText>
              <Pressable onPress={() => setShowForm(false)}>
                <Ionicons name="close" size={24} color={primary} />
              </Pressable>
            </View>

            <ThemedText style={[styles.label, { color: textColor }]}>Nombre</ThemedText>
            <TextInput
              style={[styles.input, { backgroundColor: surface, borderColor: borderColor, color: textColor }]}
              placeholder="Tu nombre"
              value={formData.nombre}
              onChangeText={(text) => setFormData({ ...formData, nombre: text })}
              editable={!loading}
              placeholderTextColor="#999"
            />

            <ThemedText style={[styles.label, { color: textColor }]}>Email</ThemedText>
            <TextInput
              style={[styles.input, { backgroundColor: surface, borderColor: borderColor, color: textColor }]}
              placeholder="tu@email.com"
              value={formData.email}
              onChangeText={(text) => setFormData({ ...formData, email: text })}
              keyboardType="email-address"
              editable={!loading}
              placeholderTextColor="#999"
            />

            <ThemedText style={[styles.label, { color: textColor }]}>Asunto</ThemedText>
            <TextInput
              style={[styles.input, { backgroundColor: surface, borderColor: borderColor, color: textColor }]}
              placeholder="¿Cuál es tu consulta?"
              value={formData.asunto}
              onChangeText={(text) => setFormData({ ...formData, asunto: text })}
              editable={!loading}
              placeholderTextColor="#999"
            />

            <ThemedText style={[styles.label, { color: textColor }]}>Mensaje</ThemedText>
            <TextInput
              style={[styles.input, styles.messageInput, { backgroundColor: surface, borderColor: borderColor, color: textColor }]}
              placeholder="Cuéntanos tu problema o pregunta..."
              value={formData.mensaje}
              onChangeText={(text) => setFormData({ ...formData, mensaje: text })}
              multiline
              numberOfLines={4}
              editable={!loading}
              placeholderTextColor="#999"
            />

            <Pressable
              style={[styles.submitButton, { backgroundColor: primary }, loading && { backgroundColor: primaryLight, opacity: 0.7 }]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <ThemedText style={[styles.submitButtonText, { color: '#fff' }]}>Enviar Mensaje</ThemedText>
              )}
            </Pressable>

            <Pressable onPress={() => setShowForm(false)} disabled={loading}>
              <ThemedText style={[styles.cancelButton, { color: primary }]}>Cancelar</ThemedText>
            </Pressable>
          </View>
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flex: 1 },
  content: { padding: 16, gap: 12, paddingBottom: 40 },
  lead: { color: '#666' },
  item: { borderRadius: 10, padding: 12, backgroundColor: '#fff', borderWidth: 1, borderColor: '#eee' },
  questionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  question: { fontWeight: '700', flex: 1 },
  answer: { marginTop: 8, color: '#444' },
  
  // Estilos para contacto
  contactSeparator: { height: 1, backgroundColor: '#eee', marginVertical: 16 },
  contactTitle: { marginVertical: 8, color: '#333' },
  
  contactButton: {
    flexDirection: 'row',
    backgroundColor: '#7d2181',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactButtonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  
  formContainer: {
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  formHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  formTitle: { fontWeight: '700', fontSize: 18, color: '#333' },
  
  label: { fontWeight: '600', color: '#333', marginTop: 12, marginBottom: 6 },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#d0d0d0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#000',
  },
  messageInput: {
    minHeight: 100,
    textAlignVertical: 'top',
    paddingTop: 10,
  },
  
  submitButton: {
    backgroundColor: '#7d2181',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  submitButtonDisabled: { backgroundColor: '#b896c1', opacity: 0.7 },
  submitButtonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  
  cancelButton: { color: '#7d2181', textAlign: 'center', paddingVertical: 10, fontWeight: '600' },
});
