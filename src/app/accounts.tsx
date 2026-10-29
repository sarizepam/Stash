import { StyleSheet, Text, View } from 'react-native';

export default function AccountsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Cuentas
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },

  title: {
    fontSize: 30,
    fontWeight: '600',
  },
});