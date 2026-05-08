import { ActivityIndicator, Pressable, Text, View } from 'react-native';

type ContactItemProps = {
  name: string;
  email: string;
  loading?: boolean;
  onPress: () => void;
};

export default function ContactItem({ name, email, loading = false, onPress }: ContactItemProps) {
  return (
    <Pressable
      className="bg-white px-4 py-3 active:bg-slate-50"
      disabled={loading}
      onPress={onPress}
    >
      <View className="flex-row items-center">
        <View className="mr-3 h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
          <Text className="text-lg font-bold text-emerald-700">
            {name.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View className="flex-1 border-b border-slate-100 pb-3">
          <Text className="text-base font-semibold text-slate-900" numberOfLines={1}>
            {name}
          </Text>
          <Text className="mt-1 text-sm text-slate-500" numberOfLines={1}>
            {email || 'Sem email cadastrado'}
          </Text>
        </View>
        {loading ? <ActivityIndicator color="#059669" /> : null}
      </View>
    </Pressable>
  );
}
