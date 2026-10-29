import { router } from 'expo-router';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

export default function LoginScreen() {
  return (
    <View style={styles.container}>
      <Pressable
        style={styles.backButton}
        onPress={() => router.back()}
      >
        <Text style={styles.backText}>‹</Text>
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
        />

        <Text style={styles.label}>
          Contraseña
        </Text>

        <TextInput
          style={styles.input}
          placeholder="••••••••"
          secureTextEntry
        />

        <Pressable
          style={styles.loginButton}
          onPress={() => router.replace('/dashboard')}
        >
          <Text style={styles.loginButtonText}>
            Iniciar sesión
          </Text>
        </Pressable>

        <Pressable>
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