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
  deleteExpense,
  getAccounts,
  getCategories,
  getExpenseById,
  updateExpense,
} from '../database/database';

import {
  getSessionUserId,
} from '../services/session';

type Account = {
  id: number;
  nombre: string;
  tipo: string;
  saldo_actual: number;
  color: string | null;
};

type Category = {
  id: number;
  nombre: string;
  color: string | null;
};

type Expense = {
  id: number;
  usuario_id: number;
  cuenta_id: number;
  categoria_id: number | null;
  monto: number;
  fecha: string;
  nota: string | null;

  categoria: string | null;
  categoria_color: string | null;

  cuenta: string;
  tipo_cuenta: string;
};

export default function ExpenseDetailScreen() {
  const params =
    useLocalSearchParams<{
      id?: string;
    }>();

  const expenseId =
    Number(params.id);

  const [expense, setExpense] =
    useState<Expense | null>(null);

  const [accounts, setAccounts] =
    useState<Account[]>([]);

  const [categories, setCategories] =
    useState<Category[]>([]);

  const [amount, setAmount] =
    useState('');

  const [selectedAccountId, setSelectedAccountId] =
    useState<number | null>(null);

  const [selectedCategoryId, setSelectedCategoryId] =
    useState<number | null>(null);

  const [date, setDate] =
    useState('');

  const [note, setNote] =
    useState('');

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  useEffect(() => {
    loadData();
  }, [expenseId]);

  async function loadData() {
    try {
      setLoading(true);

      const userId =
        await getSessionUserId();

      if (!userId) {
        router.replace('/');
        return;
      }

      if (
        !expenseId ||
        Number.isNaN(expenseId)
      ) {
        Alert.alert(
          'Error',
          'No se recibió un gasto válido.'
        );

        router.back();
        return;
      }

      const expenseResult =
        (await getExpenseById(
          expenseId,
          userId
        )) as Expense | null;

      if (!expenseResult) {
        Alert.alert(
          'Gasto no encontrado',
          'No fue posible encontrar este gasto.'
        );

        router.back();
        return;
      }

      const accountsResult =
        (await getAccounts(
          userId
        )) as Account[];

      const categoriesResult =
        (await getCategories(
          userId
        )) as Category[];

      setExpense(expenseResult);

      setAccounts(
        accountsResult
      );

      setCategories(
        categoriesResult
      );

      setAmount(
        expenseResult.monto.toString()
      );

      setSelectedAccountId(
        expenseResult.cuenta_id
      );

      setSelectedCategoryId(
        expenseResult.categoria_id
      );

      setDate(
        expenseResult.fecha
      );

      setNote(
        expenseResult.nota || ''
      );
    } catch (error) {
      console.error(
        'Error al cargar gasto:',
        error
      );

      Alert.alert(
        'Error',
        'No fue posible cargar el gasto.'
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    const parsedAmount =
      Number(
        amount.replace(',', '.')
      );

    if (
      amount.trim() === '' ||
      Number.isNaN(parsedAmount) ||
      parsedAmount <= 0
    ) {
      Alert.alert(
        'Monto inválido',
        'Ingresa un monto mayor que cero.'
      );

      return;
    }

    if (!selectedAccountId) {
      Alert.alert(
        'Cuenta requerida',
        'Selecciona una cuenta.'
      );

      return;
    }

    if (!selectedCategoryId) {
      Alert.alert(
        'Categoría requerida',
        'Selecciona una categoría.'
      );

      return;
    }

    if (!date.trim()) {
      Alert.alert(
        'Fecha requerida',
        'Ingresa la fecha del gasto.'
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

      await updateExpense(
        expenseId,
        userId,
        selectedAccountId,
        selectedCategoryId,
        parsedAmount,
        date,
        note
      );

      Alert.alert(
        'Gasto actualizado',
        'Los cambios se guardaron correctamente.',
        [
          {
            text: 'Aceptar',
            onPress: () =>
              router.back(),
          },
        ]
      );
    } catch (error: any) {
      console.error(
        'Error al actualizar gasto:',
        error
      );

      Alert.alert(
        'Error',
        error?.message ||
          'No fue posible actualizar el gasto.'
      );
    } finally {
      setSaving(false);
    }
  }

  async function confirmDelete() {
    Alert.alert(
      'Eliminar gasto',
      '¿Seguro que quieres eliminar este gasto? El dinero será devuelto a la cuenta correspondiente.',
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
    try {
      const userId =
        await getSessionUserId();

      if (!userId) {
        router.replace('/');
        return;
      }

      await deleteExpense(
        expenseId,
        userId
      );

      Alert.alert(
        'Gasto eliminado',
        'El gasto fue eliminado y el dinero fue devuelto a la cuenta.',
        [
          {
            text: 'Aceptar',
            onPress: () =>
              router.back(),
          },
        ]
      );
    } catch (error: any) {
      console.error(
        'Error al eliminar gasto:',
        error
      );

      Alert.alert(
        'Error',
        error?.message ||
          'No fue posible eliminar el gasto.'
      );
    }
  }

  if (
    loading ||
    !expense
  ) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>
          Cargando gasto...
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={
        styles.content
      }
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
          Editar gasto
        </Text>

        <View
          style={styles.headerSpace}
        />
      </View>

      <Text style={styles.amountLabel}>
        Monto
      </Text>

      <View
        style={styles.amountContainer}
      >
        <Text style={styles.currency}>
          $
        </Text>

        <TextInput
          style={styles.amountInput}
          value={amount}
          onChangeText={setAmount}
          keyboardType="decimal-pad"
          placeholder="0.00"
        />
      </View>

      <View
        style={styles.sectionHeader}
      >
        <Text
          style={
            styles.sectionTitleNoMargin
          }
        >
          Categoría
        </Text>

        <Pressable
          onPress={() =>
            router.push(
              '/categories'
            )
          }
        >
          <Text
            style={styles.manageText}
          >
            Administrar
          </Text>
        </Pressable>
      </View>

      <View
        style={styles.optionsContainer}
      >
        {categories.map(
          (category) => (
            <Pressable
              key={category.id}
              style={[
                styles.optionButton,

                selectedCategoryId ===
                  category.id &&
                  styles.optionSelected,
              ]}
              onPress={() =>
                setSelectedCategoryId(
                  category.id
                )
              }
            >
              <View
                style={[
                  styles.colorCircle,
                  {
                    backgroundColor:
                      category.color ||
                      '#D9D9D9',
                  },
                ]}
              />

              <Text
                style={[
                  styles.optionText,

                  selectedCategoryId ===
                    category.id &&
                    styles.optionTextSelected,
                ]}
              >
                {category.nombre}
              </Text>
            </Pressable>
          )
        )}
      </View>

      <Pressable
        style={
          styles.newCategoryButton
        }
        onPress={() =>
          router.push(
            '/new-category'
          )
        }
      >
        <Text
          style={styles.newCategoryText}
        >
          + Nueva categoría
        </Text>
      </Pressable>

      <Text style={styles.sectionTitle}>
        Cuenta
      </Text>

      <View
        style={styles.optionsContainer}
      >
        {accounts.map(
          (account) => (
            <Pressable
              key={account.id}
              style={[
                styles.optionButton,

                selectedAccountId ===
                  account.id &&
                  styles.optionSelected,
              ]}
              onPress={() =>
                setSelectedAccountId(
                  account.id
                )
              }
            >
              <View
                style={[
                  styles.colorCircle,
                  {
                    backgroundColor:
                      account.color ||
                      '#D9D9D9',
                  },
                ]}
              />

              <View style={styles.accountInfo}>
                <Text
                  style={[
                    styles.optionText,

                    selectedAccountId ===
                      account.id &&
                      styles.optionTextSelected,
                  ]}
                >
                  {account.nombre}
                  {' - '}
                  {account.tipo}
                </Text>

                <Text
                  style={styles.balance}
                >
                  Saldo actual: $
                  {account.saldo_actual.toLocaleString(
                    'en-US',
                    {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }
                  )}
                </Text>
              </View>
            </Pressable>
          )
        )}
      </View>

      <Text style={styles.sectionTitle}>
        Fecha
      </Text>

      <TextInput
        style={styles.input}
        value={date}
        onChangeText={setDate}
        placeholder="AAAA-MM-DD"
      />

      <Text style={styles.sectionTitle}>
        Nota
      </Text>

      <TextInput
        style={[
          styles.input,
          styles.noteInput,
        ]}
        value={note}
        onChangeText={setNote}
        placeholder="Nota opcional"
        multiline
      />

      <Pressable
        style={[
          styles.saveButton,

          saving &&
            styles.disabledButton,
        ]}
        onPress={handleSave}
        disabled={saving}
      >
        <Text
          style={
            styles.saveButtonText
          }
        >
          {saving
            ? 'Guardando...'
            : 'Guardar cambios'}
        </Text>
      </Pressable>

      <Pressable
        style={styles.deleteButton}
        onPress={confirmDelete}
      >
        <Text
          style={
            styles.deleteButtonText
          }
        >
          Eliminar gasto
        </Text>
      </Pressable>
    </ScrollView>
  );
}

const styles =
  StyleSheet.create({
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
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#FFFFFF',
    },

    loadingText: {
      color: '#777777',
      fontSize: 15,
    },

    header: {
      flexDirection: 'row',
      justifyContent:
        'space-between',
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

    amountLabel: {
      textAlign: 'center',
      fontSize: 14,
      color: '#777777',
    },

    amountContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 8,
      marginBottom: 30,
    },

    currency: {
      fontSize: 38,
      marginRight: 5,
    },

    amountInput: {
      fontSize: 38,
      minWidth: 130,
      textAlign: 'center',
    },

    sectionTitle: {
      fontSize: 17,
      fontWeight: '600',
      marginTop: 28,
      marginBottom: 12,
    },

    sectionHeader: {
      flexDirection: 'row',
      justifyContent:
        'space-between',
      alignItems: 'center',
      marginTop: 28,
      marginBottom: 12,
    },

    sectionTitleNoMargin: {
      fontSize: 17,
      fontWeight: '600',
    },

    manageText: {
      color: '#E96A9D',
      fontWeight: '600',
    },

    optionsContainer: {
      gap: 10,
    },

    optionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: '#E2E2E2',
      borderRadius: 13,
      paddingVertical: 13,
      paddingHorizontal: 14,
    },

    optionSelected: {
      backgroundColor: '#FDEAF1',
      borderColor: '#E96A9D',
    },

    colorCircle: {
      width: 20,
      height: 20,
      borderRadius: 10,
      marginRight: 12,
    },

    optionText: {
      fontSize: 15,
    },

    optionTextSelected: {
      color: '#B63F70',
      fontWeight: '600',
    },

    accountInfo: {
      flex: 1,
    },

    balance: {
      marginTop: 3,
      fontSize: 12,
      color: '#777777',
    },

    newCategoryButton: {
      marginTop: 10,
      paddingVertical: 8,
      alignSelf: 'flex-start',
    },

    newCategoryText: {
      color: '#E96A9D',
      fontWeight: '600',
    },

    input: {
      borderWidth: 1,
      borderColor: '#DDDDDD',
      borderRadius: 13,
      paddingHorizontal: 15,
      paddingVertical: 15,
      fontSize: 16,
    },

    noteInput: {
      minHeight: 90,
      textAlignVertical: 'top',
    },

    saveButton: {
      marginTop: 40,
      backgroundColor: '#E96A9D',
      borderRadius: 14,
      paddingVertical: 16,
      alignItems: 'center',
    },

    saveButtonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '600',
    },

    disabledButton: {
      opacity: 0.6,
    },

    deleteButton: {
      marginTop: 15,
      paddingVertical: 15,
      borderRadius: 14,
      alignItems: 'center',
      backgroundColor: '#FCE7EA',
    },

    deleteButtonText: {
      color: '#D65161',
      fontSize: 15,
      fontWeight: '600',
    },
  });