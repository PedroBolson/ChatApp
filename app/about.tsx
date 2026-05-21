import LoadingState from '@/components/LoadingState';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useConvexAuth } from '@convex-dev/auth/react';
import { Redirect, useRouter } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FsgLogo from '../assets/fsg-logo.svg';

const identification = [
  'Disciplina: Programação de Dispositivos Móveis',
  'Alunos: Bernardo Vieira, Lucas Risson e Pedro Bolson',
  'Professor: Adelcio Biazi',
  'Instituição: FSG — Centro Universitário da Serra Gaúcha',
  'Local: Caxias do Sul',
  'Ano: 2026',
];

const technologies = [
  'React Native',
  'Expo',
  'TypeScript',
  'Convex',
  'Convex Auth',
  'NativeWind',
  'Expo Router',
];

const features = [
  'Login e cadastro de usuários',
  'Edição de perfil',
  'Listagem de contatos',
  'Conversas privadas',
  'Grupo da turma',
  'Envio e recebimento de mensagens em tempo real',
  'Contador de mensagens não lidas',
  'Indicadores simples de leitura',
];

export default function AboutScreen() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useConvexAuth();

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <LoadingState message="Carregando informações..." />
      </SafeAreaView>
    );
  }

  if (!isAuthenticated) {
    return <Redirect href="/sign-in" />;
  }

  return (
    <SafeAreaView className="flex-1 bg-emerald-700" edges={['top']}>
      <SafeAreaView className="flex-1 bg-white" edges={['left', 'right', 'bottom']}>
        <View className="flex-row items-center bg-emerald-700 px-3 py-3">
          <Pressable
            className="mr-2 h-10 w-10 items-center justify-center rounded-full active:bg-emerald-800"
            onPress={() => router.back()}
            accessible
            accessibilityRole="button"
            accessibilityLabel="Voltar"
            accessibilityHint="Volta para a tela anterior"
          >
            <Ionicons name="arrow-back" size={24} color="#ffffff" />
          </Pressable>
          <Text className="flex-1 text-xl font-bold text-white">Sobre o ChatApp</Text>
        </View>

        <ScrollView contentContainerClassName="px-5 py-6 pb-10">
          <View className="mb-5 items-center">
            <View className="mb-5 h-40 w-full items-center justify-center rounded-xl bg-emerald-800 px-5 py-4">
              <FsgLogo width="100%" height={128} />
            </View>
            <Text className="mb-2 text-center text-3xl font-bold text-slate-900">ChatApp</Text>
            <Text className="text-center text-base leading-6 text-slate-700">
              Aplicativo móvel de mensagens em tempo real desenvolvido como projeto acadêmico.
            </Text>
          </View>

          <View className="mb-4 rounded-xl border border-slate-200 bg-white p-4">
            <Text className="mb-3 text-lg font-semibold text-slate-900">Identificação</Text>
            {identification.map((item) => (
              <Text key={item} className="mb-2 text-base leading-6 text-slate-700">
                {item}
              </Text>
            ))}
          </View>

          <View className="mb-4 rounded-xl border border-slate-200 bg-white p-4">
            <Text className="mb-3 text-lg font-semibold text-slate-900">Objetivo</Text>
            <Text className="text-base leading-6 text-slate-700">
              O objetivo do ChatApp é demonstrar, de forma prática, conceitos de desenvolvimento
              mobile, autenticação de usuários, sincronização em tempo real, gerenciamento de estado
              e comunicação entre usuários em um aplicativo multiplataforma.
            </Text>
          </View>

          <View className="mb-4 rounded-xl border border-slate-200 bg-white p-4">
            <Text className="mb-3 text-lg font-semibold text-slate-900">
              Tecnologias Utilizadas
            </Text>
            {technologies.map((technology) => (
              <Text key={technology} className="mb-2 text-base leading-6 text-slate-700">
                - {technology}
              </Text>
            ))}
          </View>

          <View className="mb-4 rounded-xl border border-slate-200 bg-white p-4">
            <Text className="mb-3 text-lg font-semibold text-slate-900">Funcionalidades</Text>
            {features.map((feature) => (
              <Text key={feature} className="mb-2 text-base leading-6 text-slate-700">
                - {feature}
              </Text>
            ))}
          </View>

          <View className="mb-4 rounded-xl border border-slate-200 bg-white p-4">
            <Text className="mb-3 text-lg font-semibold text-slate-900">Sobre o Projeto</Text>
            <Text className="text-base leading-6 text-slate-700">
              O projeto segue uma estrutura simplificada inspirada no WhatsApp, priorizando clareza,
              organização e facilidade de explicação. A proposta é apresentar um aplicativo
              funcional, com recursos essenciais de comunicação em tempo real, sem adicionar
              complexidade desnecessária para o escopo da disciplina.
            </Text>
          </View>

          <View className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <Text className="mb-3 text-lg font-semibold text-slate-900">Observação</Text>
            <Text className="text-base leading-6 text-slate-700">
              Alguns recursos comuns em aplicativos profissionais, como notificações push, envio de
              mídias e criptografia ponta a ponta, foram deixados como possíveis melhorias futuras.
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </SafeAreaView>
  );
}
