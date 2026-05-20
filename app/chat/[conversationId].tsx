import ChatBubble from '@/components/ChatBubble';
import EmptyState from '@/components/EmptyState';
import LoadingState from '@/components/LoadingState';
import { api } from '@/convex/_generated/api';
import type { Id } from '@/convex/_generated/dataModel';
import { useMutation, useQuery } from 'convex/react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

type ChatMessage = {
  _id: Id<'messages'>;
  _creationTime: number;
  text: string;
  senderName: string;
  isMine: boolean;
  updatedAt?: number;
  isDeleted?: boolean;
  status?: 'sent' | 'delivered' | 'read';
};

export default function ChatScreen() {
  const { top, bottom } = useSafeAreaInsets();
  const router = useRouter();
  const { conversationId, title: conversationTitle } = useLocalSearchParams<{
    conversationId: string;
    title?: string;
  }>();
  const typedConversationId = conversationId as Id<'conversations'>;
  const messagesListRef = useRef<FlatList>(null);
  const [text, setText] = useState('');
  const [editingMessageId, setEditingMessageId] = useState<Id<'messages'> | null>(null);
  const [isSending, setIsSending] = useState(false);
  const sendMessage = useMutation(api.messages.sendMessage);
  const updateMessage = useMutation(api.messages.updateMessage);
  const deleteMessage = useMutation(api.messages.deleteMessage);
  const markAsRead = useMutation(api.conversations.markAsRead);
  const messages = useQuery(api.messages.listByConversation, {
    conversationId: typedConversationId,
  });
  const trimmedText = text.trim();
  const isEditing = editingMessageId !== null;

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

    setIsSending(true);

    try {
      if (editingMessageId) {
        await updateMessage({
          id: editingMessageId,
          text: trimmedText,
        });
        setEditingMessageId(null);
        setText('');
      } else {
        const messageText = trimmedText;
        setText('');

        await sendMessage({
          conversationId: typedConversationId,
          text: messageText,
        });
      }
    } catch {
      Alert.alert('Erro', 'Nao foi possivel salvar a mensagem.');
    } finally {
      setIsSending(false);
    }
  }

  function startEditingMessage(message: ChatMessage) {
    if (message.isDeleted) {
      return;
    }

    setEditingMessageId(message._id);
    setText(message.text);
  }

  function cancelEditingMessage() {
    setEditingMessageId(null);
    setText('');
  }

  async function handleDeleteMessage(id: Id<'messages'>) {
    try {
      await deleteMessage({ id });

      if (editingMessageId === id) {
        cancelEditingMessage();
      }
    } catch {
      Alert.alert('Erro', 'Nao foi possivel apagar a mensagem.');
    }
  }

  function confirmDeleteMessage(id: Id<'messages'>) {
    Alert.alert('Excluir mensagem?', 'Essa acao vai apagar o texto da mensagem.', [
      {
        text: 'Cancelar',
        style: 'cancel',
      },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: () => {
          void handleDeleteMessage(id);
        },
      },
    ]);
  }

  function showMessageOptions(message: ChatMessage) {
    if (!message.isMine || message.isDeleted) {
      return;
    }

    Alert.alert('O que deseja fazer?', undefined, [
      {
        text: 'Editar',
        onPress: () => startEditingMessage(message),
      },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: () => {
          confirmDeleteMessage(message._id);
        },
      },
      {
        text: 'Cancelar',
        style: 'cancel',
      },
    ]);
  }

  const title = conversationTitle ?? 'Conversa';

  return (
    <SafeAreaView className="flex-1 bg-emerald-700" edges={['top']}>
      <SafeAreaView className="flex-1 bg-slate-100" edges={['left', 'right']}>
        <KeyboardAvoidingView
          className="flex-1 bg-slate-100"
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={top}
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
                  updatedAt={item.updatedAt}
                  isDeleted={item.isDeleted}
                  status={item.status}
                  onLongPress={() => showMessageOptions(item)}
                />
              )}
            />
          )}

          {isEditing ? (
            <View className="flex-row items-center border-t border-slate-200 bg-white px-3 pt-2">
              <Text className="flex-1 text-sm text-slate-600">Editando mensagem</Text>
              <Pressable className="px-2 py-1" onPress={cancelEditingMessage}>
                <Text className="text-sm font-semibold text-emerald-700">Cancelar</Text>
              </Pressable>
            </View>
          ) : null}

          <View
            className="flex-row items-end border-t border-slate-200 bg-white px-3 pt-2"
            style={{ paddingBottom: bottom + 8 }}
          >
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
              <Text className="font-semibold text-white">
                {isSending ? '...' : isEditing ? 'Salvar' : 'Enviar'}
              </Text>
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </SafeAreaView>
  );
}
