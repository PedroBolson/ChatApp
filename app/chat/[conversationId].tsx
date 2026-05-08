import ChatBubble from '@/components/ChatBubble';
import { api } from '@/convex/_generated/api';
import type { Id } from '@/convex/_generated/dataModel';
import { useMutation, useQuery } from 'convex/react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ChatScreen() {
  const router = useRouter();
  const { conversationId, title: conversationTitle } = useLocalSearchParams<{
    conversationId: string;
    title?: string;
  }>();
  const typedConversationId = conversationId as Id<'conversations'>;
  const [text, setText] = useState('');
  const sendMessage = useMutation(api.messages.sendMessage);
  const messages = useQuery(api.messages.listByConversation, {
    conversationId: typedConversationId,
  });

  async function handleSendMessage() {
    const messageText = text.trim();

    if (!messageText) {
      return;
    }

    setText('');
    await sendMessage({
      conversationId: typedConversationId,
      text: messageText,
    });
  }

  const title = conversationTitle ?? 'Conversa';

  return (
    <SafeAreaView className="flex-1 bg-slate-100" edges={['top', 'left', 'right', 'bottom']}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View className="flex-row items-center bg-emerald-700 px-3 py-3">
          <Pressable
            className="mr-2 h-10 w-10 items-center justify-center rounded-full active:bg-emerald-800"
            onPress={() => router.back()}
          >
            <Text className="text-2xl leading-7 text-white">{'<'}</Text>
          </Pressable>
          <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-emerald-100">
            <Text className="text-base font-bold text-emerald-700">
              {title.charAt(0).toUpperCase()}
            </Text>
          </View>
          <Text className="flex-1 text-lg font-semibold text-white" numberOfLines={1}>
            {title}
          </Text>
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
            keyboardShouldPersistTaps="handled"
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

        <View className="flex-row items-end border-t border-slate-200 bg-white px-3 py-2">
          <TextInput
            className="mr-2 max-h-28 flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-base text-slate-900"
            value={text}
            onChangeText={setText}
            placeholder="Mensagem"
            placeholderTextColor="#94a3b8"
            multiline
          />
          <Pressable
            className={`h-12 min-w-16 items-center justify-center rounded-2xl px-4 ${
              text.trim() ? 'bg-emerald-600 active:bg-emerald-700' : 'bg-slate-300'
            }`}
            onPress={handleSendMessage}
            disabled={!text.trim()}
          >
            <Text className="font-semibold text-white">Enviar</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
