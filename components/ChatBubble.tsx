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
        <Text
          className={`mt-1 self-end text-[11px] ${
            isMine ? 'text-emerald-100' : 'text-slate-500'
          }`}
        >
          {formatTime(createdAt)}
        </Text>
      </View>
    </View>
  );
}
