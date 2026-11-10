import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

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
  createExpense,
  getAccounts,
  getCategories,
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

export default function TransactionScreen() {
  const [amount, setAmount] = useState('');

  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const [selectedAccountId, setSelectedAccountId] =
    useState<number | null>(null);

  const [selectedCategoryId, setSelectedCategoryId] =
    useState<number | null>(null);

  const [date, setDate] = useState(
    new Date().toISOString().split('T')[0]
  );

  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  async function loadData() {
    try {
      setLoadingData(true);

      const userId = await getSessionUserId();

      if (!userId) {
        router.replace('/');
        return;
      }

      const accountsResult =
        (await getAccounts(userId)) as Account[];

      const categoriesResult =
        (await getCategories(userId)) as Category[];

      setAccounts(accountsResult);
      setCategories(categoriesResult);

      if (accountsResult.length > 0) {
        const selectedAccountStillExists =
          accountsResult.some(
            (account) =>
              account.id === selectedAccountId
          );

        if (
          !selectedAccountId ||
          !selectedAccountStillExists
        ) {
          setSelectedAccountId(
            accountsResult[0].id
          );
        }
      } else {
        setSelectedAccountId(null);
      }

      if (categoriesResult.length > 0) {
        const selectedCategoryStillExists =
          categoriesResult.some(
            (category) =>
              category.id === selectedCategoryId
          );

        if (
          !selectedCategoryId ||
          !selectedCategoryStillExists
        ) {
          setSelectedCategoryId(
            categoriesResult[0].id
          );
        }
      } else {
        setSelectedCategoryId(null);
      }
    } catch (error) {
      console.error(
        'Error al cargar datos del gasto:',
        error
      );
    } finally {
      setLoadingData(false);
    }
  }

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  async function handleSave() {
    const parsedAmount =
      Number(amount.replace(',', '.'));

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
        'Selecciona la cuenta desde la que se realizó el gasto.'
      );

      return;
    }

    if (!selectedCategoryId) {
      Alert.alert(
        'Categoría requerida',
        'Selecciona una categoría para el gasto.'
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

      await createExpense(
        userId,
        selectedAccountId,
        selectedCategoryId,
        parsedAmount,
        date,
        note
      );

      Alert.alert(
        'Gasto registrado',
        'El gasto se guardó correctamente.'
      );

      router.back();
    } catch (error: any) {
      console.error(
        'Error al registrar gasto:',
        error
      );

      Alert.alert(
        'Error',
        error?.message ||
          'No se pudo registrar el gasto.'
      );
    } finally {
      setLoading(false);
    }
  }

  const selectedAccount =
    accounts.find(
      (account) =>
        account.id === selectedAccountId
    );

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
          Nuevo gasto
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

      <Text style={styles.amountLabel}>
        Monto
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

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
          Categoría
        </Text>

        <Pressable
          onPress={() =>
            router.push('/categories')
          }
        >
          <Text style={styles.manageText}>
            Administrar
          </Text>
        </Pressable>
      </View>

      {loadingData ? (
        <Text style={styles.loadingText}>
          Cargando categorías...
        </Text>
      ) : categories.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyText}>
            No tienes categorías disponibles.
          </Text>

          <Pressable
            onPress={() =>
              router.push('/new-category')
            }
          >
            <Text style={styles.createText}>
              + Crear categoría
            </Text>
          </Pressable>
        </View>
      ) : (
        <View style={styles.optionsContainer}>
          {categories.map((category) => (
            <Pressable
              key={category.id}
              style={[
                styles.optionButton,
                selectedCategoryId ===
                  category.id &&
                  styles.optionButtonSelected,
              ]}
              onPress={() =>
                setSelectedCategoryId(
                  category.id
                )
              }
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
          ))}
        </View>
      )}

      <Pressable
        style={styles.newCategoryButton}
        onPress={() =>
          router.push('/new-category')
        }
      >
        <Text style={styles.newCategoryText}>
          + Nueva categoría
        </Text>
      </Pressable>

      <Text style={styles.sectionTitle}>
        Cuenta
      </Text>

      {loadingData ? (
        <Text style={styles.loadingText}>
          Cargando cuentas...
        </Text>
      ) : accounts.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyText}>
            No tienes cuentas registradas.
          </Text>

          <Pressable
            onPress={() =>
              router.push('/new-account')
            }
          >
            <Text style={styles.createText}>
              + Crear cuenta
            </Text>
          </Pressable>
        </View>
      ) : (
        <View style={styles.optionsContainer}>
          {accounts.map((account) => (
            <Pressable
              key={account.id}
              style={[
                styles.optionButton,
                selectedAccountId ===
                  account.id &&
                  styles.optionButtonSelected,
              ]}
              onPress={() =>
                setSelectedAccountId(
                  account.id
                )
              }
            >
              <View
                style={[
                  styles.categoryColor,
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
                  {account.nombre} -{' '}
                  {account.tipo}
                </Text>

                <Text style={styles.accountBalance}>
                  Saldo: $
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
          ))}
        </View>
      )}

      {selectedAccount && (
        <View style={styles.selectedAccountBox}>
          <Text style={styles.selectedAccountLabel}>
            Cuenta seleccionada
          </Text>

          <Text style={styles.selectedAccountName}>
            {selectedAccount.nombre} -{' '}
            {selectedAccount.tipo}
          </Text>

          <Text style={styles.selectedAccountBalance}>
            Disponible: $
            {selectedAccount.saldo_actual.toLocaleString(
              'en-US',
              {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }
            )}
          </Text>
        </View>
      )}

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
        placeholder="Ej. Almuerzo, Uber, regalo..."
        multiline
      />

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
            : 'Guardar gasto'}
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
    paddingBottom: 50,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#DDDDDD',
    marginBottom: 30,
  },

  close: {
    fontSize: 32,
    color: '#222222',
  },

  title: {
    fontSize: 21,
    fontWeight: '600',
  },

  confirm: {
    fontSize: 26,
    color: '#E96A9D',
  },

  amountLabel: {
    textAlign: 'center',
    fontSize: 15,
    color: '#777777',
  },

  amountContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 20,
  },

  currency: {
    fontSize: 40,
    marginRight: 6,
  },

  amountInput: {
    fontSize: 40,
    minWidth: 130,
    textAlign: 'center',
  },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 28,
    marginBottom: 12,
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: '600',
    marginTop: 28,
    marginBottom: 12,
  },

  manageText: {
    color: '#E96A9D',
    fontSize: 14,
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

  optionButtonSelected: {
    backgroundColor: '#FDEAF1',
    borderColor: '#E96A9D',
  },

  categoryColor: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 12,
  },

  optionText: {
    fontSize: 15,
  },

  optionTextSelected: {
    fontWeight: '600',
    color: '#B63F70',
  },

  accountInfo: {
    flex: 1,
  },

  accountBalance: {
    fontSize: 12,
    color: '#777777',
    marginTop: 3,
  },

  newCategoryButton: {
    marginTop: 12,
    alignSelf: 'flex-start',
    paddingVertical: 8,
  },

  newCategoryText: {
    color: '#E96A9D',
    fontSize: 14,
    fontWeight: '600',
  },

  emptyBox: {
    paddingVertical: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EEEEEE',
    borderRadius: 13,
  },

  emptyText: {
    color: '#777777',
    marginBottom: 8,
  },

  createText: {
    color: '#E96A9D',
    fontWeight: '600',
  },

  loadingText: {
    color: '#777777',
    fontSize: 14,
  },

  selectedAccountBox: {
    marginTop: 15,
    backgroundColor: '#F7F7F7',
    borderRadius: 12,
    padding: 14,
  },

  selectedAccountLabel: {
    fontSize: 12,
    color: '#777777',
  },

  selectedAccountName: {
    fontSize: 15,
    fontWeight: '600',
    marginTop: 3,
  },

  selectedAccountBalance: {
    fontSize: 13,
    color: '#666666',
    marginTop: 4,
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

  disabledButton: {
    opacity: 0.6,
  },

  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});