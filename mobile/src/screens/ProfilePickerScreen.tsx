import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, radius, spacing } from '../theme';
import { useProfile } from '../context/ProfileContext';
import { DEFAULT_API_BASE_URL, getApiBaseUrl, setApiBaseUrl } from '../config';

export function ProfilePickerScreen() {
  const { users, loading, error, selectProfile, refreshUsers } = useProfile();
  const [serverUrl, setServerUrl] = useState('');
  const [editingServer, setEditingServer] = useState(false);
  const [savedJustNow, setSavedJustNow] = useState(false);

  useEffect(() => {
    getApiBaseUrl().then(setServerUrl);
  }, []);

  // If the default server can't be reached, open the editor automatically —
  // there's no other screen to fix this from until a profile is picked.
  useEffect(() => {
    if (error) setEditingServer(true);
  }, [error]);

  const saveServer = async () => {
    await setApiBaseUrl(serverUrl || DEFAULT_API_BASE_URL);
    setSavedJustNow(true);
    setTimeout(() => setSavedJustNow(false), 1500);
    refreshUsers();
  };

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

      <View style={styles.serverSection}>
        <TouchableOpacity onPress={() => setEditingServer((v) => !v)}>
          <Text style={styles.serverToggle}>
            {editingServer ? 'Hide server address' : `⚙️ Server: ${serverUrl || DEFAULT_API_BASE_URL}`}
          </Text>
        </TouchableOpacity>

        {editingServer ? (
          <View style={styles.serverEditor}>
            <Text style={styles.serverHint}>
              Where is your Home Hub backend running? e.g. http://home.home:4000/api or
              http://192.168.1.20:4000/api
            </Text>
            <TextInput
              style={styles.input}
              value={serverUrl}
              onChangeText={setServerUrl}
              autoCapitalize="none"
              autoCorrect={false}
              placeholder={DEFAULT_API_BASE_URL}
              placeholderTextColor={colors.subtext}
            />
            <TouchableOpacity style={styles.saveButton} onPress={saveServer}>
              <Text style={styles.saveButtonText}>{savedJustNow ? 'Saved ✓ — retrying…' : 'Save & retry'}</Text>
            </TouchableOpacity>
          </View>
        ) : null}
      </View>
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
  profileEmoji: { fontSize: 56, marginBottom: spacing.sm },
  profileName: { fontSize: 16, fontWeight: '600', color: colors.text },
  errorBox: { padding: spacing.lg, alignItems: 'center' },
  errorText: { color: colors.danger, textAlign: 'center', marginBottom: spacing.md },
  serverSection: { width: '100%', paddingHorizontal: spacing.lg, marginTop: 'auto', marginBottom: spacing.lg },
  serverToggle: { fontSize: 12, color: colors.subtext, textAlign: 'center', marginBottom: spacing.sm },
  serverEditor: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.md,
  },
  serverHint: { fontSize: 12, color: colors.subtext, marginBottom: spacing.sm },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 14,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  saveButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  saveButtonText: { color: '#fff', fontWeight: '700' },
});
