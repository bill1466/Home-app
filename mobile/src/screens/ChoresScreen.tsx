import React, { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { colors, radius, spacing } from '../theme';
import { Card } from '../components/Card';
import { ScreenHeader } from '../components/ScreenHeader';
import { useProfile } from '../context/ProfileContext';
import { api, ApiError } from '../api/client';
import { ChoresDay } from '../types';

function formatDate(iso: string) {
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });
}

function RoomCard({
  day,
  roomIndex,
  onToggle,
}: {
  day: ChoresDay;
  roomIndex: number;
  onToggle: (roomId: number, taskIndex: number, done: boolean) => void;
}) {
  const assignment = day.rooms[roomIndex];
  const doneCount = assignment.tasks.filter((t) => t.done).length;
  return (
    <Card>
      <View style={styles.roomHeader}>
        <Text style={styles.roomEmoji}>{assignment.room.emoji}</Text>
        <View style={{ flex: 1 }}>
          <Text style={styles.personName}>
            {assignment.user ? `${assignment.user.emoji} ${assignment.user.name}` : 'Unassigned'}
          </Text>
          <Text style={styles.roomName}>
            {assignment.room.name} · {doneCount}/{assignment.tasks.length}
          </Text>
        </View>
      </View>
      {assignment.tasks.map((task) => (
        <TouchableOpacity
          key={task.index}
          style={styles.taskRow}
          onPress={() => onToggle(assignment.room.id, task.index, !task.done)}
        >
          <View style={[styles.checkbox, task.done && styles.checkboxDone]}>
            {task.done ? <Text style={styles.checkmark}>✓</Text> : null}
          </View>
          <Text style={[styles.taskLabel, task.done && styles.taskLabelDone]}>{task.label}</Text>
        </TouchableOpacity>
      ))}
    </Card>
  );
}

export function ChoresScreen() {
  const { currentUser } = useProfile();
  const [day, setDay] = useState<ChoresDay | null>(null);
  const [log, setLog] = useState<ChoresDay[] | null>(null);
  const [showLog, setShowLog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const today = await api<ChoresDay>('/chores/today');
      setDay(today);
      setError(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not load chores.');
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

  const toggle = async (roomId: number, taskIndex: number, done: boolean) => {
    if (!currentUser) return;
    try {
      const updated = await api<ChoresDay>(done ? '/chores/complete' : '/chores/uncomplete', {
        method: 'POST',
        userId: currentUser.id,
        body: { roomId, taskIndex },
      });
      setDay(updated);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not update chore.');
    }
  };

  const resetToday = async () => {
    try {
      const updated = await api<ChoresDay>('/chores/reset', { method: 'POST' });
      setDay(updated);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not reset today.');
    }
  };

  const toggleLog = async () => {
    if (!showLog && !log) {
      try {
        const rows = await api<ChoresDay[]>('/chores/log');
        setLog(rows);
      } catch (err) {
        setError(err instanceof ApiError ? err.message : 'Could not load log.');
      }
    }
    setShowLog((v) => !v);
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
      <ScreenHeader title="Eastwood Chores" subtitle="Daily rotating room checklist" />
      <View style={styles.body}>
        {error ? <Text style={styles.error}>{error}</Text> : null}

        <View style={styles.actionsRow}>
          <Text style={styles.dateText}>{day ? formatDate(day.date) : ''}</Text>
          <View style={{ flexDirection: 'row', gap: spacing.sm }}>
            <TouchableOpacity style={styles.actionButton} onPress={resetToday}>
              <Text style={styles.actionButtonText}>Reset today</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={toggleLog}>
              <Text style={styles.actionButtonText}>{showLog ? 'Hide log' : 'Show log'}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {!showLog && day
          ? day.rooms.map((_, i) => <RoomCard key={i} day={day} roomIndex={i} onToggle={toggle} />)
          : null}

        {showLog && log
          ? log.map((entry) => (
              <Card key={entry.date}>
                <Text style={styles.cardLabel}>{formatDate(entry.date)}</Text>
                {entry.rooms.map((r) => {
                  const done = r.tasks.filter((t) => t.done).length;
                  return (
                    <Text key={r.room.id} style={styles.logLine}>
                      {r.room.emoji} {r.room.name} — {r.user ? r.user.name : 'Unassigned'} ({done}/{r.tasks.length})
                    </Text>
                  );
                })}
              </Card>
            ))
          : null}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background },
  body: { padding: spacing.lg, paddingTop: 0 },
  error: { color: colors.danger, marginBottom: spacing.md },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  dateText: { fontSize: 13, color: colors.subtext, fontWeight: '600' },
  actionButton: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: colors.card,
  },
  actionButtonText: { fontSize: 12, fontWeight: '600', color: colors.text },
  roomHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.md },
  roomEmoji: { fontSize: 28 },
  personName: { fontSize: 16, fontWeight: '700', color: colors.text },
  roomName: { fontSize: 12, color: colors.subtext, marginTop: 2 },
  taskRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: 6 },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxDone: { backgroundColor: colors.success, borderColor: colors.success },
  checkmark: { color: '#fff', fontSize: 13, fontWeight: '700' },
  taskLabel: { fontSize: 14, color: colors.text, flex: 1 },
  taskLabelDone: { color: colors.subtext, textDecorationLine: 'line-through' },
  cardLabel: { fontSize: 14, fontWeight: '700', color: colors.text, marginBottom: spacing.sm },
  logLine: { fontSize: 13, color: colors.text, paddingVertical: 2 },
});
