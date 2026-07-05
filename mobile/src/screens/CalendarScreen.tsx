import React, { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors, spacing } from '../theme';
import { Card } from '../components/Card';
import { ScreenHeader } from '../components/ScreenHeader';
import { api, ApiError } from '../api/client';
import { CalendarEvent } from '../types';

function formatDay(iso: string) {
  const d = new Date(iso.replace(' ', 'T'));
  return d.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
}

function formatTime(iso: string) {
  const d = new Date(iso.replace(' ', 'T'));
  return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

export function CalendarScreen() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await api<{ events: CalendarEvent[] }>('/calendar/upcoming');
      setEvents(res.events);
      setError(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not load the calendar.');
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
      <ScreenHeader title="Family calendar" subtitle="Next 14 days" />
      <View style={styles.body}>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        {events.length === 0 ? (
          <Card>
            <Text style={styles.empty}>No events in the next 14 days.</Text>
          </Card>
        ) : (
          events.map((event) => (
            <Card key={event.id}>
              <View style={styles.row}>
                <View style={styles.dateBox}>
                  <Text style={styles.dateText}>{formatDay(event.start_at)}</Text>
                  <Text style={styles.timeText}>{event.all_day ? 'All day' : formatTime(event.start_at)}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.title}>{event.title}</Text>
                  <Text style={styles.meta}>
                    {event.calendar_name} · {event.source}
                  </Text>
                  {event.location ? <Text style={styles.location}>{event.location}</Text> : null}
                </View>
              </View>
            </Card>
          ))
        )}
        <Text style={styles.footer}>Hosted locally on the Eastwood homelab. Calendar data contains no credentials.</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background },
  body: { padding: spacing.lg, paddingTop: 0 },
  error: { color: colors.danger, marginBottom: spacing.md },
  empty: { color: colors.subtext, textAlign: 'center' },
  row: { flexDirection: 'row', gap: spacing.md },
  dateBox: { width: 76 },
  dateText: { fontSize: 12, fontWeight: '700', color: colors.text },
  timeText: { fontSize: 11, color: colors.subtext, marginTop: 2 },
  title: { fontSize: 15, fontWeight: '700', color: colors.text },
  meta: { fontSize: 12, color: colors.subtext, marginTop: 2 },
  location: { fontSize: 11, color: colors.subtext, marginTop: 2 },
  footer: { fontSize: 11, color: colors.subtext, textAlign: 'center', marginTop: spacing.md, marginBottom: spacing.xl },
});
