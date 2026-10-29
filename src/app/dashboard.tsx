import { router } from 'expo-router';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

export default function DashboardScreen() {
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      <View style={styles.header}>
        <View style={styles.userSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              Hi
            </Text>
          </View>

          <Text style={styles.greeting}>
            Hey Sarah!
          </Text>
        </View>

        <Text style={styles.notification}>
          ♡
        </Text>
      </View>

      <Text style={styles.sectionLabel}>
        Resumen
      </Text>

      <View style={styles.availableCard}>
        <Text style={styles.cardLabel}>
          Disponible
        </Text>

        <Text style={styles.cardValue}>
          $5,050.00
        </Text>
      </View>

      <View style={styles.savingsCard}>
        <Text style={styles.cardLabel}>
          Ahorro
        </Text>

        <Text style={styles.cardValue}>
          35% / 100%
        </Text>
      </View>

      <View style={styles.recentCard}>
        <Text style={styles.cardLabel}>
          Recientes
        </Text>

        <Text style={styles.cardValue}>
          2,380 entradas
        </Text>
      </View>

      <View style={styles.accountsHeader}>
        <Text style={styles.accountsTitle}>
          Cuentas
        </Text>

        <Pressable
          onPress={() => router.push('/accounts')}
        >
          <Text style={styles.viewMore}>
            Ver todas
          </Text>
        </Pressable>
      </View>

      <Account
        name="BBVA - Crédito"
        color="#76AEDD"
      />

      <Account
        name="Efectivo"
        color="#E56A70"
      />

      <Account
        name="Caja"
        color="#8DBD91"
      />

      <Account
        name="Tarjeta de débito"
        color="#8DBD91"
      />

      <Pressable
        style={styles.addButton}
        onPress={() => router.push('/transaction')}
      >
        <Text style={styles.addButtonText}>
          +
        </Text>
      </Pressable>
    </ScrollView>
  );
}

function Account({
  name,
  color,
}: {
  name: string;
  color: string;
}) {
  return (
    <View style={styles.accountRow}>
      <View
        style={[
          styles.accountColor,
          { backgroundColor: color },
        ]}
      />

      <Text style={styles.accountName}>
        {name}
      </Text>

      <Text style={styles.arrow}>
        ›
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  content: {
    paddingHorizontal: 22,
    paddingTop: 65,
    paddingBottom: 50,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 28,
  },

  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  avatar: {
    width: 45,
    height: 45,
    backgroundColor: '#F8C8DB',
    borderRadius: 23,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  avatarText: {
    fontSize: 16,
  },

  greeting: {
    fontSize: 24,
    fontWeight: '600',
  },

  notification: {
    fontSize: 25,
  },

  sectionLabel: {
    fontSize: 18,
    marginBottom: 12,
  },

  availableCard: {
    backgroundColor: '#D9F1D8',
    borderRadius: 15,
    padding: 18,
    marginBottom: 12,
  },

  savingsCard: {
    backgroundColor: '#F7C8DA',
    borderRadius: 15,
    padding: 18,
    marginBottom: 12,
  },

  recentCard: {
    backgroundColor: '#E5D8F7',
    borderRadius: 15,
    padding: 18,
    marginBottom: 30,
  },

  cardLabel: {
    fontSize: 14,
    color: '#333333',
  },

  cardValue: {
    fontSize: 24,
    fontWeight: '600',
    marginTop: 5,
  },

  accountsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },

  accountsTitle: {
    fontSize: 20,
    fontWeight: '600',
  },

  viewMore: {
    color: '#E96A9D',
  },

  accountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },

  accountColor: {
    width: 19,
    height: 19,
    borderRadius: 10,
    marginRight: 12,
  },

  accountName: {
    flex: 1,
    fontSize: 16,
  },

  arrow: {
    fontSize: 27,
  },

  addButton: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#E96A9D',
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 35,
  },

  addButtonText: {
    color: '#FFFFFF',
    fontSize: 36,
    fontWeight: '300',
  },
});