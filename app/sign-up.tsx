import { useAuthActions, useConvexAuth } from '@convex-dev/auth/react';
import Button from '@/components/Button';
import Input from '@/components/Input';
import { Link, Redirect, useRouter } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SignUpScreen() {
  const router = useRouter();
  const { signIn } = useAuthActions();
  const { isAuthenticated } = useConvexAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isAuthenticated) {
    return <Redirect href="/conversations" />;
  }

  async function handleSignUp() {
    setError('');

    if (!name.trim() || !email.trim() || !password) {
      setError('Preencha nome, email e senha.');
      return;
    }

    if (password.length < 8) {
      setError('A senha deve ter pelo menos 8 caracteres.');
      return;
    }

    try {
      setIsSubmitting(true);
      await signIn('password', {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        flow: 'signUp',
      });
      router.replace('/conversations');
    } catch {
      setError('Nao foi possivel criar a conta.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerClassName="flex-grow px-6 pb-8 pt-14">
          <View className="mb-7">
            <Text className="text-3xl font-bold text-slate-900">Criar conta</Text>
            <Text className="mt-2 text-base leading-6 text-slate-600">
              Cadastre-se com email e senha para entrar no chat.
            </Text>
          </View>

          <View className="rounded-2xl border border-slate-200 bg-white p-5">
            <Input label="Nome" value={name} onChangeText={setName} placeholder="Seu nome" />
            <Input
              label="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              placeholder="seu@email.com"
            />
            <Input
              label="Senha"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholder="Minimo de 8 caracteres"
            />

            {error ? (
              <View className="mb-4 rounded-xl bg-red-50 px-4 py-3">
                <Text className="text-sm text-red-700">{error}</Text>
              </View>
            ) : null}

            <Button title="Criar conta" onPress={handleSignUp} loading={isSubmitting} />
          </View>

          <View className="mt-6 flex-row justify-center">
            <Text className="text-slate-600">Ja tem conta? </Text>
            <Link href="/sign-in" className="font-semibold text-emerald-700">
              Entrar
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
