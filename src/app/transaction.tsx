import { StyleSheet, Text, View } from 'react-native';

export default function TransactionScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Nuevo gasto</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  title: {
    fontSize: 30,
    fontWeight: '600',
  },
});