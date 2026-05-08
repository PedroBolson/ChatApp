import { Text, TextInput, View, type TextInputProps } from 'react-native';

type InputProps = TextInputProps & {
  label: string;
  className?: string;
};

export default function Input({ label, className, ...props }: InputProps) {
  return (
    <View className="mb-4">
      <Text className="mb-2 text-sm font-medium text-slate-700">{label}</Text>
      <TextInput
        className={`rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-base text-slate-900 ${className ?? ''}`}
        placeholderTextColor="#94a3b8"
        {...props}
      />
    </View>
  );
}
