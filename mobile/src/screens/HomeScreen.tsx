import React, { useCallback, useState } from 'react';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { colors, radius, spacing } from '../theme';
import { Card } from '../components/Card';
import { ScreenHeader } from '../components/ScreenHeader';
import { useProfile } from '../context/ProfileContext';
import { api, ApiError } from '../api/client';
import { GlanceResponse, Notice } from '../types';

function formatEventTime(event: GlanceResponse['nextEvent']) {
  if (!event) return '';
  const d = new Date(event.start_at.replace(' ', 'T'));
  const day = d.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
  return event.all_day ? `${day} · All day` : `${day} · ${d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`;
}

const QUICK_LINKS: { label: string; emoji: string; route: string }[] = [
  { label: 'Dinner', emoji: '🍽️', route: 'Dinner' },
  { label: 'Chores', emoji: '🧹', route: 'Chores' },
  { label: 'Notes', emoji: '📝', route: 'Notes' },
  { label: 'Badges', emoji: '🏆', route: 'Badges' },
  { label: 'Calendar', emoji: '📅', route: 'Calendar' },
  { label: 'Links', emoji: '⭐', route: 'Links' },
];

const TAB_ROUTES = new Set(['Home', 'Dinner', 'Chores', 'Notes']);

export function HomeScreen() {
  const navigation = useNavigation<any>();
  const goTo = (route: string) => {
    if (TAB_ROUTES.has(route)) navigation.navigate(route);
    else navigation.navigate('More', { screen: route });
  };
  const { currentUser } = useProfile();
  const [glance, setGlance] = useState<GlanceResponse | null>(null);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [noticeTitle, setNoticeTitle] = useState('');

  const load = useCallback(async () => {
    try {
      const [glanceRes, noticesRes] = await Promise.all([
        api<GlanceResponse>('/home/glance', { userId: currentUser?.id }),
        api<Notice[]>('/notices'),
      ]);
      setGlance(glanceRes);
      setNotices(noticesRes);
      setError(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not load the dashboard.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [currentUser?.id]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const addNotice = async () => {
    const title = noticeTitle.trim();
    if (!title || !currentUser) return;
    setNoticeTitle('');
    try {
      await api('/notices', { method: 'POST', userId: currentUser.id, body: { title } });
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not add notice.');
    }
  };

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
      <ScreenHeader title="Eastwood Home Hub" subtitle="One friendly place for family apps, calendars, and house links" />
      <View style={styles.body}>
        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Card>
          <Text style={styles.cardLabel}>📣 Important notices</Text>
          <View style={styles.addRow}>
            <TextInput
              style={styles.input}
              placeholder="Add an important notice…"
              placeholderTextColor={colors.subtext}
              value={noticeTitle}
              onChangeText={setNoticeTitle}
              onSubmitEditing={addNotice}
            />
            <TouchableOpacity style={styles.addButton} onPress={addNotice}>
              <Text style={styles.addButtonText}>Add</Text>
            </TouchableOpacity>
          </View>
          {notices.length === 0 ? (
            <Text style={styles.hint}>No manual notices right now. Add one above.</Text>
          ) : (
            notices.map((n) => (
              <View key={n.id} style={styles.noticeRow}>
                <Text style={styles.noticeTitle}>{n.title}</Text>
                {n.details ? <Text style={styles.hint}>{n.details}</Text> : null}
              </View>
            ))
          )}
        </Card>

        <View style={styles.glanceGrid}>
          <TouchableOpacity style={styles.glanceCard} onPress={() => goTo('Calendar')}>
            <Text style={styles.glanceEmoji}>📅</Text>
            <Text style={styles.glanceLabel}>Next up</Text>
            <Text style={styles.glanceValue}>{glance?.nextEvent ? glance.nextEvent.title : 'Nothing scheduled'}</Text>
            <Text style={styles.hint}>{formatEventTime(glance?.nextEvent ?? null)}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.glanceCard} onPress={() => navigation.navigate('Dinner')}>
            <Text style={styles.glanceEmoji}>🍽️</Text>
            <Text style={styles.glanceLabel}>Dinner</Text>
            <Text style={styles.glanceValue}>{glance?.dinner.tonight?.ideas.join(' / ') || 'No winner yet'}</Text>
            <Text style={styles.hint}>
              {glance?.dinner.optionCount ?? 0} ideas for tomorrow · {glance?.dinner.totalVotes ?? 0} votes
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.glanceCard} onPress={() => navigation.navigate('Notes')}>
            <Text style={styles.glanceEmoji}>📝</Text>
            <Text style={styles.glanceLabel}>Family chatter</Text>
            <Text style={styles.glanceValue}>{glance?.notes.count ?? 0} notes</Text>
            <Text style={styles.hint}>{glance?.notes.replyCount ?? 0} replies</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.glanceCard} onPress={() => goTo('Badges')}>
            <Text style={styles.glanceEmoji}>🏆</Text>
            <Text style={styles.glanceLabel}>Reward badges</Text>
            {glance?.topPeople.slice(0, 2).map((p) => (
              <Text key={p.id} style={styles.hint}>
                {p.badges[0]?.emoji ?? '🔸'} {p.name}
              </Text>
            ))}
          </TouchableOpacity>
        </View>

        <Card>
          <Text style={styles.cardLabel}>🎲 Micro mission</Text>
          <Text style={styles.missionText}>{glance?.microMission}</Text>
        </Card>

        <Card>
          <Text style={styles.cardLabel}>Jump into</Text>
          <View style={styles.quickLinksGrid}>
            {QUICK_LINKS.map((link) => (
              <TouchableOpacity key={link.route} style={styles.quickLink} onPress={() => goTo(link.route)}>
                <Text style={styles.quickLinkEmoji}>{link.emoji}</Text>
                <Text style={styles.quickLinkLabel}>{link.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
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
  cardLabel: { fontSize: 14, fontWeight: '700', color: colors.text, marginBottom: spacing.sm },
  hint: { fontSize: 12, color: colors.subtext, marginTop: 2 },
  addRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.sm },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 14,
    color: colors.text,
  },
  addButton: { backgroundColor: colors.primary, borderRadius: radius.md, paddingHorizontal: spacing.md, justifyContent: 'center' },
  addButtonText: { color: '#fff', fontWeight: '700' },
  noticeRow: { paddingVertical: spacing.sm, borderTopWidth: 1, borderTopColor: colors.border },
  noticeTitle: { fontSize: 14, fontWeight: '600', color: colors.text },
  glanceGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, marginBottom: spacing.md },
  glanceCard: {
    width: '47%',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.md,
  },
  glanceEmoji: { fontSize: 22 },
  glanceLabel: { fontSize: 12, color: colors.subtext, fontWeight: '600', marginTop: 4 },
  glanceValue: { fontSize: 14, fontWeight: '700', color: colors.text, marginTop: 2 },
  missionText: { fontSize: 15, color: colors.text, lineHeight: 20 },
  quickLinksGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  quickLink: { width: '30%', alignItems: 'center', paddingVertical: spacing.sm },
  quickLinkEmoji: { fontSize: 24 },
  quickLinkLabel: { fontSize: 11, color: colors.text, marginTop: 4, fontWeight: '600' },
});
