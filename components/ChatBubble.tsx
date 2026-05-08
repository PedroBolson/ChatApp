import { Text, View } from 'react-native';

type ChatBubbleProps = {
  text: string;
  senderName: string;
  createdAt: number;
  isMine: boolean;
};

function formatTime(timestamp: number) {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function ChatBubble({ text, senderName, createdAt, isMine }: ChatBubbleProps) {
  return (
    <View className={`mb-3 max-w-[82%] ${isMine ? 'self-end' : 'self-start'}`}>
      {!isMine ? <Text className="mb-1 text-xs text-slate-500">{senderName}</Text> : null}
      <View className={`rounded-2xl px-4 py-3 ${isMine ? 'bg-emerald-600' : 'border border-slate-200 bg-white'}`}>
        <Text className={`text-base leading-5 ${isMine ? 'text-white' : 'text-slate-900'}`}>{text}</Text>
        <Text className={`mt-1 text-right text-xs ${isMine ? 'text-emerald-100' : 'text-slate-500'}`}>
          {formatTime(createdAt)}
        </Text>
      </View>
    </View>
  );
}
