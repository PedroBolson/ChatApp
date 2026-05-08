import { useAuthActions, useConvexAuth } from '@convex-dev/auth/react';
import Button from '@/components/Button';
import ConversationItem from '@/components/ConversationItem';
import EmptyState from '@/components/EmptyState';
import LoadingState from '@/components/LoadingState';
import { api } from '@/convex/_generated/api';
import { useMutation, useQuery } from 'convex/react';
import { Redirect, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { FlatList, Text, View } from 'react-native';
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
      <SafeAreaView className="flex-1 bg-white">
        <LoadingState message="Carregando conversas..." />
      </SafeAreaView>
    );
  }

  if (!isAuthenticated) {
    return <Redirect href="/sign-in" />;
  }

  return (
    <SafeAreaView className="flex-1 bg-emerald-700" edges={['top']}>
      <SafeAreaView className="flex-1 bg-white" edges={['left', 'right', 'bottom']}>
        <View className="bg-emerald-700 px-5 pb-4 pt-5">
          <Text className="text-2xl font-bold text-white">Conversas</Text>
          <View className="mt-3 flex-row">
            <Button
              title="Contatos"
              onPress={() => router.push('/contacts')}
              variant="light"
              className="mr-2 flex-1 px-3 py-2"
            />
            <Button
              title="Perfil"
              onPress={() => router.push('/profile')}
              variant="light"
              className="flex-1 px-3 py-2"
            />
          </View>
        </View>

        <View className="flex-1 bg-white">
          {conversations === undefined ? (
            <LoadingState message="Carregando conversas..." />
          ) : (
            <FlatList
              data={conversations}
              keyExtractor={(item) => item._id}
              contentContainerClassName="flex-grow py-2"
              ListEmptyComponent={
                <EmptyState
                  title="Nenhuma conversa encontrada"
                  message="A conversa da turma sera criada automaticamente quando o app carregar."
                />
              }
              ListFooterComponent={
                <View className="border-t border-slate-100 px-5 py-5">
                  <Button
                    title="Sobre o ChatApp"
                    onPress={() => router.push('/about')}
                    variant="secondary"
                    className="mb-3"
                  />
                  <Button title="Sair" onPress={handleLogout} variant="secondary" />
                </View>
              }
              renderItem={({ item }) => (
                <ConversationItem
                  title={item.title}
                  lastMessageText={item.lastMessageText}
                  lastMessageAt={item.lastMessageAt}
                  unreadCount={item.unreadCount}
                  onPress={() =>
                    router.push({
                      pathname: '/chat/[conversationId]',
                      params: { conversationId: item._id, title: item.title },
                    })
                  }
                />
              )}
            />
          )}
        </View>
      </SafeAreaView>
    </SafeAreaView>
  );
}
