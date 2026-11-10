import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { getExpenses } from '../database/database';
import { getSessionUserId } from '../services/session';

type Expense = {
  id: number;
  monto: number;
  fecha: string;
  nota: string | null;

  categoria_id: number | null;
  categoria: string | null;
  categoria_color: string | null;

  cuenta_id: number;
  cuenta: string;
  tipo_cuenta: string;
};

export default function HistoryScreen() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadExpenses() {
    try {
      setLoading(true);

      const userId = await getSessionUserId();

      if (!userId) {
        router.replace('/');
        return;
      }

      const result =
        (await getExpenses(userId)) as Expense[];

      setExpenses(result);
    } catch (error) {
      console.error(
        'Error al cargar gastos:',
        error
      );
    } finally {
      setLoading(false);
    }
  }

  useFocusEffect(
    useCallback(() => {
      loadExpenses();
    }, [])
  );

  const totalExpenses = expenses.reduce(
    (total, expense) =>
      total + expense.monto,
    0
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
          Gastos
        </Text>

        <Pressable
          onPress={() =>
            router.push('/transaction')
          }
        >
          <Text style={styles.addButton}>
            +
          </Text>
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={
          styles.scrollContent
        }
      >
        {!loading && expenses.length > 0 && (
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>
              Total de gastos
            </Text>

            <Text style={styles.summaryValue}>
              $
              {totalExpenses.toLocaleString(
                'en-US',
                {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                }
              )}
            </Text>

            <Text style={styles.summaryCount}>
              {expenses.length}{' '}
              {expenses.length === 1
                ? 'gasto registrado'
                : 'gastos registrados'}
            </Text>
          </View>
        )}

        {loading ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              Cargando gastos...
            </Text>
          </View>
        ) : expenses.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>
              Todavía no tienes gastos
            </Text>

            <Text style={styles.emptyText}>
              Registra tu primer gasto para comenzar a ver tu historial.
            </Text>

            <Pressable
              style={styles.firstExpenseButton}
              onPress={() =>
                router.push('/transaction')
              }
            >
              <Text
                style={styles.firstExpenseButtonText}
              >
                Registrar gasto
              </Text>
            </Pressable>
          </View>
        ) : (
          expenses.map((expense) => (
            <Pressable
              key={expense.id}
              style={styles.expenseCard}
              onPress={() =>
                router.push({
                  pathname: '/expense-detail',
                  params: {
                    id: expense.id.toString(),
                  },
                })
              }
            >
              <View
                style={[
                  styles.categoryIcon,
                  {
                    backgroundColor:
                      expense.categoria_color ||
                      '#D9D9D9',
                  },
                ]}
              />

              <View style={styles.expenseInfo}>
                <Text style={styles.expenseTitle}>
                  {expense.categoria ||
                    'Sin categoría'}
                </Text>

                {expense.nota ? (
                  <Text style={styles.expenseNote}>
                    {expense.nota}
                  </Text>
                ) : null}

                <Text style={styles.expenseAccount}>
                  {expense.cuenta} -{' '}
                  {expense.tipo_cuenta}
                </Text>

                <Text style={styles.expenseDate}>
                  {expense.fecha}
                </Text>
              </View>

              <View style={styles.expenseRight}>
                <Text style={styles.expenseAmount}>
                  -$
                  {expense.monto.toLocaleString(
                    'en-US',
                    {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }
                  )}
                </Text>

                <Text style={styles.arrow}>
                  ›
                </Text>
              </View>
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

  scrollContent: {
    paddingBottom: 50,
  },

  summaryCard: {
    backgroundColor: '#FDEAF1',
    borderRadius: 16,
    padding: 20,
    marginTop: 25,
    marginBottom: 12,
  },

  summaryLabel: {
    fontSize: 14,
    color: '#555555',
  },

  summaryValue: {
    fontSize: 28,
    fontWeight: '600',
    marginTop: 4,
  },

  summaryCount: {
    fontSize: 13,
    color: '#777777',
    marginTop: 6,
  },

  emptyContainer: {
    marginTop: 100,
    alignItems: 'center',
    paddingHorizontal: 30,
  },

  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },

  emptyText: {
    fontSize: 15,
    color: '#777777',
    textAlign: 'center',
  },

  firstExpenseButton: {
    marginTop: 20,
    backgroundColor: '#E96A9D',
    borderRadius: 13,
    paddingHorizontal: 25,
    paddingVertical: 13,
  },

  firstExpenseButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },

  expenseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },

  categoryIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    marginRight: 14,
  },

  expenseInfo: {
    flex: 1,
  },

  expenseTitle: {
    fontSize: 16,
    fontWeight: '600',
  },

  expenseNote: {
    fontSize: 14,
    color: '#555555',
    marginTop: 3,
  },

  expenseAccount: {
    fontSize: 12,
    color: '#777777',
    marginTop: 4,
  },

  expenseDate: {
    fontSize: 12,
    color: '#999999',
    marginTop: 3,
  },

  expenseRight: {
    alignItems: 'flex-end',
    marginLeft: 10,
  },

  expenseAmount: {
    fontSize: 16,
    color: '#E56A70',
    fontWeight: '600',
  },

  arrow: {
    fontSize: 24,
    color: '#777777',
    marginTop: 3,
  },
});