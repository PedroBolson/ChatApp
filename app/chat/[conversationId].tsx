import ChatBubble from '@/components/ChatBubble';
import { api } from '@/convex/_generated/api';
import type { Id } from '@/convex/_generated/dataModel';
import { useMutation, useQuery } from 'convex/react';
import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ChatScreen() {
  const { conversationId } = useLocalSearchParams<{ conversationId: string }>();
  const [text, setText] = useState('');
  const sendMessage = useMutation(api.messages.sendMessage);
  const messages = useQuery(api.messages.listByConversation, {
    conversationId: conversationId as Id<'conversations'>,
  });

  async function handleSendMessage() {
    const messageText = text.trim();

    if (!messageText) {
      return;
    }

    setText('');
    await sendMessage({
      conversationId: conversationId as Id<'conversations'>,
      text: messageText,
    });
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={['left', 'right', 'bottom']}>
      <View className="border-b border-slate-200 bg-white px-5 py-3">
        <Text className="text-lg font-bold text-slate-900">Chat da Turma</Text>
        <Text className="mt-1 text-sm text-slate-500">Mensagens aparecem em tempo real.</Text>
      </View>

      {messages === undefined ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#059669" />
          <Text className="mt-3 text-slate-500">Carregando mensagens...</Text>
        </View>
      ) : (
        <FlatList
          data={messages}
          keyExtractor={(item) => item._id}
          contentContainerClassName="flex-grow px-4 py-4"
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center px-8">
              <View className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-8">
                <Text className="text-center text-base font-semibold text-slate-700">
                  Nenhuma mensagem ainda
                </Text>
                <Text className="mt-2 text-center text-sm leading-5 text-slate-500">
                  Envie a primeira mensagem para testar o realtime do Convex.
                </Text>
              </View>
            </View>
          }
          renderItem={({ item }) => (
            <ChatBubble
              text={item.text}
              senderName={item.senderName}
              createdAt={item._creationTime}
              isMine={item.isMine}
            />
          )}
        />
      )}

      <View className="flex-row items-end border-t border-slate-200 bg-white px-4 py-3">
        <TextInput
          className="mr-3 max-h-28 flex-1 rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-base text-slate-900"
          value={text}
          onChangeText={setText}
          placeholder="Digite uma mensagem"
          placeholderTextColor="#94a3b8"
          multiline
        />
        <Pressable
          className={`rounded-2xl px-5 py-3 ${text.trim() ? 'bg-emerald-600 active:bg-emerald-700' : 'bg-slate-300'}`}
          onPress={handleSendMessage}
          disabled={!text.trim()}
        >
          <Text className="font-semibold text-white">Enviar</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
