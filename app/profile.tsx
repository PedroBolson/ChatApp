import { useAuthActions, useConvexAuth } from '@convex-dev/auth/react';
import Button from '@/components/Button';
import Input from '@/components/Input';
import { api } from '@/convex/_generated/api';
import { useMutation, useQuery } from 'convex/react';
import { Redirect, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ProfileScreen() {
  const router = useRouter();
  const { signOut } = useAuthActions();
  const { isAuthenticated, isLoading } = useConvexAuth();
  const currentUser = useQuery(api.users.getCurrentUser);
  const updateProfile = useMutation(api.users.updateProfile);
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name ?? '');
    }
  }, [currentUser]);

  async function handleSave() {
    setSaving(true);
    setMessage('');

    try {
      await updateProfile({ name });
      setMessage('Perfil atualizado.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Nao foi possivel salvar.');
    } finally {
      setSaving(false);
    }
  }

  async function handleLogout() {
    await signOut();
    router.replace('/sign-in');
  }

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-slate-50">
        <ActivityIndicator color="#059669" />
        <Text className="mt-3 text-slate-500">Carregando perfil...</Text>
      </SafeAreaView>
    );
  }

  if (!isAuthenticated) {
    return <Redirect href="/sign-in" />;
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-row items-center bg-emerald-700 px-3 py-3">
        <Pressable
          className="mr-2 h-10 w-10 items-center justify-center rounded-full active:bg-emerald-800"
          onPress={() => router.back()}
        >
          <Text className="text-2xl leading-7 text-white">{'<'}</Text>
        </Pressable>
        <Text className="flex-1 text-xl font-bold text-white">Perfil</Text>
      </View>

      {currentUser === undefined ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#059669" />
          <Text className="mt-3 text-slate-500">Carregando perfil...</Text>
        </View>
      ) : (
        <View className="px-5 py-6">
          <View className="mb-6 h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
            <Text className="text-2xl font-bold text-emerald-700">
              {(name || currentUser?.email || 'U').charAt(0).toUpperCase()}
            </Text>
          </View>

          <Input
            label="Nome de exibicao"
            value={name}
            onChangeText={setName}
            placeholder="Digite seu nome"
            autoCapitalize="words"
          />

          <View className="mb-4">
            <Text className="mb-2 text-sm font-medium text-slate-700">Email</Text>
            <View className="rounded-xl border border-slate-200 bg-slate-100 px-4 py-3">
              <Text className="text-base text-slate-600">{currentUser?.email ?? 'Sem email'}</Text>
            </View>
          </View>

          {message ? <Text className="mb-4 text-sm text-slate-600">{message}</Text> : null}

          <Button title="Salvar" onPress={handleSave} loading={saving} className="mb-3" />
          <Button title="Sair" onPress={handleLogout} variant="secondary" />
        </View>
      )}
    </SafeAreaView>
  );
}
