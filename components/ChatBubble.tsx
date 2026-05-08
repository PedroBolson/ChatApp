import { Text, View } from 'react-native';

type ChatBubbleProps = {
  text: string;
  senderName: string;
  createdAt: number;
  isMine: boolean;
  status?: 'sent' | 'delivered' | 'read';
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
  status,
}: ChatBubbleProps) {
  const statusText = getStatusText(status);

  return (
    <View className={`mb-2 max-w-[82%] ${isMine ? 'self-end' : 'self-start'}`}>
      {!isMine ? (
        <Text className="mb-1 ml-1 text-xs font-semibold text-emerald-700">{senderName}</Text>
      ) : null}
      <View
        className={`rounded-2xl px-3 py-2 ${
          isMine ? 'rounded-br-sm bg-emerald-600' : 'rounded-bl-sm bg-white'
        }`}
      >
        <Text className={`text-base leading-5 ${isMine ? 'text-white' : 'text-slate-900'}`}>{text}</Text>
        <View className="mt-1 flex-row items-center self-end">
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
      </View>
    </View>
  );
}
