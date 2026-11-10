import {
  useFocusEffect,
  useRouter,
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
  getUserById,
} from '../database/database';

import {
  clearSession,
  getSessionUserId,
} from '../services/session';

type User = {
  id: number;
  nombre: string;
  correo: string;
  foto_perfil: string | null;
};

export default function MenuScreen() {
  const router = useRouter();

  const [user, setUser] =
    useState<User | null>(null);

  async function loadUser() {
    try {
      const userId =
        await getSessionUserId();

      if (!userId) {
        router.replace('/');
        return;
      }

      const result =
        (await getUserById(
          userId
        )) as User | null;

      setUser(result);
    } catch (error) {
      console.error(
        'Error al cargar usuario:',
        error
      );
    }
  }

  useFocusEffect(
    useCallback(() => {
      loadUser();
    }, [])
  );

  async function handleLogout() {
    try {
      await clearSession();

      router.dismissAll();

      router.replace('/');
    } catch (error) {
      console.error(
        'Error al cerrar sesión:',
        error
      );
    }
  }

  function goTo(
    route:
      | '/dashboard'
      | '/accounts'
      | '/history'
      | '/goals'
      | '/reports'
      | '/settings'
      | '/profile'
  ) {
    router.dismissTo(route);
  }

  return (
    <View style={styles.container}>
      <View style={styles.menuPanel}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={
            styles.menuContent
          }
        >
          <Pressable
            style={
              styles.profileHeader
            }
            onPress={() =>
              goTo('/profile')
            }
          >
            <View
              style={styles.avatar}
            >
              {user?.foto_perfil ? (
                <Image
                  source={{
                    uri:
                      user.foto_perfil,
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
            </View>

            <View
              style={
                styles.profileInfo
              }
            >
              <Text
                style={styles.userName}
              >
                {user?.nombre ??
                  'Usuario'}
              </Text>

              <Text
                style={
                  styles.viewProfile
                }
              >
                ver perfil ›
              </Text>
            </View>
          </Pressable>

          <View
            style={styles.topDivider}
          />

          <MenuItem
            icon="⌂"
            label="Resumen"
            active
            onPress={() =>
              goTo('/dashboard')
            }
          />

          <MenuItem
            icon="▣"
            label="Cuentas"
            onPress={() =>
              goTo('/accounts')
            }
          />

          <MenuItem
            icon="▤"
            label="Gastos"
            onPress={() =>
              goTo('/history')
            }
          />

          <MenuItem
            icon="⚑"
            label="Metas"
            onPress={() =>
              goTo('/goals')
            }
          />

          <MenuItem
            icon="▥"
            label="Reportes"
            onPress={() =>
              goTo('/reports')
            }
          />

          <View
            style={styles.divider}
          />

          <MenuItem
            icon="⚙"
            label="Ajustes"
            onPress={() =>
              goTo('/settings')
            }
          />

          <MenuItem
            icon="↪"
            label="Cerrar sesión"
            onPress={
              handleLogout
            }
          />
        </ScrollView>
      </View>

      <Pressable
        style={styles.overlay}
        onPress={() =>
          router.dismiss()
        }
      />
    </View>
  );
}

function MenuItem({
  icon,
  label,
  active = false,
  onPress,
}: {
  icon: string;
  label: string;
  active?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={[
        styles.menuItem,

        active &&
          styles.activeMenuItem,
      ]}
      onPress={onPress}
    >
      <Text
        style={styles.menuIcon}
      >
        {icon}
      </Text>

      <Text
        style={[
          styles.menuLabel,

          active &&
            styles.activeMenuLabel,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles =
  StyleSheet.create({
    container: {
      flex: 1,
      flexDirection: 'row',
      backgroundColor:
        'rgba(0, 0, 0, 0.18)',
    },

    menuPanel: {
      width: '78%',
      maxWidth: 330,
      height: '100%',

      backgroundColor:
        '#FFFFFF',

      shadowColor: '#000000',

      shadowOffset: {
        width: 4,
        height: 0,
      },

      shadowOpacity: 0.15,
      shadowRadius: 10,

      elevation: 10,
    },

    overlay: {
      flex: 1,
      backgroundColor:
        'transparent',
    },

    menuContent: {
      flexGrow: 1,
      paddingBottom: 35,
    },

    profileHeader: {
      backgroundColor:
        '#F8C8DB',

      paddingTop: 65,
      paddingBottom: 28,
      paddingHorizontal: 24,

      flexDirection: 'row',
      alignItems: 'center',
    },

    avatar: {
      width: 66,
      height: 66,
      borderRadius: 33,

      borderWidth: 1.5,
      borderColor: '#222222',

      backgroundColor:
        '#FAD9E6',

      justifyContent:
        'center',

      alignItems:
        'center',

      marginRight: 16,

      overflow: 'hidden',
    },

    avatarImage: {
      width: 66,
      height: 66,
      borderRadius: 33,
    },

    avatarText: {
      fontSize: 21,
      fontWeight: '500',
    },

    profileInfo: {
      flex: 1,
    },

    userName: {
      fontSize: 19,
      fontWeight: '500',
    },

    viewProfile: {
      fontSize: 14,
      marginTop: 5,
      color: '#333333',
    },

    topDivider: {
      height: 8,

      backgroundColor:
        '#F5F5F5',

      marginBottom: 8,
    },

    menuItem: {
      height: 58,

      flexDirection: 'row',
      alignItems: 'center',

      paddingHorizontal: 24,
    },

    activeMenuItem: {
      backgroundColor:
        '#F8C8DB',
    },

    menuIcon: {
      width: 44,
      fontSize: 23,
      color: '#222222',
    },

    menuLabel: {
      fontSize: 17,
      color: '#222222',
    },

    activeMenuLabel: {
      fontWeight: '600',
    },

    divider: {
      height: 1,

      backgroundColor:
        '#CCCCCC',

      marginHorizontal: 22,
      marginVertical: 15,
    },
  });