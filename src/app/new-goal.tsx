import { router } from 'expo-router';
import { useState } from 'react';

import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import {
  createGoal,
} from '../database/database';

import {
  getSessionUserId,
} from '../services/session';

export default function NewGoalScreen() {
  const [name, setName] = useState('');
  const [target, setTarget] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSave() {
    if (!name.trim()) {
      Alert.alert(
        'Nombre requerido',
        'Escribe un nombre para tu meta.'
      );

      return;
    }

    const parsedTarget =
      Number(target.replace(',', '.'));

    if (
      target.trim() === '' ||
      Number.isNaN(parsedTarget) ||
      parsedTarget <= 0
    ) {
      Alert.alert(
        'Monto inválido',
        'Ingresa un monto objetivo mayor que cero.'
      );

      return;
    }

    try {
      setLoading(true);

      const userId =
        await getSessionUserId();

      if (!userId) {
        router.replace('/');
        return;
      }

      await createGoal(
        userId,
        name,
        parsedTarget
      );

      router.back();
    } catch (error: any) {
      console.error(
        'Error al crear meta:',
        error
      );

      Alert.alert(
        'Error',
        error?.message ||
          'No se pudo crear la meta.'
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
        >
          <Text style={styles.close}>
            ×
          </Text>
        </Pressable>

        <Text style={styles.title}>
          Nueva meta
        </Text>

        <Pressable
          onPress={handleSave}
          disabled={loading}
        >
          <Text style={styles.confirm}>
            ✓
          </Text>
        </Pressable>
      </View>

      <Text style={styles.label}>
        Nombre de la meta
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Ej. Viaje, computadora, emergencia..."
        value={name}
        onChangeText={setName}
      />

      <Text style={styles.label}>
        Monto objetivo
      </Text>

      <View style={styles.amountContainer}>
        <Text style={styles.currency}>
          $
        </Text>

        <TextInput
          style={styles.amountInput}
          placeholder="0.00"
          keyboardType="decimal-pad"
          value={target}
          onChangeText={setTarget}
        />
      </View>

      <View style={styles.exampleCard}>
        <Text style={styles.exampleTitle}>
          Ejemplo
        </Text>

        <Text style={styles.exampleText}>
          Si quieres ahorrar $10,000 para una computadora,
          ese sería tu monto objetivo.
        </Text>
      </View>

      <Pressable
        style={[
          styles.saveButton,
          loading &&
            styles.disabledButton,
        ]}
        onPress={handleSave}
        disabled={loading}
      >
        <Text style={styles.saveButtonText}>
          {loading
            ? 'Guardando...'
            : 'Crear meta'}
        </Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  content: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 50,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 35,
  },

  close: {
    fontSize: 32,
  },

  title: {
    fontSize: 21,
    fontWeight: '600',
  },

  confirm: {
    fontSize: 26,
    color: '#E96A9D',
  },

  label: {
    fontSize: 15,
    fontWeight: '500',
    marginTop: 20,
    marginBottom: 10,
  },

  input: {
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 13,
    paddingHorizontal: 15,
    paddingVertical: 15,
    fontSize: 16,
  },

  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 13,
    paddingHorizontal: 15,
  },

  currency: {
    fontSize: 25,
    marginRight: 8,
  },

  amountInput: {
    flex: 1,
    paddingVertical: 15,
    fontSize: 22,
  },

  exampleCard: {
    marginTop: 25,
    backgroundColor: '#FDEAF1',
    borderRadius: 14,
    padding: 16,
  },

  exampleTitle: {
    fontWeight: '600',
    marginBottom: 5,
  },

  exampleText: {
    color: '#666666',
    lineHeight: 20,
  },

  saveButton: {
    marginTop: 40,
    backgroundColor: '#E96A9D',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },

  disabledButton: {
    opacity: 0.6,
  },

  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});