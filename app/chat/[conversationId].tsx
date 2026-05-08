import ChatBubble from '@/components/ChatBubble';
import EmptyState from '@/components/EmptyState';
import LoadingState from '@/components/LoadingState';
import { api } from '@/convex/_generated/api';
import type { Id } from '@/convex/_generated/dataModel';
import { useMutation, useQuery } from 'convex/react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
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
  const messagesListRef = useRef<FlatList>(null);
  const [text, setText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const sendMessage = useMutation(api.messages.sendMessage);
  const markAsRead = useMutation(api.conversations.markAsRead);
  const messages = useQuery(api.messages.listByConversation, {
    conversationId: typedConversationId,
  });
  const trimmedText = text.trim();

  useEffect(() => {
    void markAsRead({
      conversationId: typedConversationId,
    });
  }, [markAsRead, typedConversationId, messages?.length]);

  useEffect(() => {
    if (!messages?.length) {
      return;
    }

    requestAnimationFrame(() => {
      messagesListRef.current?.scrollToEnd({ animated: true });
    });
  }, [messages?.length]);

  async function handleSendMessage() {
    if (!trimmedText || isSending) {
      return;
    }

    const messageText = trimmedText;
    setText('');
    setIsSending(true);

    try {
      await sendMessage({
        conversationId: typedConversationId,
        text: messageText,
      });
    } finally {
      setIsSending(false);
    }
  }

  const title = conversationTitle ?? 'Conversa';

  return (
    <SafeAreaView className="flex-1 bg-slate-100" edges={['top', 'left', 'right', 'bottom']}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
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
          <LoadingState message="Carregando mensagens..." />
        ) : (
          <FlatList
            ref={messagesListRef}
            data={messages}
            keyExtractor={(item) => item._id}
            contentContainerClassName="flex-grow px-4 py-4"
            keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
            keyboardShouldPersistTaps="handled"
            onContentSizeChange={() => {
              messagesListRef.current?.scrollToEnd({ animated: true });
            }}
            ListEmptyComponent={
              <EmptyState
                title="Nenhuma mensagem ainda"
                message="Envie a primeira mensagem para testar o realtime do Convex."
              />
            }
            renderItem={({ item }) => (
              <ChatBubble
                text={item.text}
                senderName={item.senderName}
                createdAt={item._creationTime}
                isMine={item.isMine}
                status={item.status}
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
              trimmedText && !isSending ? 'bg-emerald-600 active:bg-emerald-700' : 'bg-slate-300'
            }`}
            onPress={handleSendMessage}
            disabled={!trimmedText || isSending}
          >
            <Text className="font-semibold text-white">{isSending ? '...' : 'Enviar'}</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
