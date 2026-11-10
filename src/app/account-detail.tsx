import {
  router,
  useFocusEffect,
  useLocalSearchParams,
} from 'expo-router';

import {
  useCallback,
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
  adjustAccountBalance,
  getAccountById,
  updateAccount,
} from '../database/database';

import {
  getSessionUserId,
} from '../services/session';

type Account = {
  id: number;
  usuario_id: number;
  nombre: string;
  tipo: string;
  saldo_inicial: number;
  saldo_actual: number;
  color: string | null;
};

const accountTypes = [
  'Efectivo',
  'Débito',
  'Crédito',
  'Ahorro',
];

const accountColors = [
  '#E96A9D',
  '#8DBD91',
  '#76AEDD',
  '#E56A70',
  '#B49ADE',
  '#A8A8A8',
];

export default function AccountDetailScreen() {
  const params = useLocalSearchParams();

  const accountId = Number(params.id);

  const [account, setAccount] =
    useState<Account | null>(null);

  const [name, setName] = useState('');
  const [type, setType] =
    useState('Efectivo');

  const [color, setColor] =
    useState('#E96A9D');

  const [amount, setAmount] =
    useState('');

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  async function loadAccount() {
    try {
      setLoading(true);

      const userId =
        await getSessionUserId();

      if (!userId) {
        router.replace('/');
        return;
      }

      const result =
        (await getAccountById(
          accountId,
          userId
        )) as Account | null;

      if (!result) {
        Alert.alert(
          'Cuenta no encontrada',
          'No fue posible encontrar esta cuenta.'
        );

        router.back();
        return;
      }

      setAccount(result);

      setName(result.nombre);
      setType(result.tipo);

      setColor(
        result.color || '#E96A9D'
      );
    } catch (error) {
      console.error(
        'Error al cargar cuenta:',
        error
      );
    } finally {
      setLoading(false);
    }
  }

  useFocusEffect(
    useCallback(() => {
      loadAccount();
    }, [accountId])
  );

  async function handleSaveChanges() {
    if (!account) {
      return;
    }

    if (!name.trim()) {
      Alert.alert(
        'Nombre requerido',
        'La cuenta debe tener un nombre.'
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

      await updateAccount(
        account.id,
        userId,
        name,
        type,
        color
      );

      await loadAccount();

      Alert.alert(
        'Cuenta actualizada',
        'Los cambios se guardaron correctamente.'
      );
    } catch (error) {
      console.error(
        'Error al actualizar cuenta:',
        error
      );

      Alert.alert(
        'Error',
        'No se pudieron guardar los cambios.'
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleBalanceAdjustment(
    operation: 'add' | 'subtract'
  ) {
    if (!account) {
      return;
    }

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

      await adjustAccountBalance(
        account.id,
        userId,
        adjustment
      );

      setAmount('');

      await loadAccount();
    } catch (error) {
      console.error(
        'Error al ajustar saldo:',
        error
      );

      Alert.alert(
        'Error',
        'No se pudo modificar el saldo.'
      );
    }
  }

  if (loading || !account) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>
          Cargando cuenta...
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
          onPress={() => router.back()}
        >
          <Text style={styles.back}>
            ‹
          </Text>
        </Pressable>

        <Text style={styles.title}>
          Detalle de cuenta
        </Text>

        <View style={styles.headerSpace} />
      </View>

      <View
        style={[
          styles.accountIcon,
          {
            backgroundColor: color,
          },
        ]}
      >
        <View
          style={styles.innerSquare}
        />
      </View>

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

      <Text style={styles.sectionTitle}>
        Ajustar saldo
      </Text>

      <View
        style={styles.balanceInputContainer}
      >
        <Text style={styles.currency}>
          $
        </Text>

        <TextInput
          style={styles.balanceInput}
          placeholder="0.00"
          keyboardType="decimal-pad"
          value={amount}
          onChangeText={setAmount}
        />
      </View>

      <View style={styles.actions}>
        <Pressable
          style={styles.addMoneyButton}
          onPress={() =>
            handleBalanceAdjustment(
              'add'
            )
          }
        >
          <Text
            style={styles.addMoneyText}
          >
            + Agregar dinero
          </Text>
        </Pressable>

        <Pressable
          style={styles.removeMoneyButton}
          onPress={() =>
            handleBalanceAdjustment(
              'subtract'
            )
          }
        >
          <Text
            style={styles.removeMoneyText}
          >
            − Quitar dinero
          </Text>
        </Pressable>
      </View>

      <View style={styles.separator} />

      <Text style={styles.sectionTitle}>
        Editar cuenta
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
        Tipo
      </Text>

      <View style={styles.typesContainer}>
        {accountTypes.map((item) => (
          <Pressable
            key={item}
            style={[
              styles.typeButton,
              type === item &&
                styles.typeSelected,
            ]}
            onPress={() =>
              setType(item)
            }
          >
            <Text
              style={[
                styles.typeText,
                type === item &&
                  styles.typeTextSelected,
              ]}
            >
              {item}
            </Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.label}>
        Color
      </Text>

      <View
        style={styles.colorsContainer}
      >
        {accountColors.map((item) => (
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
          saving &&
            styles.disabledButton,
        ]}
        onPress={handleSaveChanges}
        disabled={saving}
      >
        <Text
          style={styles.saveButtonText}
        >
          {saving
            ? 'Guardando...'
            : 'Guardar cambios'}
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

  loadingContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  loadingText: {
    color: '#777777',
    fontSize: 16,
  },

  header: {
    flexDirection: 'row',
    justifyContent:
      'space-between',
    alignItems: 'center',
    marginBottom: 35,
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

  accountIcon: {
    width: 65,
    height: 65,
    borderRadius: 14,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },

  innerSquare: {
    width: 25,
    height: 25,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    borderRadius: 4,
  },

  balanceLabel: {
    textAlign: 'center',
    marginTop: 18,
    fontSize: 14,
    color: '#777777',
  },

  balance: {
    textAlign: 'center',
    fontSize: 36,
    fontWeight: '600',
    marginTop: 5,
    marginBottom: 35,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 18,
  },

  balanceInputContainer: {
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

  balanceInput: {
    flex: 1,
    paddingVertical: 15,
    fontSize: 20,
  },

  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 15,
  },

  addMoneyButton: {
    flex: 1,
    backgroundColor: '#D9F1D8',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },

  addMoneyText: {
    color: '#3F7A48',
    fontWeight: '600',
  },

  removeMoneyButton: {
    flex: 1,
    backgroundColor: '#F9D7DE',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },

  removeMoneyText: {
    color: '#C45160',
    fontWeight: '600',
  },

  separator: {
    height: 1,
    backgroundColor: '#EEEEEE',
    marginVertical: 35,
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

  typesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },

  typeButton: {
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 20,
    paddingVertical: 9,
    paddingHorizontal: 16,
  },

  typeSelected: {
    backgroundColor: '#F8C8DA',
    borderColor: '#E96A9D',
  },

  typeText: {
    color: '#444444',
  },

  typeTextSelected: {
    color: '#B63F70',
    fontWeight: '600',
  },

  colorsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
  },

  colorCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
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