import React, { useCallback, useState } from 'react';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import {
  ActivityIndicator,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { colors, radius, spacing } from '../theme';
import { ScreenHeader } from '../components/ScreenHeader';
import { api, ApiError } from '../api/client';
import { FamilyLink } from '../types';

export function LinksScreen() {
  const navigation = useNavigation<any>();
  const [links, setLinks] = useState<FamilyLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');

  const load = useCallback(async () => {
    try {
      const res = await api<FamilyLink[]>('/links');
      setLinks(res);
      setError(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not load family favorites.');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const TAB_ROUTES = new Set(['Home', 'Dinner', 'Chores', 'Notes']);

  const open = (link: FamilyLink) => {
    if (link.internal_route) {
      const parent = navigation.getParent();
      if (TAB_ROUTES.has(link.internal_route)) {
        parent?.navigate(link.internal_route);
      } else {
        parent?.navigate('More', { screen: link.internal_route });
      }
    } else if (link.url) {
      Linking.openURL(link.url).catch(() => {});
    }
  };

  const filtered = links.filter(
    (l) =>
      !query.trim() ||
      l.label.toLowerCase().includes(query.toLowerCase()) ||
      (l.description || '').toLowerCase().includes(query.toLowerCase())
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <ScreenHeader title="Family favorites" subtitle="Tap a card to open" />
      <View style={styles.body}>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <TextInput
          style={styles.search}
          placeholder="Search apps: recipes, photos, lights, movies…"
          placeholderTextColor={colors.subtext}
          value={query}
          onChangeText={setQuery}
        />
        <View style={styles.grid}>
          {filtered.map((link) => (
            <TouchableOpacity key={link.id} style={styles.tile} onPress={() => open(link)}>
              <Text style={styles.tileEmoji}>{link.emoji}</Text>
              <Text style={styles.tileLabel}>{link.label}</Text>
              {link.description ? <Text style={styles.tileDescription}>{link.description}</Text> : null}
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background },
  body: { padding: spacing.lg, paddingTop: 0 },
  error: { color: colors.danger, marginBottom: spacing.md },
  search: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 14,
    color: colors.text,
    backgroundColor: colors.card,
    marginBottom: spacing.md,
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  tile: {
    width: '47%',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  tileEmoji: { fontSize: 30, marginBottom: spacing.sm },
  tileLabel: { fontSize: 14, fontWeight: '700', color: colors.text },
  tileDescription: { fontSize: 11, color: colors.subtext, marginTop: 4 },
});
