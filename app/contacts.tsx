import ContactItem from '@/components/ContactItem';
import EmptyState from '@/components/EmptyState';
import LoadingState from '@/components/LoadingState';
import { api } from '@/convex/_generated/api';
import type { Id } from '@/convex/_generated/dataModel';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useConvexAuth } from '@convex-dev/auth/react';
import { useMutation, useQuery } from 'convex/react';
import { Redirect, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, FlatList, Pressable, Text, View } from 'react-native';
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
      <SafeAreaView className="flex-1 bg-white">
        <LoadingState message="Carregando contatos..." />
      </SafeAreaView>
    );
  }

  if (!isAuthenticated) {
    return <Redirect href="/sign-in" />;
  }

  return (
    <SafeAreaView className="flex-1 bg-emerald-700" edges={['top']}>
      <SafeAreaView className="flex-1 bg-white" edges={['left', 'right', 'bottom']}>
        <View className="flex-row items-center bg-emerald-700 px-3 py-3">
          <Pressable
            className="mr-2 h-10 w-10 items-center justify-center rounded-full active:bg-emerald-800"
            onPress={() => router.back()}
            accessible
            accessibilityRole="button"
            accessibilityLabel="Voltar"
            accessibilityHint="Volta para a tela anterior"
          >
            <Ionicons name="arrow-back" size={24} color="#ffffff" />
          </Pressable>
          <Text className="flex-1 text-2xl font-bold text-white">Contatos</Text>
        </View>

        {contacts === undefined ? (
          <LoadingState message="Carregando contatos..." />
        ) : (
          <FlatList
            data={contacts}
            keyExtractor={(item) => item._id}
            contentContainerClassName="flex-grow py-2"
            ListEmptyComponent={
              <EmptyState
                title="Nenhum contato encontrado"
                message="Cadastre outro usuario para iniciar uma conversa privada."
              />
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
    </SafeAreaView>
  );
}
