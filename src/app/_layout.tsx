import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';

import {
  ActivityIndicator,
  StyleSheet,
  View,
} from 'react-native';

import {
  initDatabase,
} from '../database/database';

export default function RootLayout() {
  const [databaseReady, setDatabaseReady] =
    useState(false);

  useEffect(() => {
    async function startDatabase() {
      try {
        await initDatabase();

        console.log(
          'Base de datos STASH inicializada'
        );

        setDatabaseReady(true);
      } catch (error) {
        console.error(
          'Error al inicializar la base de datos:',
          error
        );
      }
    }

    startDatabase();
  }, []);

  if (!databaseReady) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator
          size="large"
          color="#E96A9D"
        />
      </View>
    );
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="menu"
        options={{
          presentation:
            'transparentModal',

          animation: 'fade',

          headerShown: false,

          contentStyle: {
            backgroundColor:
              'transparent',
          },
        }}
      />
    </Stack>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
});