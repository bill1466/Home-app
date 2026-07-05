import React from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, radius, spacing } from '../theme';
import { useProfile } from '../context/ProfileContext';

export function ProfilePickerScreen() {
  const { users, loading, error, selectProfile, refreshUsers } = useProfile();

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <Text style={styles.emoji}>🏡</Text>
      <Text style={styles.title}>Eastwood Home Hub</Text>
      <Text style={styles.subtitle}>Who's using the app?</Text>

      {loading ? (
        <ActivityIndicator style={{ marginTop: spacing.xl }} color={colors.primary} />
      ) : error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={refreshUsers} style={styles.retryButton}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={users}
          keyExtractor={(u) => String(u.id)}
          numColumns={2}
          contentContainerStyle={styles.list}
          columnWrapperStyle={{ gap: spacing.md }}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.profileCard} onPress={() => selectProfile(item)}>
              <Text style={styles.profileEmoji}>{item.emoji}</Text>
              <Text style={styles.profileName}>{item.name}</Text>
            </TouchableOpacity>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    paddingTop: spacing.xl,
  },
  emoji: { fontSize: 48 },
  title: { fontSize: 24, fontWeight: '700', color: colors.text, marginTop: spacing.sm },
  subtitle: { fontSize: 14, color: colors.subtext, marginTop: spacing.xs, marginBottom: spacing.lg },
  list: { paddingHorizontal: spacing.lg, gap: spacing.md, paddingBottom: spacing.xl },
  profileCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    paddingVertical: spacing.xl,
    marginBottom: spacing.md,
  },
  profileEmoji: { fontSize: 36, marginBottom: spacing.sm },
  profileName: { fontSize: 16, fontWeight: '600', color: colors.text },
  errorBox: { padding: spacing.lg, alignItems: 'center' },
  errorText: { color: colors.danger, textAlign: 'center', marginBottom: spacing.md },
  retryButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
  },
  retryText: { color: '#fff', fontWeight: '600' },
});
