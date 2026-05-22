import React, { useState } from 'react';
import { ScrollView, StyleSheet, Pressable, View } from 'react-native';
import { ThemedText } from '../components/themed-text';
import { ThemedView } from '../components/themed-view';
import { Ionicons } from '@expo/vector-icons';

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
  const [open, setOpen] = useState<string | null>(null);

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Preguntas Frecuentes</ThemedText>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <ThemedText style={styles.lead}>Encuentra respuestas a las preguntas más comunes sobre nuestros productos y servicios.</ThemedText>

        {FAQS.map((f) => (
          <Pressable key={f.id} onPress={() => setOpen(open === f.id ? null : f.id)} style={styles.item}>
            <View style={styles.questionRow}>
              <ThemedText style={styles.question}>{f.pregunta}</ThemedText>
              <Ionicons name={open === f.id ? 'chevron-up' : 'chevron-down'} size={18} color="#7d2181" />
            </View>
            {open === f.id ? <ThemedText style={styles.answer}>{f.respuesta}</ThemedText> : null}
          </Pressable>
        ))}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flex: 1 },
  content: { padding: 16, gap: 12 },
  lead: { color: '#666' },
  item: { borderRadius: 10, padding: 12, backgroundColor: '#fff', borderWidth: 1, borderColor: '#eee' },
  questionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  question: { fontWeight: '700' },
  answer: { marginTop: 8, color: '#444' },
});
