import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, spacing } from '../theme';
import { useProfile } from '../context/ProfileContext';

export function ScreenHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  const { currentUser, logout } = useProfile();
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(id);
  }, []);

  const time = now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  const date = now.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
        {currentUser ? (
          <TouchableOpacity onPress={logout} style={styles.profilePill}>
            <Text style={styles.profileEmoji}>{currentUser.emoji}</Text>
            <Text style={styles.profileName}>{currentUser.name}</Text>
          </TouchableOpacity>
        ) : null}
      </View>
      <Text style={styles.clock}>
        {time} · {date}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
  },
  subtitle: {
    fontSize: 13,
    color: colors.subtext,
    marginTop: 2,
  },
  clock: {
    fontSize: 12,
    color: colors.subtext,
    marginTop: spacing.xs,
  },
  profilePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primarySoft,
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 10,
    gap: 6,
  },
  profileEmoji: {
    fontSize: 16,
  },
  profileName: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
  },
});
