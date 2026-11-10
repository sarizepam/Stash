import {
  router,
  useLocalSearchParams,
} from 'expo-router';

import { useEffect, useState } from 'react';

import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import {
  createCategory,
  getCategoryById,
  updateCategory,
} from '../database/database';

import {
  getSessionUserId,
} from '../services/session';

const categoryColors = [
  '#8DBD91',
  '#76AEDD',
  '#E5A3C2',
  '#E8D27C',
  '#E56A70',
  '#B49ADE',
  '#E96A9D',
  '#A8A8A8',
];

export default function NewCategoryScreen() {
  const params = useLocalSearchParams();

  const categoryId =
    params.id ? Number(params.id) : null;

  const isEditing =
    categoryId !== null;

  const [name, setName] = useState('');
  const [color, setColor] =
    useState('#E96A9D');

  const [loading, setLoading] =
    useState(false);

  useEffect(() => {
    if (isEditing) {
      loadCategory();
    }
  }, [categoryId]);

  async function loadCategory() {
    if (!categoryId) return;

    try {
      const userId =
        await getSessionUserId();

      if (!userId) {
        router.replace('/');
        return;
      }

      const result =
        (await getCategoryById(
          categoryId,
          userId
        )) as {
          id: number;
          nombre: string;
          color: string | null;
        } | null;

      if (!result) {
        Alert.alert(
          'Categoría no encontrada'
        );

        router.back();
        return;
      }

      setName(result.nombre);
      setColor(
        result.color || '#E96A9D'
      );
    } catch (error) {
      console.error(
        'Error al cargar categoría:',
        error
      );
    }
  }

  async function handleSave() {
    if (!name.trim()) {
      Alert.alert(
        'Nombre requerido',
        'Escribe un nombre para la categoría.'
      );
      return;
    }

    try {
      setLoading(true);

      const userId =
        await getSessionUserId();

      if (!userId) {
        router.replace('/');
        return;
      }

      if (isEditing && categoryId) {
        await updateCategory(
          categoryId,
          userId,
          name,
          color
        );
      } else {
        await createCategory(
          userId,
          name,
          color
        );
      }

      router.back();
    } catch (error: any) {
      console.error(
        'Error al guardar categoría:',
        error
      );

      Alert.alert(
        'Error',
        error?.message ||
          'No se pudo guardar la categoría.'
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
        >
          <Text style={styles.close}>
            ×
          </Text>
        </Pressable>

        <Text style={styles.title}>
          {isEditing
            ? 'Editar categoría'
            : 'Nueva categoría'}
        </Text>

        <Pressable
          onPress={handleSave}
          disabled={loading}
        >
          <Text style={styles.confirm}>
            ✓
          </Text>
        </Pressable>
      </View>

      <Text style={styles.label}>
        Nombre de la categoría
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Ej. Mascotas"
        value={name}
        onChangeText={setName}
      />

      <Text style={styles.label}>
        Color
      </Text>

      <View style={styles.colorsContainer}>
        {categoryColors.map((item) => (
          <Pressable
            key={item}
            style={[
              styles.colorCircle,
              {
                backgroundColor: item,
              },
              color === item &&
                styles.colorSelected,
            ]}
            onPress={() =>
              setColor(item)
            }
          />
        ))}
      </View>

      <Pressable
        style={[
          styles.saveButton,
          loading &&
            styles.disabledButton,
        ]}
        onPress={handleSave}
        disabled={loading}
      >
        <Text style={styles.saveButtonText}>
          {loading
            ? 'Guardando...'
            : isEditing
            ? 'Guardar cambios'
            : 'Crear categoría'}
        </Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  content: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },

  header: {
    flexDirection: 'row',
    justifyContent:
      'space-between',
    alignItems: 'center',
    marginBottom: 35,
  },

  close: {
    fontSize: 32,
  },

  title: {
    fontSize: 21,
    fontWeight: '600',
  },

  confirm: {
    fontSize: 26,
    color: '#E96A9D',
  },

  label: {
    fontSize: 15,
    fontWeight: '500',
    marginTop: 20,
    marginBottom: 10,
  },

  input: {
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 13,
    paddingHorizontal: 15,
    paddingVertical: 15,
    fontSize: 16,
  },

  colorsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
  },

  colorCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },

  colorSelected: {
    borderWidth: 3,
    borderColor: '#222222',
  },

  saveButton: {
    marginTop: 45,
    backgroundColor: '#E96A9D',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },

  disabledButton: {
    opacity: 0.6,
  },

  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});