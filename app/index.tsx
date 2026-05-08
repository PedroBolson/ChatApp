import LoadingState from '@/components/LoadingState';
import { useConvexAuth } from '@convex-dev/auth/react';
import { Redirect } from 'expo-router';

export default function IndexScreen() {
  const { isAuthenticated, isLoading } = useConvexAuth();

  if (isLoading) {
    return <LoadingState message="Carregando..." />;
  }

  return <Redirect href={isAuthenticated ? '/conversations' : '/sign-in'} />;
}
