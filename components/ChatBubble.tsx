import { Image, Pressable, Text, View } from 'react-native';

type ChatBubbleProps = {
  text: string;
  senderName: string;
  createdAt: number;
  isMine: boolean;
  type?: 'text' | 'image';
  imageUrl?: string | null;
  updatedAt?: number;
  isDeleted?: boolean;
  status?: 'sent' | 'delivered' | 'read';
  onLongPress?: () => void;
  onImagePress?: () => void;
};

function formatTime(timestamp: number) {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getStatusText(status?: ChatBubbleProps['status']) {
  if (!status) {
    return '';
  }

  return status === 'sent' ? '✓' : '✓✓';
}

export default function ChatBubble({
  text,
  senderName,
  createdAt,
  isMine,
  type,
  imageUrl,
  updatedAt,
  isDeleted,
  status,
  onLongPress,
  onImagePress,
}: ChatBubbleProps) {
  const statusText = getStatusText(status);
  const displayText = isDeleted ? 'Mensagem apagada' : text;
  const isImage = type === 'image';
  const showEdited = !isDeleted && !isImage && updatedAt;

  return (
    <Pressable
      className={`mb-2 max-w-[82%] ${isMine ? 'self-end' : 'self-start'}`}
      disabled={!onLongPress}
      delayLongPress={350}
      onLongPress={onLongPress}
    >
      {!isMine ? (
        <Text className="mb-1 ml-1 text-xs font-semibold text-emerald-700">{senderName}</Text>
      ) : null}
      <View
        className={`rounded-2xl px-3 py-2 ${
          isDeleted
            ? 'bg-slate-200'
            : isMine
              ? 'rounded-br-sm bg-emerald-600'
              : 'rounded-bl-sm bg-white'
        }`}
      >
        {isDeleted ? (
          <Text className="text-base italic leading-5 text-slate-500">{displayText}</Text>
        ) : isImage ? (
          imageUrl ? (
            <Pressable delayLongPress={350} onLongPress={onLongPress} onPress={onImagePress}>
              <Image
                source={{ uri: imageUrl }}
                className="h-56 w-56 rounded-xl bg-slate-200"
                resizeMode="cover"
              />
              {text ? (
                <Text className={`mt-2 text-base leading-5 ${isMine ? 'text-white' : 'text-slate-900'}`}>
                  {text}
                </Text>
              ) : null}
            </Pressable>
          ) : (
            <Text className={`text-base leading-5 ${isMine ? 'text-white' : 'text-slate-900'}`}>
              Imagem indisponivel
            </Text>
          )
        ) : (
          <Text className={`text-base leading-5 ${isMine ? 'text-white' : 'text-slate-900'}`}>
            {displayText}
          </Text>
        )}
        {!isDeleted ? (
          <View className="mt-1 flex-row items-center self-end">
            {showEdited ? (
              <Text className={`mr-2 text-[11px] ${isMine ? 'text-emerald-100' : 'text-slate-500'}`}>
                editado
              </Text>
            ) : null}
            <Text className={`text-[11px] ${isMine ? 'text-emerald-100' : 'text-slate-500'}`}>
              {formatTime(createdAt)}
            </Text>
            {isMine && statusText ? (
              <Text
                className={`ml-1 text-[11px] font-semibold ${
                  status === 'read' ? 'text-sky-200' : 'text-emerald-100'
                }`}
              >
                {statusText}
              </Text>
            ) : null}
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}
