import {
  router,
  useLocalSearchParams,
} from 'expo-router';

import {
  useEffect,
  useState,
} from 'react';

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
  adjustGoalAmount,
  deleteGoal,
  getGoalById,
  updateGoal,
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

export default function GoalDetailScreen() {
  const params =
    useLocalSearchParams<{
      id?: string;
    }>();

  const goalId = Number(params.id);

  const [goal, setGoal] =
    useState<Goal | null>(null);

  const [name, setName] =
    useState('');

  const [target, setTarget] =
    useState('');

  const [amount, setAmount] =
    useState('');

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  useEffect(() => {
    loadGoal();
  }, [goalId]);

  async function loadGoal() {
    try {
      setLoading(true);

      const userId =
        await getSessionUserId();

      if (!userId) {
        router.replace('/');
        return;
      }

      if (
        !goalId ||
        Number.isNaN(goalId)
      ) {
        Alert.alert(
          'Error',
          'No se recibió una meta válida.'
        );

        router.back();
        return;
      }

      const result =
        (await getGoalById(
          goalId,
          userId
        )) as Goal | null;

      if (!result) {
        Alert.alert(
          'Meta no encontrada'
        );

        router.back();
        return;
      }

      setGoal(result);

      setName(result.nombre);

      setTarget(
        result.monto_objetivo.toString()
      );
    } catch (error) {
      console.error(
        'Error al cargar meta:',
        error
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleAdjustment(
    operation: 'add' | 'subtract'
  ) {
    if (!goal) return;

    const parsedAmount =
      Number(amount.replace(',', '.'));

    if (
      amount.trim() === '' ||
      Number.isNaN(parsedAmount) ||
      parsedAmount <= 0
    ) {
      Alert.alert(
        'Cantidad inválida',
        'Ingresa una cantidad mayor que cero.'
      );

      return;
    }

    try {
      const userId =
        await getSessionUserId();

      if (!userId) {
        router.replace('/');
        return;
      }

      const adjustment =
        operation === 'add'
          ? parsedAmount
          : -parsedAmount;

      await adjustGoalAmount(
        goal.id,
        userId,
        adjustment
      );

      setAmount('');

      await loadGoal();
    } catch (error: any) {
      console.error(
        'Error al modificar ahorro:',
        error
      );

      Alert.alert(
        'Error',
        error?.message ||
          'No se pudo modificar el ahorro.'
      );
    }
  }

  async function handleSave() {
    if (!goal) return;

    if (!name.trim()) {
      Alert.alert(
        'Nombre requerido',
        'La meta debe tener un nombre.'
      );

      return;
    }

    const parsedTarget =
      Number(target.replace(',', '.'));

    if (
      target.trim() === '' ||
      Number.isNaN(parsedTarget) ||
      parsedTarget <= 0
    ) {
      Alert.alert(
        'Monto inválido',
        'Ingresa un monto objetivo válido.'
      );

      return;
    }

    try {
      setSaving(true);

      const userId =
        await getSessionUserId();

      if (!userId) {
        router.replace('/');
        return;
      }

      await updateGoal(
        goal.id,
        userId,
        name,
        parsedTarget
      );

      await loadGoal();

      Alert.alert(
        'Meta actualizada',
        'Los cambios se guardaron correctamente.'
      );
    } catch (error: any) {
      console.error(
        'Error al actualizar meta:',
        error
      );

      Alert.alert(
        'Error',
        error?.message ||
          'No se pudo actualizar la meta.'
      );
    } finally {
      setSaving(false);
    }
  }

  function confirmDelete() {
    if (!goal) return;

    Alert.alert(
      'Eliminar meta',
      `¿Quieres eliminar "${goal.nombre}"?`,
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: handleDelete,
        },
      ]
    );
  }

  async function handleDelete() {
    if (!goal) return;

    try {
      const userId =
        await getSessionUserId();

      if (!userId) {
        router.replace('/');
        return;
      }

      await deleteGoal(
        goal.id,
        userId
      );

      router.back();
    } catch (error: any) {
      console.error(
        'Error al eliminar meta:',
        error
      );

      Alert.alert(
        'Error',
        error?.message ||
          'No se pudo eliminar la meta.'
      );
    }
  }

  if (loading || !goal) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>
          Cargando meta...
        </Text>
      </View>
    );
  }

  const progress =
    Math.min(
      Math.max(
        goal.porcentaje,
        0
      ),
      100
    );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.header}>
        <Pressable
          onPress={() =>
            router.back()
          }
        >
          <Text style={styles.back}>
            ‹
          </Text>
        </Pressable>

        <Text style={styles.title}>
          Detalle de meta
        </Text>

        <View style={styles.headerSpace} />
      </View>

      <View style={styles.goalCard}>
        <Text style={styles.goalName}>
          {goal.nombre}
        </Text>

        <Text style={styles.percentage}>
          {Math.round(progress)}%
        </Text>

        <Text style={styles.savedAmount}>
          $
          {goal.monto_acumulado.toLocaleString(
            'en-US',
            {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }
          )}
        </Text>

        <Text style={styles.targetText}>
          de $
          {goal.monto_objetivo.toLocaleString(
            'en-US',
            {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }
          )}
        </Text>

        <View style={styles.progressBackground}>
          <View
            style={[
              styles.progressBar,
              {
                width: `${progress}%`,
              },
            ]}
          />
        </View>
      </View>

      <Text style={styles.sectionTitle}>
        Ajustar ahorro
      </Text>

      <View style={styles.amountContainer}>
        <Text style={styles.currency}>
          $
        </Text>

        <TextInput
          style={styles.amountInput}
          placeholder="0.00"
          keyboardType="decimal-pad"
          value={amount}
          onChangeText={setAmount}
        />
      </View>

      <View style={styles.actions}>
        <Pressable
          style={styles.addButton}
          onPress={() =>
            handleAdjustment('add')
          }
        >
          <Text style={styles.addButtonText}>
            + Agregar
          </Text>
        </Pressable>

        <Pressable
          style={styles.removeButton}
          onPress={() =>
            handleAdjustment(
              'subtract'
            )
          }
        >
          <Text style={styles.removeButtonText}>
            − Retirar
          </Text>
        </Pressable>
      </View>

      <View style={styles.separator} />

      <Text style={styles.sectionTitle}>
        Editar meta
      </Text>

      <Text style={styles.label}>
        Nombre
      </Text>

      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
      />

      <Text style={styles.label}>
        Monto objetivo
      </Text>

      <View style={styles.amountContainer}>
        <Text style={styles.currency}>
          $
        </Text>

        <TextInput
          style={styles.amountInputSmall}
          keyboardType="decimal-pad"
          value={target}
          onChangeText={setTarget}
        />
      </View>

      <Pressable
        style={[
          styles.saveButton,
          saving &&
            styles.disabledButton,
        ]}
        onPress={handleSave}
        disabled={saving}
      >
        <Text style={styles.saveButtonText}>
          {saving
            ? 'Guardando...'
            : 'Guardar cambios'}
        </Text>
      </Pressable>

      <Pressable
        style={styles.deleteButton}
        onPress={confirmDelete}
      >
        <Text style={styles.deleteButtonText}>
          Eliminar meta
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
    paddingBottom: 60,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },

  loadingText: {
    color: '#777777',
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },

  back: {
    fontSize: 40,
  },

  title: {
    fontSize: 21,
    fontWeight: '600',
  },

  headerSpace: {
    width: 30,
  },

  goalCard: {
    backgroundColor: '#FDEAF1',
    borderRadius: 18,
    padding: 22,
    alignItems: 'center',
  },

  goalName: {
    fontSize: 21,
    fontWeight: '600',
  },

  percentage: {
    fontSize: 18,
    color: '#E96A9D',
    fontWeight: '600',
    marginTop: 5,
  },

  savedAmount: {
    fontSize: 32,
    fontWeight: '600',
    marginTop: 15,
  },

  targetText: {
    color: '#666666',
    marginTop: 3,
  },

  progressBackground: {
    width: '100%',
    height: 10,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    marginTop: 18,
    overflow: 'hidden',
  },

  progressBar: {
    height: '100%',
    backgroundColor: '#E96A9D',
    borderRadius: 10,
  },

  sectionTitle: {
    fontSize: 19,
    fontWeight: '600',
    marginTop: 30,
    marginBottom: 15,
  },

  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 13,
    paddingHorizontal: 15,
  },

  currency: {
    fontSize: 24,
    marginRight: 8,
  },

  amountInput: {
    flex: 1,
    paddingVertical: 15,
    fontSize: 20,
  },

  amountInputSmall: {
    flex: 1,
    paddingVertical: 15,
    fontSize: 18,
  },

  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 15,
  },

  addButton: {
    flex: 1,
    backgroundColor: '#D9F1D8',
    borderRadius: 12,
    alignItems: 'center',
    paddingVertical: 14,
  },

  addButtonText: {
    color: '#3F7A48',
    fontWeight: '600',
  },

  removeButton: {
    flex: 1,
    backgroundColor: '#F9D7DE',
    borderRadius: 12,
    alignItems: 'center',
    paddingVertical: 14,
  },

  removeButtonText: {
    color: '#C45160',
    fontWeight: '600',
  },

  separator: {
    height: 1,
    backgroundColor: '#EEEEEE',
    marginTop: 35,
  },

  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 9,
    marginTop: 18,
  },

  input: {
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 13,
    paddingHorizontal: 15,
    paddingVertical: 15,
    fontSize: 16,
  },

  saveButton: {
    marginTop: 35,
    backgroundColor: '#E96A9D',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },

  saveButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },

  disabledButton: {
    opacity: 0.6,
  },

  deleteButton: {
    marginTop: 15,
    backgroundColor: '#FCE7EA',
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
  },

  deleteButtonText: {
    color: '#D65161',
    fontWeight: '600',
  },
});