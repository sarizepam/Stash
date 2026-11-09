import { router } from 'expo-router';
import { useState } from 'react';

import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
} from 'react-native';

import {
  createUser,
  getUserByEmail,
} from '../database/database';

import {
  saveSession,
} from '../services/session';

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleRegister() {
    if (
      !name.trim() ||
      !email.trim() ||
      !password ||
      !confirmPassword
    ) {
      Alert.alert(
        'Faltan datos',
        'Completa todos los campos.'
      );
      return;
    }

    if (password.length < 6) {
      Alert.alert(
        'Contraseña muy corta',
        'La contraseña debe tener al menos 6 caracteres.'
      );
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert(
        'Las contraseñas no coinciden',
        'Verifica que ambas contraseñas sean iguales.'
      );
      return;
    }

    try {
      setLoading(true);

      const existingUser =
        await getUserByEmail(email);

      if (existingUser) {
        Alert.alert(
          'Correo ya registrado',
          'Ya existe una cuenta asociada a este correo.'
        );
        return;
      }

      const userId = await createUser(
        name,
        email,
        password
      );

      await saveSession(userId);

      router.replace('/dashboard');
    } catch (error) {
      console.error(
        'Error al crear usuario:',
        error
      );

      Alert.alert(
        'Error',
        'No se pudo crear la cuenta.'
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
      <Pressable
        style={styles.backButton}
        onPress={() => router.back()}
      >
        <Text style={styles.backText}>
          ‹
        </Text>
      </Pressable>

      <Text style={styles.title}>
        Crear cuenta
      </Text>

      <Text style={styles.subtitle}>
        Regístrate para comenzar a organizar tus finanzas.
      </Text>

      <Text style={styles.label}>
        Nombre
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Tu nombre"
        value={name}
        onChangeText={setName}
      />

      <Text style={styles.label}>
        Correo electrónico
      </Text>

      <TextInput
        style={styles.input}
        placeholder="correo@ejemplo.com"
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        value={email}
        onChangeText={setEmail}
      />

      <Text style={styles.label}>
        Contraseña
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Mínimo 6 caracteres"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <Text style={styles.label}>
        Confirmar contraseña
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Repite tu contraseña"
        secureTextEntry
        value={confirmPassword}
        onChangeText={setConfirmPassword}
      />

      <Pressable
        style={[
          styles.button,
          loading && styles.disabledButton,
        ]}
        onPress={handleRegister}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading
            ? 'Creando cuenta...'
            : 'Crear cuenta'}
        </Text>
      </Pressable>

      <Pressable
        onPress={() => router.replace('/login')}
      >
        <Text style={styles.loginText}>
          ¿Ya tienes una cuenta? Iniciar sesión
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
    paddingHorizontal: 28,
    paddingTop: 60,
    paddingBottom: 40,
  },

  backButton: {
    marginBottom: 40,
  },

  backText: {
    fontSize: 40,
    color: '#222222',
  },

  title: {
    fontSize: 31,
    fontWeight: '700',
    color: '#111111',
  },

  subtitle: {
    marginTop: 10,
    marginBottom: 30,
    color: '#777777',
    fontSize: 16,
    lineHeight: 22,
  },

  label: {
    fontSize: 14,
    marginBottom: 8,
    color: '#333333',
  },

  input: {
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 13,
    paddingHorizontal: 15,
    paddingVertical: 15,
    marginBottom: 18,
    fontSize: 16,
  },

  button: {
    backgroundColor: '#E96A9D',
    borderRadius: 13,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 10,
  },

  disabledButton: {
    opacity: 0.6,
  },

  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },

  loginText: {
    textAlign: 'center',
    marginTop: 25,
    color: '#E96A9D',
    fontSize: 15,
  },
});