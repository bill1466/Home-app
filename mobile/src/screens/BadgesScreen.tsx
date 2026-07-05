import React, { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, radius, spacing } from '../theme';
import { Card } from '../components/Card';
import { ScreenHeader } from '../components/ScreenHeader';
import { api, ApiError } from '../api/client';
import { BadgesResponse } from '../types';

export function BadgesScreen() {
  const [data, setData] = useState<BadgesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await api<BadgesResponse>('/badges');
      setData(res);
      setError(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not load badges.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />}
    >
      <ScreenHeader title="Reward badges 🏆" subtitle="Earn badges by logging in, helping with chores, suggesting dinner, voting, and posting notes" />
      <View style={styles.body}>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <TouchableOpacity style={styles.refreshButton} onPress={() => { setRefreshing(true); load(); }}>
          <Text style={styles.refreshButtonText}>Refresh badges</Text>
        </TouchableOpacity>

        {data?.badges.map((badge) => (
          <Card key={badge.key}>
            <View style={styles.badgeHeader}>
              <Text style={styles.badgeEmoji}>{badge.emoji}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.badgeName}>{badge.name}</Text>
                <Text style={styles.badgeDescription}>{badge.description}</Text>
              </View>
            </View>
            {badge.leaders.length > 0 ? (
              <Text style={styles.badgeLeader}>
                {badge.leaders.map((l) => `${l.emoji} ${l.name}`).join(', ')} · {badge.label}
              </Text>
            ) : (
              <Text style={styles.badgeLeader}>No one yet</Text>
            )}
          </Card>
        ))}

        <Card>
          <Text style={styles.cardLabel}>Everyone</Text>
          {data?.people.map((p) => (
            <View key={p.id} style={styles.personRow}>
              <Text style={styles.personEmoji}>{p.emoji}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.personName}>{p.name}</Text>
                <Text style={styles.personStats}>
                  {p.loginStreak} day login streak · {p.chores} chores · {p.ideas} ideas · {p.voteDays} vote days
                </Text>
              </View>
              <Text style={styles.personBadges}>{p.badges.map((b) => b.emoji).join(' ') || '—'}</Text>
            </View>
          ))}
        </Card>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background },
  body: { padding: spacing.lg, paddingTop: 0 },
  error: { color: colors.danger, marginBottom: spacing.md },
  refreshButton: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginBottom: spacing.md,
    backgroundColor: colors.card,
  },
  refreshButtonText: { fontSize: 12, fontWeight: '600', color: colors.text },
  badgeHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm },
  badgeEmoji: { fontSize: 28 },
  badgeName: { fontSize: 15, fontWeight: '700', color: colors.text },
  badgeDescription: { fontSize: 12, color: colors.subtext, marginTop: 2 },
  badgeLeader: { fontSize: 13, color: colors.primary, fontWeight: '600' },
  cardLabel: { fontSize: 14, fontWeight: '700', color: colors.text, marginBottom: spacing.sm },
  personRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.sm, borderTopWidth: 1, borderTopColor: colors.border },
  personEmoji: { fontSize: 22 },
  personName: { fontSize: 14, fontWeight: '700', color: colors.text },
  personStats: { fontSize: 11, color: colors.subtext, marginTop: 2 },
  personBadges: { fontSize: 16 },
});
