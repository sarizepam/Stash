import {
  router,
  useFocusEffect,
} from 'expo-router';

import {
  useCallback,
  useState,
} from 'react';

import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {
  getAccounts,
  getExpenseCount,
  getSavingsProgress,
  getTotalBalance,
  getUserById,
} from '../database/database';

import {
  getSessionUserId,
} from '../services/session';

type User = {
  id: number;
  nombre: string;
  correo: string;
  foto_perfil: string | null;
};

type Account = {
  id: number;
  usuario_id: number;
  nombre: string;
  tipo: string;
  saldo_inicial: number;
  saldo_actual: number;
  color: string | null;
};

type SavingsProgress = {
  acumulado: number;
  objetivo: number;
  porcentaje: number;
};

export default function DashboardScreen() {
  const [user, setUser] =
    useState<User | null>(null);

  const [accounts, setAccounts] =
    useState<Account[]>([]);

  const [totalBalance, setTotalBalance] =
    useState(0);

  const [expenseCount, setExpenseCount] =
    useState(0);

  const [savings, setSavings] =
    useState<SavingsProgress>({
      acumulado: 0,
      objetivo: 0,
      porcentaje: 0,
    });

  const [loading, setLoading] =
    useState(true);

  async function loadDashboard() {
    try {
      setLoading(true);

      const userId =
        await getSessionUserId();

      if (!userId) {
        router.replace('/');
        return;
      }

      const [
        userData,
        accountsData,
        balance,
        expenses,
        savingsData,
      ] = await Promise.all([
        getUserById(userId),
        getAccounts(userId),
        getTotalBalance(userId),
        getExpenseCount(userId),
        getSavingsProgress(userId),
      ]);

      setUser(
        userData as User | null
      );

      setAccounts(
        accountsData as Account[]
      );

      setTotalBalance(balance);

      setExpenseCount(expenses);

      setSavings(
        savingsData as SavingsProgress
      );
    } catch (error) {
      console.error(
        'Error al cargar Dashboard:',
        error
      );
    } finally {
      setLoading(false);
    }
  }

  useFocusEffect(
    useCallback(() => {
      loadDashboard();
    }, [])
  );

  const savingsPercentage =
    Math.min(
      Math.max(
        savings.porcentaje,
        0
      ),
      100
    );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={
        styles.content
      }
    >
      <View style={styles.header}>
        <View style={styles.userSection}>
          <Pressable
            style={styles.avatar}
            onPress={() =>
              router.push('/menu')
            }
          >
            {user?.foto_perfil ? (
              <Image
                source={{
                  uri: user.foto_perfil,
                }}
                style={
                  styles.avatarImage
                }
              />
            ) : (
              <Text
                style={
                  styles.avatarText
                }
              >
                {user?.nombre
                  ? user.nombre
                      .charAt(0)
                      .toUpperCase()
                  : 'Hi'}
              </Text>
            )}
          </Pressable>

          <Text
            style={styles.greeting}
          >
            {loading
              ? 'Cargando...'
              : `Hey ${
                  user?.nombre ?? ''
                }!`}
          </Text>
        </View>

        <Text
          style={styles.notification}
        >
          ♡
        </Text>
      </View>

      <Text
        style={styles.sectionLabel}
      >
        Resumen
      </Text>

      <View
        style={styles.availableCard}
      >
        <Text
          style={styles.cardLabel}
        >
          Disponible
        </Text>

        <Text
          style={styles.cardValue}
        >
          $
          {totalBalance.toLocaleString(
            'en-US',
            {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }
          )}
        </Text>

        <Text
          style={styles.cardSubtext}
        >
          Saldo total de tus cuentas
        </Text>
      </View>

      <Pressable
        style={styles.savingsCard}
        onPress={() =>
          router.push('/goals')
        }
      >
        <View
          style={styles.cardHeader}
        >
          <Text
            style={styles.cardLabel}
          >
            Ahorro
          </Text>

          <Text
            style={styles.cardArrow}
          >
            ›
          </Text>
        </View>

        <Text
          style={styles.cardValue}
        >
          {Math.round(
            savingsPercentage
          )}
          % / 100%
        </Text>

        {savings.objetivo > 0 ? (
          <>
            <Text
              style={styles.cardSubtext}
            >
              $
              {savings.acumulado.toLocaleString(
                'en-US',
                {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                }
              )}
              {' de $'}
              {savings.objetivo.toLocaleString(
                'en-US',
                {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                }
              )}
            </Text>

            <View
              style={
                styles.progressBackground
              }
            >
              <View
                style={[
                  styles.progressBar,
                  {
                    width: `${savingsPercentage}%`,
                  },
                ]}
              />
            </View>
          </>
        ) : (
          <Text
            style={styles.cardSubtext}
          >
            Aún no tienes metas de ahorro
          </Text>
        )}
      </Pressable>

      <Pressable
        style={styles.recentCard}
        onPress={() =>
          router.push('/history')
        }
      >
        <View
          style={styles.cardHeader}
        >
          <Text
            style={styles.cardLabel}
          >
            Gastos
          </Text>

          <Text
            style={styles.cardArrow}
          >
            ›
          </Text>
        </View>

        <Text
          style={styles.cardValue}
        >
          {expenseCount}{' '}
          {expenseCount === 1
            ? 'gasto'
            : 'gastos'}
        </Text>

        <Text
          style={styles.cardSubtext}
        >
          Ver historial de movimientos
        </Text>
      </Pressable>

      <View
        style={
          styles.accountsHeader
        }
      >
        <Text
          style={styles.accountsTitle}
        >
          Cuentas
        </Text>

        <Pressable
          onPress={() =>
            router.push('/accounts')
          }
        >
          <Text
            style={styles.viewMore}
          >
            Ver todas
          </Text>
        </Pressable>
      </View>

      {accounts.length === 0 ? (
        <View
          style={
            styles.emptyAccounts
          }
        >
          <Text
            style={
              styles.emptyAccountsText
            }
          >
            Aún no tienes cuentas registradas.
          </Text>

          <Pressable
            onPress={() =>
              router.push(
                '/new-account'
              )
            }
          >
            <Text
              style={
                styles.createAccountText
              }
            >
              Agregar cuenta
            </Text>
          </Pressable>
        </View>
      ) : (
        accounts
          .slice(0, 4)
          .map((account) => (
            <Account
              key={account.id}
              account={account}
            />
          ))
      )}

      <Pressable
        style={styles.addButton}
        onPress={() =>
          router.push(
            '/transaction'
          )
        }
      >
        <Text
          style={styles.addButtonText}
        >
          +
        </Text>
      </Pressable>
    </ScrollView>
  );
}

