import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { initDatabase } from '../database/database';

export default function RootLayout() {
  useEffect(() => {
    initDatabase()
      .then(() => {
        console.log('Base de datos STASH inicializada');
      })
      .catch((error) => {
        console.error(
          'Error al inicializar la base de datos:',
          error
        );
      });
  }, []);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    />
  );
}