import { router } from 'expo-router';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

export default function SettingsScreen() {
  return (
    <View style={styles.container}>
      <Pressable onPress={() => router.back()}>
        <Text style={styles.back}>‹</Text>
      </Pressable>

      <Text style={styles.title}>Ajustes</Text>

      <Text style={styles.text}>
        Esta sección se desarrollará próximamente.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    paddingTop: 60,
  },

  back: {
    fontSize: 40,
  },

  title: {
    fontSize: 24,
    fontWeight: '600',
    marginTop: 20,
  },

  text: {
    marginTop: 20,
    fontSize: 16,
    color: '#777777',
  },
});