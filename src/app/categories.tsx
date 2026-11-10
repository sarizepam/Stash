import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {
  deleteCategory,
  getCategories,
} from '../database/database';

import {
  getSessionUserId,
} from '../services/session';

type Category = {
  id: number;
  usuario_id: number;
  nombre: string;
  color: string | null;
};

export default function CategoriesScreen() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadCategories() {
    try {
      setLoading(true);

      const userId = await getSessionUserId();

      if (!userId) {
        router.replace('/');
        return;
      }

      const result =
        (await getCategories(userId)) as Category[];

      setCategories(result);
    } catch (error) {
      console.error(
        'Error al cargar categorías:',
        error
      );
    } finally {
      setLoading(false);
    }
  }

  useFocusEffect(
    useCallback(() => {
      loadCategories();
    }, [])
  );

  async function handleDelete(category: Category) {
    Alert.alert(
      'Eliminar categoría',
      `¿Quieres eliminar "${category.nombre}"?`,
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              const userId =
                await getSessionUserId();

              if (!userId) {
                router.replace('/');
                return;
              }

              await deleteCategory(
                category.id,
                userId
              );

              await loadCategories();
            } catch (error) {
              console.error(
                'Error al eliminar categoría:',
                error
              );

              Alert.alert(
                'Error',
                'No se pudo eliminar la categoría.'
              );
            }
          },
        },
      ]
    );
  }

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
          Categorías
        </Text>

        <Pressable
          onPress={() =>
            router.push('/new-category')
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
              Cargando categorías...
            </Text>
          </View>
        ) : categories.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>
              No tienes categorías
            </Text>

            <Text style={styles.emptyText}>
              Presiona + para crear una.
            </Text>
          </View>
        ) : (
          categories.map((category) => (
            <View
              key={category.id}
              style={styles.categoryRow}
            >
              <View
                style={[
                  styles.categoryColor,
                  {
                    backgroundColor:
                      category.color ||
                      '#D9D9D9',
                  },
                ]}
              />

              <Text style={styles.categoryName}>
                {category.nombre}
              </Text>

              <Pressable
                style={styles.editButton}
                onPress={() =>
                  router.push({
                    pathname: '/new-category',
                    params: {
                      id: category.id.toString(),
                    },
                  })
                }
              >
                <Text style={styles.editText}>
                  Editar
                </Text>
              </Pressable>

              <Pressable
                style={styles.deleteButton}
                onPress={() =>
                  handleDelete(category)
                }
              >
                <Text style={styles.deleteText}>
                  ×
                </Text>
              </Pressable>
            </View>
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
  },

  title: {
    fontSize: 22,
    fontWeight: '600',
  },

  addButton: {
    fontSize: 34,
    fontWeight: '300',
  },

  emptyContainer: {
    alignItems: 'center',
    marginTop: 100,
  },

  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },

  emptyText: {
    color: '#777777',
  },

  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },

  categoryColor: {
    width: 26,
    height: 26,
    borderRadius: 13,
    marginRight: 14,
  },

  categoryName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },

  editButton: {
    paddingHorizontal: 10,
    paddingVertical: 8,
  },

  editText: {
    color: '#E96A9D',
    fontWeight: '600',
  },

  deleteButton: {
    marginLeft: 6,
    paddingHorizontal: 10,
  },

  deleteText: {
    fontSize: 25,
    color: '#E56A70',
  },
});