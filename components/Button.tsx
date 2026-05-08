import { ActivityIndicator, Pressable, Text, type PressableProps } from 'react-native';

type ButtonProps = PressableProps & {
  title: string;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'light';
  className?: string;
};

export default function Button({
  title,
  loading = false,
  variant = 'primary',
  disabled,
  className,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;
  const baseClassName = 'items-center justify-center rounded-xl px-4 py-3';
  const variantClassName = {
    primary: 'bg-emerald-600 active:bg-emerald-700',
    secondary: 'bg-slate-100 active:bg-slate-200',
    light: 'bg-white active:bg-emerald-50',
  }[variant];
  const textClassName = {
    primary: 'text-white',
    secondary: 'text-slate-800',
    light: 'text-emerald-700',
  }[variant];

  return (
    <Pressable
      className={`${baseClassName} ${variantClassName} ${isDisabled ? 'opacity-70' : ''} ${className ?? ''}`}
      disabled={isDisabled}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? '#ffffff' : '#374151'} />
      ) : (
        <Text className={`font-semibold ${textClassName}`}>{title}</Text>
      )}
    </Pressable>
  );
}
