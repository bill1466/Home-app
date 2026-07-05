import React from 'react';
import { useNavigation } from '@react-navigation/native';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, radius, spacing } from '../theme';
import { ScreenHeader } from '../components/ScreenHeader';

const ITEMS: { label: string; emoji: string; description: string; route: string }[] = [
  { label: 'Reward badges', emoji: '🏆', description: 'Streaks, chores, and dinner leaderboards', route: 'Badges' },
  { label: 'Family calendar', emoji: '📅', description: 'Next 14 days across the household', route: 'Calendar' },
  { label: 'Family favorites', emoji: '⭐', description: 'Home Assistant, Mealie, Photos, and more', route: 'Links' },
  { label: 'Settings', emoji: '⚙️', description: 'Server address & profile', route: 'Settings' },
];

export function MoreScreen() {
  const navigation = useNavigation<any>();
  return (
    <ScrollView style={styles.container}>
      <ScreenHeader title="More" />
      <View style={styles.body}>
        {ITEMS.map((item) => (
          <TouchableOpacity key={item.route} style={styles.row} onPress={() => navigation.navigate(item.route)}>
            <Text style={styles.emoji}>{item.emoji}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>{item.label}</Text>
              <Text style={styles.description}>{item.description}</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  body: { padding: spacing.lg, paddingTop: 0 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  emoji: { fontSize: 26 },
  label: { fontSize: 15, fontWeight: '700', color: colors.text },
  description: { fontSize: 12, color: colors.subtext, marginTop: 2 },
  chevron: { fontSize: 22, color: colors.subtext },
});
