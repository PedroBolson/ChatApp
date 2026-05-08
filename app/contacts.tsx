import ContactItem from '@/components/ContactItem';
import { api } from '@/convex/_generated/api';
import type { Id } from '@/convex/_generated/dataModel';
import { useConvexAuth } from '@convex-dev/auth/react';
import { useMutation, useQuery } from 'convex/react';
import { Redirect, useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ContactsScreen() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useConvexAuth();
  const contacts = useQuery(api.users.listContacts);
  const getOrCreatePrivateConversation = useMutation(
    api.conversations.getOrCreatePrivateConversation,
  );
  const [openingContactId, setOpeningContactId] = useState<Id<'users'> | null>(null);

  async function handleOpenContact(contact: { _id: Id<'users'>; name: string }) {
    setOpeningContactId(contact._id);

    try {
      const conversationId = await getOrCreatePrivateConversation({
        contactId: contact._id,
      });

      router.push({
        pathname: '/chat/[conversationId]',
        params: { conversationId, title: contact.name },
      });
    } catch {
      Alert.alert('Erro', 'Nao foi possivel abrir a conversa.');
    } finally {
      setOpeningContactId(null);
    }
  }

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator color="#059669" />
        <Text className="mt-3 text-slate-500">Carregando contatos...</Text>
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
        <Text className="flex-1 text-2xl font-bold text-white">Contatos</Text>
      </View>

      {contacts === undefined ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#059669" />
          <Text className="mt-3 text-slate-500">Carregando contatos...</Text>
        </View>
      ) : (
        <FlatList
          data={contacts}
          keyExtractor={(item) => item._id}
          contentContainerClassName="py-2"
          ListEmptyComponent={
            <View className="mx-4 mt-8 items-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-12">
              <Text className="text-center text-base font-semibold text-slate-700">
                Nenhum contato encontrado
              </Text>
              <Text className="mt-2 text-center text-sm leading-5 text-slate-500">
                Cadastre outro usuario para iniciar uma conversa privada.
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <ContactItem
              name={item.name}
              email={item.email}
              loading={openingContactId === item._id}
              onPress={() => void handleOpenContact(item)}
            />
          )}
        />
      )}
    </SafeAreaView>
  );
}
