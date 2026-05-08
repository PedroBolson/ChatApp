import { Text, View } from 'react-native';

type EmptyStateProps = {
  title: string;
  message: string;
};

export default function EmptyState({ title, message }: EmptyStateProps) {
  return (
    <View className="mx-4 mt-8 items-center rounded-xl border border-dashed border-slate-300 bg-slate-50 px-6 py-10">
      <Text className="text-center text-base font-semibold text-slate-700">{title}</Text>
      <Text className="mt-2 text-center text-sm leading-5 text-slate-500">{message}</Text>
    </View>
  );
}
