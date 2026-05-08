import { Pressable, Text, View } from 'react-native';

type ConversationItemProps = {
  title: string;
  lastMessageText?: string;
  lastMessageAt?: number;
  onPress: () => void;
};

function formatDate(timestamp?: number) {
  if (!timestamp) {
    return '';
  }

  return new Date(timestamp).toLocaleDateString([], {
    day: '2-digit',
    month: '2-digit',
  });
}

export default function ConversationItem({
  title,
  lastMessageText,
  lastMessageAt,
  onPress,
}: ConversationItemProps) {
  return (
    <Pressable
      className="mb-3 rounded-2xl border border-slate-200 bg-white px-4 py-4 active:bg-slate-50"
      onPress={onPress}
    >
      <View className="flex-row items-center">
        <View className="mr-3 h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
          <Text className="text-lg font-bold text-emerald-700">{title.charAt(0).toUpperCase()}</Text>
        </View>
        <View className="flex-1">
          <View className="flex-row items-center justify-between">
            <Text className="mr-3 flex-1 text-base font-semibold text-slate-900" numberOfLines={1}>
              {title}
            </Text>
            <Text className="text-xs text-slate-500">{formatDate(lastMessageAt)}</Text>
          </View>
          <Text className="mt-1 text-sm text-slate-500" numberOfLines={1}>
            {lastMessageText ?? 'Toque para iniciar a conversa'}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}
