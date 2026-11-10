import {
  router,
  useFocusEffect,
} from 'expo-router';

import {
  useCallback,
  useState,
} from 'react';

import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {
  getGoals,
} from '../database/database';

import {
  getSessionUserId,
} from '../services/session';

type Goal = {
  id: number;
  usuario_id: number;
  nombre: string;
  monto_objetivo: number;
  monto_acumulado: number;
  porcentaje: number;
};

export default function GoalsScreen() {
  const [goals, setGoals] =
    useState<Goal[]>([]);

  const [loading, setLoading] =
    useState(true);

  async function loadGoals() {
    try {
      setLoading(true);

      const userId =
        await getSessionUserId();

      if (!userId) {
        router.replace('/');
        return;
      }

      const result =
        (await getGoals(
          userId
        )) as Goal[];

      setGoals(result);
    } catch (error) {
      console.error(
        'Error al cargar metas:',
        error
      );
    } finally {
      setLoading(false);
    }
  }

  useFocusEffect(
    useCallback(() => {
      loadGoals();
    }, [])
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable
          onPress={() =>
            router.back()
          }
        >
          <Text
            style={styles.backButton}
          >
            ‹
          </Text>
        </Pressable>

        <Text style={styles.title}>
          Metas
        </Text>

        <Pressable
          onPress={() =>
            router.push('/new-goal')
          }
        >
          <Text
            style={styles.addButton}
          >
            +
          </Text>
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={
          styles.scrollContent
        }
      >
        {loading ? (
          <View
            style={
              styles.emptyContainer
            }
          >
            <Text
              style={styles.emptyText}
            >
              Cargando metas...
            </Text>
          </View>
        ) : goals.length === 0 ? (
          <View
            style={
              styles.emptyContainer
            }
          >
            <Text
              style={styles.emptyTitle}
            >
              Aún no tienes metas
            </Text>

            <Text
              style={styles.emptyText}
            >
              Crea una meta para comenzar a registrar tu ahorro.
            </Text>

            <Pressable
              style={
                styles.createButton
              }
              onPress={() =>
                router.push(
                  '/new-goal'
                )
              }
            >
              <Text
                style={
                  styles.createButtonText
                }
              >
                Crear meta
              </Text>
            </Pressable>
          </View>
        ) : (
          goals.map((goal) => {
            const progress =
              Math.min(
                Math.max(
                  goal.porcentaje,
                  0
                ),
                100
              );

            return (
              <Pressable
                key={goal.id}
                style={
                  styles.goalCard
                }
                onPress={() =>
                  router.push({
                    pathname:
                      '/goal-detail',
                    params: {
                      id: String(
                        goal.id
                      ),
                    },
                  })
                }
              >
                <View
                  style={
                    styles.goalHeader
                  }
                >
                  <Text
                    style={
                      styles.goalName
                    }
                  >
                    {goal.nombre}
                  </Text>

                  <Text
                    style={
                      styles.goalPercentage
                    }
                  >
                    {Math.round(
                      progress
                    )}
                    %
                  </Text>
                </View>

                <Text
                  style={
                    styles.goalAmount
                  }
                >
                  $
                  {goal.monto_acumulado.toLocaleString(
                    'en-US',
                    {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }
                  )}

                  {' / '}

                  $
                  {goal.monto_objetivo.toLocaleString(
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
                        width: `${progress}%`,
                      },
                    ]}
                  />
                </View>

                <Text
                  style={
                    styles.viewGoal
                  }
                >
                  Ver meta ›
                </Text>
              </Pressable>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const styles =
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#FFFFFF',
      paddingHorizontal: 22,
      paddingTop: 60,
    },

    header: {
      flexDirection: 'row',
      justifyContent:
        'space-between',
      alignItems: 'center',

      paddingBottom: 18,

      borderBottomWidth: 1,
      borderBottomColor: '#DDDDDD',
    },

    backButton: {
      fontSize: 38,
    },

    title: {
      fontSize: 22,
      fontWeight: '600',
    },

    addButton: {
      fontSize: 34,
      fontWeight: '300',
    },

    scrollContent: {
      paddingBottom: 50,
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
      color: '#777777',
      textAlign: 'center',
      fontSize: 15,
    },

    createButton: {
      marginTop: 20,
      backgroundColor: '#E96A9D',
      borderRadius: 13,
      paddingVertical: 13,
      paddingHorizontal: 25,
    },

    createButtonText: {
      color: '#FFFFFF',
      fontWeight: '600',
    },

    goalCard: {
      marginTop: 20,
      backgroundColor: '#FDEAF1',
      borderRadius: 16,
      padding: 20,
    },

    goalHeader: {
      flexDirection: 'row',
      justifyContent:
        'space-between',
      alignItems: 'center',
    },

    goalName: {
      fontSize: 18,
      fontWeight: '600',
    },

    goalPercentage: {
      fontSize: 18,
      fontWeight: '600',
      color: '#E96A9D',
    },

    goalAmount: {
      marginTop: 8,
      fontSize: 15,
      color: '#555555',
    },

    progressBackground: {
      width: '100%',
      height: 9,
      borderRadius: 10,
      backgroundColor: '#FFFFFF',
      marginTop: 16,
      overflow: 'hidden',
    },

    progressBar: {
      height: '100%',
      backgroundColor: '#E96A9D',
      borderRadius: 10,
    },

    viewGoal: {
      marginTop: 14,
      alignSelf: 'flex-end',
      color: '#B63F70',
      fontWeight: '600',
    },
  });