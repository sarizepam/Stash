import { router } from 'expo-router';
import { useEffect, useState } from 'react';

import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { getSessionUserId } from '../services/session';

export default function WelcomeScreen() {
  const [checkingSession, setCheckingSession] =
    useState(true);

  useEffect(() => {
    async function checkSession() {
      try {
        const userId =
          await getSessionUserId();

        if (userId) {
          router.replace('/dashboard');
          return;
        }

        setCheckingSession(false);
      } catch (error) {
        console.error(
          'Error al comprobar sesión:',
          error
        );

        setCheckingSession(false);
      }
    }

    checkSession();
  }, []);

  if (checkingSession) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator
          size="large"
          color="#E96A9D"
        />

        <Text style={styles.loadingText}>
          Cargando STASH...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Text style={styles.symbol}>
          $
        </Text>

        <Text style={styles.logo}>
          stash
        </Text>

        <Text style={styles.description}>
          Controla tus gastos y organiza tus finanzas personales.
        </Text>
      </View>

      <View style={styles.buttonsContainer}>
        <Pressable
          style={styles.primaryButton}
          onPress={() =>
            router.push('/login')
          }
        >
          <Text style={styles.primaryButtonText}>
            Iniciar sesión
          </Text>
        </Pressable>

        <Pressable
          style={styles.secondaryButton}
          onPress={() =>
            router.push('/register')
          }
        >
          <Text style={styles.secondaryButtonText}>
            Crear cuenta
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
    justifyContent: 'space-between',
    paddingHorizontal: 30,
    paddingTop: 160,
    paddingBottom: 60,
  },

  loadingContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  loadingText: {
    marginTop: 15,
    fontSize: 15,
    color: '#777777',
  },

  logoContainer: {
    alignItems: 'center',
  },

  symbol: {
    fontSize: 90,
    color: '#E96A9D',
    fontWeight: '300',
    marginBottom: -12,
  },

  logo: {
    fontSize: 48,
    color: '#111111',
    fontWeight: '400',
  },

  description: {
    marginTop: 20,
    color: '#777777',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 23,
  },

  buttonsContainer: {
    gap: 14,
  },

  primaryButton: {
    backgroundColor: '#E96A9D',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },

  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },

  secondaryButton: {
    borderWidth: 1.5,
    borderColor: '#111111',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },

  secondaryButtonText: {
    color: '#111111',
    fontSize: 16,
    fontWeight: '500',
  },
});