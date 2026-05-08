import { useAuthActions, useConvexAuth } from '@convex-dev/auth/react';
import Button from '@/components/Button';
import ConversationItem from '@/components/ConversationItem';
import { api } from '@/convex/_generated/api';
import { useMutation, useQuery } from 'convex/react';
import { Redirect, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, FlatList, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ConversationsScreen() {
  const router = useRouter();
  const { signOut } = useAuthActions();
  const { isAuthenticated, isLoading } = useConvexAuth();
  const conversations = useQuery(api.conversations.listMyConversations);
  const getOrCreateClassConversation = useMutation(api.conversations.getOrCreateClassConversation);

  useEffect(() => {
    if (isAuthenticated) {
      void getOrCreateClassConversation();
    }
  }, [getOrCreateClassConversation, isAuthenticated]);

  async function handleLogout() {
    await signOut();
    router.replace('/sign-in');
  }

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-slate-50">
        <ActivityIndicator color="#059669" />
        <Text className="mt-3 text-slate-500">Carregando conversas...</Text>
      </SafeAreaView>
    );
  }

  if (!isAuthenticated) {
    return <Redirect href="/sign-in" />;
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <View className="bg-emerald-700 px-5 pb-6 pt-5">
        <View className="flex-row items-start justify-between">
          <View className="mr-4 flex-1">
            <Text className="text-2xl font-bold text-white">Conversas</Text>
            <Text className="mt-1 text-sm text-emerald-100">
              Chat simples usando Expo, NativeWind e Convex.
            </Text>
          </View>
          <Button title="Sair" onPress={handleLogout} variant="light" className="px-4 py-2" />
        </View>
      </View>

      <View className="-mt-3 flex-1 rounded-t-3xl bg-slate-50">
        <FlatList
          data={conversations ?? []}
          keyExtractor={(item) => item._id}
          contentContainerClassName="px-4 py-5"
          ListHeaderComponent={
            <Text className="mb-3 text-sm font-semibold uppercase text-slate-500">
              Minhas conversas
            </Text>
          }
          ListEmptyComponent={
            <View className="items-center rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12">
              <Text className="text-center text-base font-semibold text-slate-700">
                Nenhuma conversa encontrada
              </Text>
              <Text className="mt-2 text-center text-sm leading-5 text-slate-500">
                A conversa da turma sera criada automaticamente quando o Convex carregar.
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <ConversationItem
              title={item.title}
              lastMessageText={item.lastMessageText}
              lastMessageAt={item.lastMessageAt}
              onPress={() =>
                router.push({
                  pathname: '/chat/[conversationId]',
                  params: { conversationId: item._id },
                })
              }
            />
          )}
        />
      </View>
    </SafeAreaView>
  );
}
