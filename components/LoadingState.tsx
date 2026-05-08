import { ActivityIndicator, Text, View } from 'react-native';

type LoadingStateProps = {
  message: string;
};

export default function LoadingState({ message }: LoadingStateProps) {
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <ActivityIndicator color="#059669" />
      <Text className="mt-3 text-slate-500">{message}</Text>
    </View>
  );
}
