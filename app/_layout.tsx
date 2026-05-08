import { ConvexAuthProvider, type TokenStorage } from '@convex-dev/auth/react';
import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { ConvexReactClient } from 'convex/react';
import * as SecureStore from 'expo-secure-store';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Platform } from 'react-native';
import 'react-native-reanimated';
import '../global.css';

const convexUrl = process.env.EXPO_PUBLIC_CONVEX_URL;

if (!convexUrl) {
  throw new Error('Missing EXPO_PUBLIC_CONVEX_URL in .env.local');
}

const convex = new ConvexReactClient(convexUrl);

const memoryStorage = new Map<string, string>();

const fallbackStore: TokenStorage = {
  async getItem(key) {
    if (Platform.OS === 'web' && typeof localStorage !== 'undefined') {
      return localStorage.getItem(key);
    }

    return memoryStorage.get(key) ?? null;
  },
  async setItem(key, value) {
    if (Platform.OS === 'web' && typeof localStorage !== 'undefined') {
      localStorage.setItem(key, value);
      return;
    }

    memoryStorage.set(key, value);
  },
  async removeItem(key) {
    if (Platform.OS === 'web' && typeof localStorage !== 'undefined') {
      localStorage.removeItem(key);
      return;
    }

    memoryStorage.delete(key);
  },
};

const tokenStorage: TokenStorage = {
  async getItem(key) {
    if (Platform.OS !== 'web' && typeof SecureStore.getItemAsync === 'function') {
      try {
        return await SecureStore.getItemAsync(key);
      } catch {
        return fallbackStore.getItem(key);
      }
    }

    return fallbackStore.getItem(key);
  },
  async setItem(key, value) {
    if (Platform.OS !== 'web' && typeof SecureStore.setItemAsync === 'function') {
      try {
        await SecureStore.setItemAsync(key, value);
        return;
      } catch {
        await fallbackStore.setItem(key, value);
        return;
      }
    }

    await fallbackStore.setItem(key, value);
  },
  async removeItem(key) {
    if (Platform.OS !== 'web' && typeof SecureStore.deleteItemAsync === 'function') {
      try {
        await SecureStore.deleteItemAsync(key);
        return;
      } catch {
        await fallbackStore.removeItem(key);
        return;
      }
    }

    await fallbackStore.removeItem(key);
  },
};

export default function RootLayout() {
  return (
    <ConvexAuthProvider client={convex} storage={tokenStorage}>
      <ThemeProvider value={DefaultTheme}>
        <Stack>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="sign-in" options={{ title: 'Entrar' }} />
          <Stack.Screen name="sign-up" options={{ title: 'Criar conta' }} />
          <Stack.Screen name="conversations" options={{ headerShown: false }} />
          <Stack.Screen name="contacts" options={{ headerShown: false }} />
          <Stack.Screen name="profile" options={{ headerShown: false }} />
          <Stack.Screen name="about" options={{ headerShown: false }} />
          <Stack.Screen name="chat/[conversationId]" options={{ headerShown: false }} />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </ConvexAuthProvider>
  );
}
