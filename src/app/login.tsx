import { router } from 'expo-router';
import { useState } from 'react';

import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { getUserByEmail } from '../database/database';
import { saveSession } from '../services/session';

type User = {
  id: number;
  nombre: string;
  correo: string;
  password: string;
};

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!email.trim() || !password) {
      Alert.alert(
        'Faltan datos',
        'Ingresa tu correo electrónico y contraseña.'
      );
      return;
    }

    try {
      setLoading(true);

      const user = (await getUserByEmail(email)) as User | null;

      if (!user) {
        Alert.alert(
          'Usuario no encontrado',
          'No existe una cuenta registrada con ese correo.'
        );
        return;
      }

      if (user.password !== password) {
        Alert.alert(
          'Contraseña incorrecta',
          'La contraseña ingresada no es correcta.'
        );
        return;
      }

      // Guarda qué usuario tiene la sesión activa.
      await saveSession(user.id);

      // Evita regresar al login con el botón atrás.
      router.replace('/dashboard');
    } catch (error) {
      console.error(
        'Error al iniciar sesión:',
        error
      );

      Alert.alert(
        'Error',
        'No se pudo iniciar sesión. Inténtalo nuevamente.'
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Pressable
        style={styles.backButton}
        onPress={() => router.back()}
      >
        <Text style={styles.backText}>
          ‹
        </Text>
      </Pressable>

      <View>
        <Text style={styles.title}>
          Bienvenida a STASH
        </Text>

        <Text style={styles.subtitle}>
          Inicia sesión para consultar tus finanzas.
        </Text>

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
          placeholder="••••••••"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <Pressable
          style={[
            styles.loginButton,
            loading && styles.disabledButton,
          ]}
          onPress={handleLogin}
          disabled={loading}
        >
          <Text style={styles.loginButtonText}>
            {loading
              ? 'Iniciando sesión...'
              : 'Iniciar sesión'}
          </Text>
        </Pressable>

        <Pressable
          onPress={() => router.push('/register')}
        >
          <Text style={styles.createAccount}>
            ¿No tienes cuenta? Crear cuenta
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 28,
    paddingTop: 60,
  },

  backButton: {
    marginBottom: 70,
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
    marginBottom: 35,
    color: '#777777',
    fontSize: 16,
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
    marginBottom: 20,
    fontSize: 16,
  },

  loginButton: {
    backgroundColor: '#E96A9D',
    borderRadius: 13,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },

  disabledButton: {
    opacity: 0.6,
  },

  loginButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },

  createAccount: {
    textAlign: 'center',
    marginTop: 25,
    color: '#E96A9D',
    fontSize: 15,
  },
});