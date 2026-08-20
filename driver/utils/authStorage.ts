import * as SecureStore from "expo-secure-store";

const TOKEN_KEY = "authToken";
const DRIVER_KEY = "authDriver";

export async function saveAuth(token: string, driver: object) {
  await SecureStore.setItemAsync(TOKEN_KEY, token);
  await SecureStore.setItemAsync(DRIVER_KEY, JSON.stringify(driver));
}

export async function getToken(): Promise<string | null> {
  return await SecureStore.getItemAsync(TOKEN_KEY);
}

export async function getDriver(): Promise<any | null> {
  const driver = await SecureStore.getItemAsync(DRIVER_KEY);
  return driver ? JSON.parse(driver) : null;
}

export async function clearAuth() {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
  await SecureStore.deleteItemAsync(DRIVER_KEY);
}
