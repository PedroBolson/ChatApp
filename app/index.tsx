import { useConvexAuth } from '@convex-dev/auth/react';
import { Redirect } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

export default function IndexScreen() {
  const { isAuthenticated, isLoading } = useConvexAuth();

  useEffect(() => {
    console.log('IndexScreen auth state', { isAuthenticated, isLoading });
  }, [isAuthenticated, isLoading]);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator color="#059669" />
        <Text style={styles.text}>Carregando...</Text>
      </View>
    );
  }

  return <Redirect href={isAuthenticated ? '/conversations' : '/sign-in'} />;
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: '#ffffff',
    flex: 1,
    justifyContent: 'center',
  },
  text: {
    color: '#4b5563',
    marginTop: 12,
  },
});