function Account({
  account,
}: {
  account: Account;
}) {
  return (
    <Pressable
      style={styles.accountRow}
      onPress={() =>
        router.push({
          pathname:
            '/account-detail',

          params: {
            id: String(
              account.id
            ),
          },
        })
      }
    >
      <View
        style={[
          styles.accountColor,
          {
            backgroundColor:
              account.color ||
              '#D9D9D9',
          },
        ]}
      />

      <Text
        style={styles.accountName}
      >
        {account.nombre}
        {' - '}
        {account.tipo}
      </Text>

      <Text style={styles.arrow}>
        ›
      </Text>
    </Pressable>
  );
}

const styles =
  StyleSheet.create({
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
      justifyContent:
        'space-between',
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
      overflow: 'hidden',
    },

    avatarImage: {
      width: 45,
      height: 45,
      borderRadius: 23,
    },

    avatarText: {
      fontSize: 16,
      fontWeight: '500',
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

    cardHeader: {
      flexDirection: 'row',
      justifyContent:
        'space-between',
      alignItems: 'center',
    },

    cardLabel: {
      fontSize: 14,
      color: '#333333',
    },

    cardArrow: {
      fontSize: 23,
      color: '#555555',
    },

    cardValue: {
      fontSize: 24,
      fontWeight: '600',
      marginTop: 5,
    },

    cardSubtext: {
      fontSize: 12,
      color: '#666666',
      marginTop: 6,
    },

    progressBackground: {
      width: '100%',
      height: 7,
      backgroundColor:
        'rgba(255,255,255,0.7)',
      borderRadius: 10,
      marginTop: 12,
      overflow: 'hidden',
    },

    progressBar: {
      height: '100%',
      backgroundColor: '#E96A9D',
      borderRadius: 10,
    },

    accountsHeader: {
      flexDirection: 'row',
      justifyContent:
        'space-between',
      marginBottom: 8,
    },

    accountsTitle: {
      fontSize: 20,
      fontWeight: '600',
    },

    viewMore: {
      color: '#E96A9D',
    },

    emptyAccounts: {
      paddingVertical: 30,
      alignItems: 'center',
    },

    emptyAccountsText: {
      color: '#777777',
      fontSize: 15,
      marginBottom: 10,
    },

    createAccountText: {
      color: '#E96A9D',
      fontWeight: '600',
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