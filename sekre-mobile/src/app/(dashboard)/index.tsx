import React from 'react';
import { StyleSheet } from 'react-native';
import { Button } from '../../shared/ui/button';
import { ThemedView } from '../../shared/ui/themed-view';
import { ThemedText } from '../../shared/ui/themed-text';
import { useAuthStore } from '../../shared/store/auth-store';
import { useLogout } from '../../features/auth/use-logout';

export default function DashboardScreen() {
  const { user, organization } = useAuthStore();
  const logoutMutation = useLogout();

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.title}>Dashboard</ThemedText>
      <ThemedText style={styles.subtitle}>Selamat datang, {user?.full_name}</ThemedText>
      <ThemedText style={styles.subtitle}>Organisasi: {organization?.name}</ThemedText>
      
      <Button 
        title="Logout" 
        variant="outline" 
        onPress={() => logoutMutation.mutate()} 
        isLoading={logoutMutation.isPending}
        style={{ marginTop: 24 }}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    marginBottom: 8,
  },
  subtitle: {
    marginBottom: 4,
  }
});
