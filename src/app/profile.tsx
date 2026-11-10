import { router, useFocusEffect } from 'expo-router';

import {
  useCallback,
  useState,
} from 'react';

import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import * as ImagePicker from 'expo-image-picker';

import {
  getUserById,
  updateUserPassword,
  updateUserProfile,
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

export default function ProfileScreen() {
  const [user, setUser] =
    useState<User | null>(null);

  const [name, setName] =
    useState('');

  const [profilePhoto, setProfilePhoto] =
    useState<string | null>(null);

  const [currentPassword, setCurrentPassword] =
    useState('');

  const [newPassword, setNewPassword] =
    useState('');

  const [confirmPassword, setConfirmPassword] =
    useState('');

  const [savingProfile, setSavingProfile] =
    useState(false);

  const [savingPassword, setSavingPassword] =
    useState(false);

  async function loadProfile() {
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

      if (!result) {
        return;
      }

      setUser(result);
      setName(result.nombre);

      setProfilePhoto(
        result.foto_perfil || null
      );
    } catch (error) {
      console.error(
        'Error al cargar perfil:',
        error
      );
    }
  }

  useFocusEffect(
    useCallback(() => {
      loadProfile();
    }, [])
  );

  async function pickProfilePhoto() {
    try {
      const result =
        await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['images'],
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        });

      if (!result.canceled) {
        setProfilePhoto(
          result.assets[0].uri
        );
      }
    } catch (error) {
      console.error(
        'Error al seleccionar foto:',
        error
      );

      Alert.alert(
        'Error',
        'No se pudo seleccionar la imagen.'
      );
    }
  }

  async function handleSaveProfile() {
    if (!name.trim()) {
      Alert.alert(
        'Nombre requerido',
        'Escribe tu nombre.'
      );

      return;
    }

    try {
      setSavingProfile(true);

      const userId =
        await getSessionUserId();

      if (!userId) {
        router.replace('/');
        return;
      }

      await updateUserProfile(
        userId,
        name,
        profilePhoto
      );

      await loadProfile();

      Alert.alert(
        'Perfil actualizado',
        'Tus cambios se guardaron correctamente.'
      );
    } catch (error: any) {
      console.error(
        'Error al guardar perfil:',
        error
      );

      Alert.alert(
        'Error',
        error?.message ||
          'No se pudo actualizar el perfil.'
      );
    } finally {
      setSavingProfile(false);
    }
  }

  async function handleChangePassword() {
    if (!currentPassword) {
      Alert.alert(
        'Contraseña actual',
        'Escribe tu contraseña actual.'
      );

      return;
    }

    if (!newPassword) {
      Alert.alert(
        'Nueva contraseña',
        'Escribe una nueva contraseña.'
      );

      return;
    }

    if (
      newPassword !==
      confirmPassword
    ) {
      Alert.alert(
        'Las contraseñas no coinciden',
        'Confirma correctamente tu nueva contraseña.'
      );

      return;
    }

    try {
      setSavingPassword(true);

      const userId =
        await getSessionUserId();

      if (!userId) {
        router.replace('/');
        return;
      }

      await updateUserPassword(
        userId,
        currentPassword,
        newPassword
      );

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');

      Alert.alert(
        'Contraseña actualizada',
        'Tu contraseña se cambió correctamente.'
      );
    } catch (error: any) {
      console.error(
        'Error al cambiar contraseña:',
        error
      );

      Alert.alert(
        'Error',
        error?.message ||
          'No se pudo cambiar la contraseña.'
      );
    } finally {
      setSavingPassword(false);
    }
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
          Mi perfil
        </Text>

        <View
          style={styles.headerSpace}
        />
      </View>

      <View style={styles.photoSection}>
        <Pressable
          onPress={pickProfilePhoto}
        >
          {profilePhoto ? (
            <Image
              source={{
                uri: profilePhoto,
              }}
              style={styles.profileImage}
            />
          ) : (
            <View
              style={
                styles.profilePlaceholder
              }
            >
              <Text
                style={
                  styles.profileInitial
                }
              >
                {name
                  ? name
                      .charAt(0)
                      .toUpperCase()
                  : 'Hi'}
              </Text>
            </View>
          )}

          <View
            style={styles.cameraButton}
          >
            <Text
              style={styles.cameraText}
            >
              +
            </Text>
          </View>
        </Pressable>

        <Pressable
          onPress={pickProfilePhoto}
        >
          <Text
            style={styles.changePhoto}
          >
            Cambiar foto de perfil
          </Text>
        </Pressable>
      </View>

      <Text style={styles.sectionTitle}>
        Información personal
      </Text>

      <Text style={styles.label}>
        Nombre
      </Text>

      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="Tu nombre"
      />

      <Text style={styles.label}>
        Correo electrónico
      </Text>

      <View style={styles.disabledInput}>
        <Text
          style={styles.disabledText}
        >
          {user?.correo || ''}
        </Text>
      </View>

      <Text style={styles.emailNote}>
        El correo está vinculado a tu cuenta y por ahora no puede modificarse.
      </Text>

      <Pressable
        style={[
          styles.primaryButton,
          savingProfile &&
            styles.disabledButton,
        ]}
        onPress={handleSaveProfile}
        disabled={savingProfile}
      >
        <Text
          style={styles.primaryButtonText}
        >
          {savingProfile
            ? 'Guardando...'
            : 'Guardar perfil'}
        </Text>
      </Pressable>

      <View style={styles.separator} />

      <Text style={styles.sectionTitle}>
        Cambiar contraseña
      </Text>

      <Text style={styles.label}>
        Contraseña actual
      </Text>

      <TextInput
        style={styles.input}
        value={currentPassword}
        onChangeText={
          setCurrentPassword
        }
        placeholder="Contraseña actual"
        secureTextEntry
      />

      <Text style={styles.label}>
        Nueva contraseña
      </Text>

      <TextInput
        style={styles.input}
        value={newPassword}
        onChangeText={
          setNewPassword
        }
        placeholder="Nueva contraseña"
        secureTextEntry
      />

      <Text style={styles.label}>
        Confirmar nueva contraseña
      </Text>

      <TextInput
        style={styles.input}
        value={confirmPassword}
        onChangeText={
          setConfirmPassword
        }
        placeholder="Repite la nueva contraseña"
        secureTextEntry
      />

      <Pressable
        style={[
          styles.passwordButton,
          savingPassword &&
            styles.disabledButton,
        ]}
        onPress={
          handleChangePassword
        }
        disabled={savingPassword}
      >
        <Text
          style={
            styles.passwordButtonText
          }
        >
          {savingPassword
            ? 'Actualizando...'
            : 'Cambiar contraseña'}
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

  photoSection: {
    alignItems: 'center',
    marginBottom: 30,
  },

  profileImage: {
    width: 105,
    height: 105,
    borderRadius: 53,
    backgroundColor: '#EEEEEE',
  },

  profilePlaceholder: {
    width: 105,
    height: 105,
    borderRadius: 53,
    backgroundColor: '#F8C8DB',
    justifyContent: 'center',
    alignItems: 'center',
  },

  profileInitial: {
    fontSize: 36,
    fontWeight: '600',
    color: '#444444',
  },

  cameraButton: {
    position: 'absolute',
    right: 0,
    bottom: 0,

    width: 32,
    height: 32,
    borderRadius: 16,

    backgroundColor: '#E96A9D',

    justifyContent: 'center',
    alignItems: 'center',

    borderWidth: 3,
    borderColor: '#FFFFFF',
  },

  cameraText: {
    color: '#FFFFFF',
    fontSize: 20,
  },

  changePhoto: {
    color: '#E96A9D',
    fontWeight: '600',
    marginTop: 12,
  },

  sectionTitle: {
    fontSize: 19,
    fontWeight: '600',
    marginBottom: 12,
  },

  label: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 16,
    marginBottom: 8,
  },

  input: {
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 13,
    paddingHorizontal: 15,
    paddingVertical: 15,
    fontSize: 16,
  },

  disabledInput: {
    backgroundColor: '#F4F4F4',
    borderRadius: 13,
    paddingHorizontal: 15,
    paddingVertical: 16,
  },

  disabledText: {
    color: '#777777',
    fontSize: 16,
  },

  emailNote: {
    fontSize: 12,
    color: '#888888',
    marginTop: 7,
  },

  primaryButton: {
    backgroundColor: '#E96A9D',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 25,
  },

  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },

  separator: {
    height: 1,
    backgroundColor: '#EEEEEE',
    marginVertical: 35,
  },

  passwordButton: {
    backgroundColor: '#FDEAF1',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 25,
  },

  passwordButtonText: {
    color: '#B63F70',
    fontSize: 16,
    fontWeight: '600',
  },

  disabledButton: {
    opacity: 0.6,
  },
});