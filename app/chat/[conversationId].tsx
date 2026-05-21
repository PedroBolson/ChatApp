import Ionicons from '@expo/vector-icons/Ionicons';
import ChatBubble from '@/components/ChatBubble';
import EmptyState from '@/components/EmptyState';
import LoadingState from '@/components/LoadingState';
import { api } from '@/convex/_generated/api';
import type { Id } from '@/convex/_generated/dataModel';
import { useMutation, useQuery } from 'convex/react';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Speech from 'expo-speech';
import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Modal,
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
  type?: 'text' | 'image';
  imageUrl?: string | null;
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
  const hasLoggedSpeechVoicesRef = useRef(false);
  const [text, setText] = useState('');
  const [editingMessageId, setEditingMessageId] = useState<Id<'messages'> | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
  const [speakingMessageId, setSpeakingMessageId] = useState<Id<'messages'> | null>(null);
  const sendMessage = useMutation(api.messages.sendMessage);
  const generateUploadUrl = useMutation(api.messages.generateUploadUrl);
  const sendImageMessage = useMutation(api.messages.sendImageMessage);
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

  useEffect(() => {
    return () => {
      void Speech.stop();
    };
  }, []);

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
    if (message.isDeleted || message.type === 'image') {
      return;
    }

    setEditingMessageId(message._id);
    setText(message.text);
  }

  function cancelEditingMessage() {
    setEditingMessageId(null);
    setText('');
  }

  function getPreferredPortugueseVoice(
    voices: Awaited<ReturnType<typeof Speech.getAvailableVoicesAsync>>
  ) {
    const ptBrVoice = voices.find((voice) => voice.language === 'pt-BR');

    if (ptBrVoice) {
      return ptBrVoice;
    }

    return voices.find((voice) => voice.language.toLowerCase().startsWith('pt'));
  }

  async function handleSpeakMessage(message: ChatMessage) {
    console.log('Speech message received:', {
      messageId: message._id,
      type: message.type ?? 'text',
      isDeleted: Boolean(message.isDeleted),
      text: message.text,
    });

    if (message.isDeleted || (message.type ?? 'text') !== 'text') {
      console.log('Speech blocked: invalid message type or deleted message');
      return;
    }

    const cleanText = message.text.trim();
    console.log('Speech trimmed text:', cleanText);

    if (!cleanText) {
      console.log('Speech blocked: empty text');
      return;
    }

    try {
      await Speech.stop();
      console.log('Speech stopped previous reading');

      let selectedVoice: ReturnType<typeof getPreferredPortugueseVoice> | undefined;

      try {
        const voices = await Speech.getAvailableVoicesAsync();
        selectedVoice = getPreferredPortugueseVoice(voices);

        console.log('Speech selected voice:', selectedVoice ?? 'default system voice');

        if (!hasLoggedSpeechVoicesRef.current) {
          hasLoggedSpeechVoicesRef.current = true;

          console.log(
            'Speech available voices:',
            voices.slice(0, 5).map((voice) => ({
              identifier: voice.identifier,
              language: voice.language,
              name: voice.name,
            }))
          );
        }
      } catch (error) {
        console.log('Speech voices error:', error);
      }

      console.log('Speech speak called');
      Speech.speak(cleanText, {
        useApplicationAudioSession: false,
        ...(selectedVoice ? { voice: selectedVoice.identifier } : {}),
        onStart: () => {
          console.log('Speech started');
          setSpeakingMessageId(message._id);
        },
        onDone: () => {
          console.log('Speech done');
          setSpeakingMessageId((currentId) => (currentId === message._id ? null : currentId));
        },
        onStopped: () => {
          console.log('Speech stopped');
          setSpeakingMessageId((currentId) => (currentId === message._id ? null : currentId));
        },
        onError: (error) => {
          console.log('Speech error:', error);
          setSpeakingMessageId((currentId) => (currentId === message._id ? null : currentId));
          Alert.alert('Erro', 'Nao foi possivel ler a mensagem em voz alta.');
        },
      });
    } catch (error) {
      console.log('Speech catch error:', error);
      setSpeakingMessageId(null);
      Alert.alert('Erro', 'Nao foi possivel ler a mensagem em voz alta.');
    }
  }

  async function handleStopSpeech() {
    try {
      await Speech.stop();
    } catch {
      Alert.alert('Erro', 'Nao foi possivel parar a leitura.');
    } finally {
      setSpeakingMessageId(null);
    }
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

  function showMessageOptions(message: ChatMessage) {
    if (!message.isMine || message.isDeleted) {
      return;
    }

    if (message.type === 'image') {
      Alert.alert('O que deseja fazer?', undefined, [
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => {
            void handleDeleteMessage(message._id);
          },
        },
        {
          text: 'Cancelar',
          style: 'cancel',
        },
      ]);

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
          void handleDeleteMessage(message._id);
        },
      },
      {
        text: 'Cancelar',
        style: 'cancel',
      },
    ]);
  }

  async function handlePickImages() {
    if (isUploading || isEditing) {
      return;
    }

    setIsUploading(true);

    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert('Permissao necessaria', 'Permita o acesso a galeria para enviar fotos.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsMultipleSelection: true,
        selectionLimit: 0,
        quality: 1,
      });

      if (result.canceled) {
        return;
      }

      const imageCaption = trimmedText;

      for (const [index, asset] of result.assets.entries()) {
        const imageResponse = await fetch(asset.uri);
        const imageBlob = await imageResponse.blob();
        const uploadUrl = await generateUploadUrl();
        const uploadResponse = await fetch(uploadUrl, {
          method: 'POST',
          headers: {
            'Content-Type': asset.mimeType ?? 'image/jpeg',
          },
          body: imageBlob,
        });

        if (!uploadResponse.ok) {
          throw new Error('Upload failed');
        }

        const { storageId } = (await uploadResponse.json()) as { storageId: Id<'_storage'> };

        await sendImageMessage({
          conversationId: typedConversationId,
          imageId: storageId,
          text: index === 0 ? imageCaption : "",
        });
      }

      setText('');
    } catch {
      Alert.alert('Erro', 'Nao foi possivel enviar a imagem.');
    } finally {
      setIsUploading(false);
    }
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
              accessible
              accessibilityRole="button"
              accessibilityLabel="Voltar"
              accessibilityHint="Volta para a tela anterior"
            >
              <Ionicons name="arrow-back" size={24} color="#ffffff" />
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
                  type={item.type ?? 'text'}
                  imageUrl={item.imageUrl}
                  updatedAt={item.updatedAt}
                  isDeleted={item.isDeleted}
                  status={item.status}
                  isSpeaking={speakingMessageId === item._id}
                  onLongPress={!item.isDeleted ? () => showMessageOptions(item) : undefined}
                  onImagePress={() => {
                    if (item.imageUrl) {
                      setSelectedImageUrl(item.imageUrl);
                    }
                  }}
                  onSpeakPress={() => {
                    void handleSpeakMessage(item);
                  }}
                  onStopSpeechPress={() => {
                    void handleStopSpeech();
                  }}
                />
              )}
            />
          )}

          {isEditing ? (
            <View className="flex-row items-center border-t border-slate-200 bg-white px-3 pt-2">
              <Text className="flex-1 text-sm text-slate-600">Editando mensagem</Text>
              <Pressable
                className="px-2 py-1"
                onPress={cancelEditingMessage}
                accessible
                accessibilityRole="button"
                accessibilityLabel="Cancelar edição"
                accessibilityHint="Cancela a edição da mensagem atual"
              >
                <Text className="text-sm font-semibold text-emerald-700">Cancelar</Text>
              </Pressable>
            </View>
          ) : null}

          <View
            className="flex-row items-end border-t border-slate-200 bg-white px-3 pt-2"
            style={{ paddingBottom: bottom + 8 }}
          >
            <Pressable
              className={`mr-2 h-12 items-center justify-center rounded-2xl px-3 ${
                isUploading || isEditing ? 'bg-slate-300' : 'bg-emerald-100 active:bg-emerald-200'
              }`}
              onPress={handlePickImages}
              disabled={isUploading || isEditing}
              accessible
              accessibilityRole="button"
              accessibilityLabel="Selecionar foto"
              accessibilityHint="Abre a galeria para escolher uma imagem"
            >
              {isUploading ? (
                <Text className="font-semibold text-emerald-700">...</Text>
              ) : (
                <Ionicons name="image" size={22} color="#047857" />
              )}
            </Pressable>
            <TextInput
              className="mr-2 max-h-28 flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-base text-slate-900"
              value={text}
              onChangeText={setText}
              placeholder="Mensagem"
              placeholderTextColor="#94a3b8"
              multiline
              accessibilityLabel="Campo de mensagem"
              accessibilityHint="Digite sua mensagem para enviar na conversa"
            />
            <Pressable
              className={`h-12 min-w-16 items-center justify-center rounded-2xl px-4 ${
                trimmedText && !isSending ? 'bg-emerald-600 active:bg-emerald-700' : 'bg-slate-300'
              }`}
              onPress={handleSendMessage}
              disabled={!trimmedText || isSending}
              accessible
              accessibilityRole="button"
              accessibilityLabel={isEditing ? 'Salvar mensagem editada' : 'Enviar mensagem'}
              accessibilityHint={
                isEditing
                  ? 'Salva as alterações da mensagem em edição'
                  : 'Envia a mensagem digitada para a conversa'
              }
            >
              {isSending ? (
                <Text className="font-semibold text-white">...</Text>
              ) : (
                <Ionicons name={isEditing ? 'checkmark' : 'send'} size={22} color="#ffffff" />
              )}
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
      <Modal
        animationType="fade"
        visible={selectedImageUrl !== null}
        transparent
        onRequestClose={() => setSelectedImageUrl(null)}
      >
        <View className="flex-1 bg-black px-4" style={{ paddingTop: top + 16, paddingBottom: bottom + 16 }}>
          <Pressable
            className="self-end rounded-xl bg-white px-4 py-3"
            onPress={() => setSelectedImageUrl(null)}
            accessible
            accessibilityRole="button"
            accessibilityLabel="Fechar imagem"
            accessibilityHint="Fecha a visualização da imagem em tela cheia"
          >
            <Text className="font-semibold text-slate-900">Fechar</Text>
          </Pressable>
          <View className="flex-1 items-center justify-center">
            {selectedImageUrl ? (
              <Image
                source={{ uri: selectedImageUrl }}
                className="h-full w-full"
                resizeMode="contain"
                accessibilityLabel="Imagem aberta em tela cheia"
              />
            ) : null}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
