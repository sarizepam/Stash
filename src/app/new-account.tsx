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

import { createAccount } from '../database/database';
import { getSessionUserId } from '../services/session';

const accountTypes = [
  'Efectivo',
  'Débito',
  'Crédito',
  'Ahorro',
];

const accountColors = [
  '#E96A9D',
  '#8DBD91',
  '#76AEDD',
  '#E56A70',
  '#B49ADE',
  '#A8A8A8',
];

export default function NewAccountScreen() {
  const [name, setName] = useState('');
  const [type, setType] = useState('Efectivo');
  const [balance, setBalance] = useState('');
  const [color, setColor] = useState('#E96A9D');
  const [loading, setLoading] = useState(false);

  async function handleSave() {
    if (!name.trim()) {
      Alert.alert(
        'Falta información',
        'Escribe un nombre para la cuenta.'
      );
      return;
    }

    const initialBalance =
      Number(balance.replace(',', '.'));

    if (
      balance.trim() === '' ||
      Number.isNaN(initialBalance) ||
      initialBalance < 0
    ) {
      Alert.alert(
        'Saldo inválido',
        'Ingresa un saldo inicial válido.'
      );
      return;
    }

    try {
      setLoading(true);

      const userId =
        await getSessionUserId();

      if (!userId) {
        Alert.alert(
          'Sesión no encontrada',
          'Inicia sesión nuevamente.'
        );

        router.replace('/');
        return;
      }

      await createAccount(
        userId,
        name,
        type,
        initialBalance,
        color
      );

      router.back();
    } catch (error) {
      console.error(
        'Error al crear cuenta:',
        error
      );

      Alert.alert(
        'Error',
        'No se pudo guardar la cuenta.'
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
          Nueva cuenta
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
        Nombre de la cuenta
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Ej. BBVA, Efectivo, Caja..."
        value={name}
        onChangeText={setName}
      />

      <Text style={styles.label}>
        Tipo de cuenta
      </Text>

      <View style={styles.typesContainer}>
        {accountTypes.map((item) => (
          <Pressable
            key={item}
            style={[
              styles.typeButton,
              type === item &&
                styles.typeButtonSelected,
            ]}
            onPress={() => setType(item)}
          >
            <Text
              style={[
                styles.typeText,
                type === item &&
                  styles.typeTextSelected,
              ]}
            >
              {item}
            </Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.label}>
        Saldo inicial
      </Text>

      <View style={styles.balanceContainer}>
        <Text style={styles.currency}>
          $
        </Text>

        <TextInput
          style={styles.balanceInput}
          placeholder="0.00"
          keyboardType="decimal-pad"
          value={balance}
          onChangeText={setBalance}
        />
      </View>

      <Text style={styles.label}>
        Color de la cuenta
      </Text>

      <View style={styles.colorsContainer}>
        {accountColors.map((item) => (
          <Pressable
            key={item}
            style={[
              styles.color,
              {
                backgroundColor: item,
              },
              color === item &&
                styles.colorSelected,
            ]}
            onPress={() => setColor(item)}
          />
        ))}
      </View>

      <Pressable
        style={[
          styles.saveButton,
          loading && styles.disabledButton,
        ]}
        onPress={handleSave}
        disabled={loading}
      >
        <Text style={styles.saveButtonText}>
          {loading
            ? 'Guardando...'
            : 'Guardar cuenta'}
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
    paddingBottom: 40,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 18,
    marginBottom: 30,
    borderBottomWidth: 1,
    borderBottomColor: '#DDDDDD',
  },

  close: {
    fontSize: 32,
    color: '#222222',
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
    marginBottom: 10,
    marginTop: 20,
  },

  input: {
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 13,
    paddingHorizontal: 15,
    paddingVertical: 15,
    fontSize: 16,
  },

  typesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },

  typeButton: {
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 20,
    paddingVertical: 9,
    paddingHorizontal: 16,
  },

  typeButtonSelected: {
    backgroundColor: '#F8C8DA',
    borderColor: '#E96A9D',
  },

  typeText: {
    color: '#444444',
  },

  typeTextSelected: {
    color: '#B63F70',
    fontWeight: '600',
  },

  balanceContainer: {
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

  balanceInput: {
    flex: 1,
    paddingVertical: 15,
    fontSize: 22,
  },

  colorsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
    marginTop: 5,
  },

  color: {
    width: 38,
    height: 38,
    borderRadius: 19,
  },

  colorSelected: {
    borderWidth: 3,
    borderColor: '#222222',
  },

  saveButton: {
    marginTop: 45,
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