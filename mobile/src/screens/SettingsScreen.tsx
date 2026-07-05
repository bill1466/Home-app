import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { colors, radius, spacing } from '../theme';
import { Card } from '../components/Card';
import { ScreenHeader } from '../components/ScreenHeader';
import { DEFAULT_API_BASE_URL, getApiBaseUrl, setApiBaseUrl } from '../config';
import { useProfile } from '../context/ProfileContext';

export function SettingsScreen() {
  const [url, setUrl] = useState('');
  const [saved, setSaved] = useState(false);
  const { logout, currentUser } = useProfile();

  useEffect(() => {
    getApiBaseUrl().then(setUrl);
  }, []);

  const save = async () => {
    await setApiBaseUrl(url || DEFAULT_API_BASE_URL);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScreenHeader title="Settings" subtitle="Server & profile" />
      <View style={styles.body}>
        <Card>
          <Text style={styles.label}>Home Hub server address</Text>
          <Text style={styles.hint}>
            Point this at wherever backend/ is running on your home network, e.g.
            http://home.home:4000/api or http://192.168.1.20:4000/api
          </Text>
          <TextInput
            style={styles.input}
            value={url}
            onChangeText={setUrl}
            autoCapitalize="none"
            autoCorrect={false}
            placeholder={DEFAULT_API_BASE_URL}
            placeholderTextColor={colors.subtext}
          />
          <TouchableOpacity style={styles.saveButton} onPress={save}>
            <Text style={styles.saveButtonText}>{saved ? 'Saved ✓' : 'Save'}</Text>
          </TouchableOpacity>
        </Card>

        {currentUser ? (
          <Card>
            <Text style={styles.label}>Signed in as</Text>
            <Text style={styles.hint}>
              {currentUser.emoji} {currentUser.name}
            </Text>
            <TouchableOpacity style={styles.logoutButton} onPress={logout}>
              <Text style={styles.logoutButtonText}>Switch profile</Text>
            </TouchableOpacity>
          </Card>
        ) : null}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  body: { padding: spacing.lg },
  label: { fontSize: 15, fontWeight: '700', color: colors.text, marginBottom: spacing.xs },
  hint: { fontSize: 13, color: colors.subtext, marginBottom: spacing.md },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 14,
    color: colors.text,
    marginBottom: spacing.md,
  },
  saveButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  saveButtonText: { color: '#fff', fontWeight: '700' },
  logoutButton: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  logoutButtonText: { color: colors.text, fontWeight: '600' },
});
