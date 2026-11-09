import * as SecureStore from 'expo-secure-store';

const SESSION_KEY =
  'stash_session_user_id';

export async function saveSession(
  userId: number
) {
  await SecureStore.setItemAsync(
    SESSION_KEY,
    userId.toString()
  );
}

export async function getSessionUserId() {
  const value =
    await SecureStore.getItemAsync(
      SESSION_KEY
    );

  if (!value) {
    return null;
  }

  return Number(value);
}

export async function clearSession() {
  await SecureStore.deleteItemAsync(
    SESSION_KEY
  );
}