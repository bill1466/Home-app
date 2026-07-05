import React, { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
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
import { DinnerOverview } from '../types';

function formatDate(iso: string) {
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

export function DinnerScreen() {
  const { currentUser } = useProfile();
  const [data, setData] = useState<DinnerOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newIdea, setNewIdea] = useState('');

  const load = useCallback(async () => {
    try {
      const overview = await api<DinnerOverview>('/dinner', { userId: currentUser?.id });
      setData(overview);
      setError(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not load dinner data.');
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

  const vote = async (ideaId: number) => {
    if (!currentUser) return;
    try {
      await api('/dinner/vote', { method: 'POST', userId: currentUser.id, body: { ideaId } });
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not cast vote.');
    }
  };

  const addIdea = async () => {
    const text = newIdea.trim();
    if (!text || !currentUser) return;
    setNewIdea('');
    try {
      await api('/dinner/ideas', { method: 'POST', userId: currentUser.id, body: { text } });
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not add idea.');
    }
  };

  const deleteIdea = async (ideaId: number) => {
    try {
      await api(`/dinner/ideas/${ideaId}`, { method: 'DELETE' });
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not delete idea.');
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  const totalVotes = data?.ideas.reduce((sum, i) => sum + i.votes, 0) ?? 0;

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />}
    >
      <ScreenHeader title="Dinner planning" subtitle="Vote on tomorrow's dinner" />
      <View style={styles.body}>
        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Card>
          <Text style={styles.cardLabel}>Tonight's dinner</Text>
          {data?.tonight ? (
            <>
              <Text style={styles.winnerText}>{data.tonight.ideas.join(' / ')}</Text>
              <Text style={styles.hint}>
                {data.tonight.votes} vote{data.tonight.votes === 1 ? '' : 's'} · {formatDate(data.tonight.date)}
              </Text>
            </>
          ) : (
            <Text style={styles.hint}>No winner recorded yet for tonight.</Text>
          )}
        </Card>

        <Card>
          <Text style={styles.cardLabel}>
            Vote for {data ? formatDate(data.voteDate) : ''} · {data?.ideas.length ?? 0} options · {totalVotes} votes
          </Text>
          <View style={styles.addRow}>
            <TextInput
              style={styles.input}
              placeholder="Suggest dinner: tacos, spaghetti, leftovers…"
              placeholderTextColor={colors.subtext}
              value={newIdea}
              onChangeText={setNewIdea}
              onSubmitEditing={addIdea}
            />
            <TouchableOpacity style={styles.addButton} onPress={addIdea}>
              <Text style={styles.addButtonText}>Add</Text>
            </TouchableOpacity>
          </View>

          {data?.ideas.map((idea) => (
            <View key={idea.id} style={styles.ideaRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.ideaText}>{idea.text}</Text>
                <Text style={styles.hint}>
                  {idea.votes} vote{idea.votes === 1 ? '' : 's'}
                </Text>
              </View>
              <TouchableOpacity
                style={[styles.voteButton, idea.votedByMe && styles.voteButtonActive]}
                onPress={() => vote(idea.id)}
              >
                <Text style={[styles.voteButtonText, idea.votedByMe && styles.voteButtonTextActive]}>
                  {idea.votedByMe ? 'Voted ✓' : 'Vote'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.deleteButton} onPress={() => deleteIdea(idea.id)}>
                <Text style={styles.deleteButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
          ))}
        </Card>

        <Card>
          <Text style={styles.cardLabel}>Most popular dinners this year</Text>
          {data?.leaderboard.map((entry, i) => (
            <View key={entry.text} style={styles.leaderRow}>
              <Text style={styles.leaderRank}>#{i + 1}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.ideaText}>{entry.text}</Text>
                <Text style={styles.hint}>
                  {entry.wins} win{entry.wins === 1 ? '' : 's'} · {entry.totalVotes} winning votes · Last won{' '}
                  {formatDate(entry.lastWon)}
                </Text>
              </View>
            </View>
          ))}
        </Card>

        <Card>
          <Text style={styles.cardLabel}>Recent history</Text>
          {data?.history.map((entry) => (
            <Text key={entry.date} style={styles.historyLine}>
              {formatDate(entry.date)}: {entry.ideas.join(' / ')}
            </Text>
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
  cardLabel: { fontSize: 14, fontWeight: '700', color: colors.text, marginBottom: spacing.sm },
  hint: { fontSize: 12, color: colors.subtext, marginTop: 2 },
  winnerText: { fontSize: 20, fontWeight: '700', color: colors.primary },
  addRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
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
  ideaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  ideaText: { fontSize: 15, color: colors.text, fontWeight: '600' },
  voteButton: {
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  voteButtonActive: { backgroundColor: colors.primary },
  voteButtonText: { color: colors.primary, fontWeight: '700', fontSize: 12 },
  voteButtonTextActive: { color: '#fff' },
  deleteButton: { padding: 6 },
  deleteButtonText: { color: colors.subtext, fontSize: 16 },
  leaderRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.sm },
  leaderRank: { width: 32, fontWeight: '700', color: colors.subtext },
  historyLine: { fontSize: 13, color: colors.text, paddingVertical: 4 },
});
