import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { getAccounts } from '../database/database';
import { getSessionUserId } from '../services/session';

type Account = {
  id: number;
  usuario_id: number;
  nombre: string;
  tipo: string;
  saldo_inicial: number;
  saldo_actual: number;
  color: string | null;
};

export default function AccountsScreen() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadAccounts() {
    try {
      setLoading(true);

      const userId = await getSessionUserId();

      if (!userId) {
        router.replace('/');
        return;
      }

      const result =
        (await getAccounts(userId)) as Account[];

      setAccounts(result);
    } catch (error) {
      console.error(
        'Error al cargar cuentas:',
        error
      );
    } finally {
      setLoading(false);
    }
  }

  useFocusEffect(
    useCallback(() => {
      loadAccounts();
    }, [])
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
        >
          <Text style={styles.backButton}>
            ‹
          </Text>
        </Pressable>

        <Text style={styles.title}>
          Cuentas
        </Text>

        <Pressable
          onPress={() =>
            router.push('/new-account')
          }
        >
          <Text style={styles.addButton}>
            +
          </Text>
        </Pressable>
      </View>

      <ScrollView>
        {loading ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              Cargando cuentas...
            </Text>
          </View>
        ) : accounts.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>
              Aún no tienes cuentas
            </Text>

            <Text style={styles.emptyText}>
              Presiona + para registrar tu primera cuenta.
            </Text>
          </View>
        ) : (
          accounts.map((account) => (
            <Pressable
              key={account.id}
              style={styles.accountRow}
              onPress={() =>
                router.push({
                  pathname: '/account-detail',
                  params: {
                    id: account.id.toString(),
                  },
                })
              }
            >
              <View
                style={[
                  styles.accountIcon,
                  {
                    backgroundColor:
                      account.color || '#D9D9D9',
                  },
                ]}
              >
                <View
                  style={styles.innerSquare}
                />
              </View>

              <View style={styles.accountInfo}>
                <Text style={styles.accountName}>
                  {account.nombre} - {account.tipo}
                </Text>

                <Text style={styles.balanceLabel}>
                  Saldo actual
                </Text>

                <Text style={styles.balance}>
                  $
                  {account.saldo_actual.toLocaleString(
                    'en-US',
                    {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }
                  )}
                </Text>
              </View>

              <Text style={styles.arrow}>
                ›
              </Text>
            </Pressable>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 22,
    paddingTop: 60,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#DDDDDD',
  },

  backButton: {
    fontSize: 38,
    color: '#222222',
  },

  title: {
    fontSize: 22,
    fontWeight: '600',
  },

  addButton: {
    fontSize: 34,
    color: '#222222',
    fontWeight: '300',
  },

  emptyContainer: {
    alignItems: 'center',
    marginTop: 100,
    paddingHorizontal: 30,
  },

  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },

  emptyText: {
    color: '#777777',
    fontSize: 15,
    textAlign: 'center',
  },

  accountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },

  accountIcon: {
    width: 42,
    height: 42,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },

  innerSquare: {
    width: 17,
    height: 17,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    borderRadius: 3,
  },

  accountInfo: {
    flex: 1,
  },

  accountName: {
    fontSize: 17,
    fontWeight: '500',
    marginBottom: 6,
  },

  balanceLabel: {
    fontSize: 13,
    color: '#777777',
  },

  balance: {
    fontSize: 16,
    marginTop: 2,
    fontWeight: '500',
  },

  arrow: {
    fontSize: 30,
    color: '#333333',
  },
});