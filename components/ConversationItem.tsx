import { Pressable, Text, View } from 'react-native';

type ConversationItemProps = {
  title: string;
  lastMessageText?: string;
  lastMessageAt?: number;
  unreadCount?: number;
  onPress: () => void;
};

function formatConversationTime(timestamp?: number) {
  if (!timestamp) {
    return '';
  }

  const date = new Date(timestamp);
  const today = new Date();
  const isToday = date.toDateString() === today.toDateString();

  if (isToday) {
    return date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  return date.toLocaleDateString([], {
    day: '2-digit',
    month: '2-digit',
  });
}

export default function ConversationItem({
  title,
  lastMessageText,
  lastMessageAt,
  unreadCount = 0,
  onPress,
}: ConversationItemProps) {
  return (
    <Pressable className="bg-white px-4 py-3 active:bg-slate-50" onPress={onPress}>
      <View className="flex-row items-center">
        <View className="mr-3 h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
          <Text className="text-lg font-bold text-emerald-700">
            {title.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View className="flex-1 border-b border-slate-100 pb-3">
          <View className="flex-row items-center justify-between">
            <Text className="mr-3 flex-1 text-base font-semibold text-slate-900" numberOfLines={1}>
              {title}
            </Text>
            <Text className="text-xs text-slate-500">{formatConversationTime(lastMessageAt)}</Text>
          </View>
          <View className="mt-1 flex-row items-center">
            <Text className="mr-3 flex-1 text-sm text-slate-500" numberOfLines={1}>
              {lastMessageText ?? 'Toque para iniciar a conversa'}
            </Text>
            {unreadCount > 0 ? (
              <View className="min-w-5 items-center rounded-full bg-emerald-500 px-1.5 py-0.5">
                <Text className="text-xs font-bold text-white">{unreadCount}</Text>
              </View>
            ) : null}
          </View>
        </View>
      </View>
    </Pressable>
  );
}
