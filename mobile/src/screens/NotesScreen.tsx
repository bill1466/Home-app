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
import { Note } from '../types';

function formatDateTime(iso: string) {
  const d = new Date(iso.replace(' ', 'T') + (iso.includes('Z') ? '' : 'Z'));
  return d.toLocaleString([], { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
}

function NoteCard({
  note,
  onDelete,
  onReply,
}: {
  note: Note;
  onDelete: (id: number) => void;
  onReply: (id: number, body: string) => void;
}) {
  const [reply, setReply] = useState('');
  return (
    <Card>
      <Text style={styles.noteBody}>{note.body}</Text>
      <View style={styles.noteMetaRow}>
        <Text style={styles.noteMeta}>
          {note.author_emoji} {note.author_name} · {formatDateTime(note.created_at)}
        </Text>
        <TouchableOpacity onPress={() => onDelete(note.id)}>
          <Text style={styles.deleteText}>Delete</Text>
        </TouchableOpacity>
      </View>

      {note.replies.map((r) => (
        <View key={r.id} style={styles.replyRow}>
          <Text style={styles.replyBody}>{r.body}</Text>
          <Text style={styles.noteMeta}>
            {r.author_emoji} {r.author_name} · {formatDateTime(r.created_at)}
          </Text>
        </View>
      ))}

      <View style={styles.replyInputRow}>
        <TextInput
          style={styles.replyInput}
          placeholder="Reply to this note…"
          placeholderTextColor={colors.subtext}
          value={reply}
          onChangeText={setReply}
        />
        <TouchableOpacity
          onPress={() => {
            if (reply.trim()) {
              onReply(note.id, reply.trim());
              setReply('');
            }
          }}
        >
          <Text style={styles.replyButton}>Reply</Text>
        </TouchableOpacity>
      </View>
    </Card>
  );
}

export function NotesScreen() {
  const { currentUser } = useProfile();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newNote, setNewNote] = useState('');

  const load = useCallback(async () => {
    try {
      const list = await api<Note[]>('/notes');
      setNotes(list);
      setError(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not load notes.');
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

  const addNote = async () => {
    const body = newNote.trim();
    if (!body || !currentUser) return;
    setNewNote('');
    try {
      await api('/notes', { method: 'POST', userId: currentUser.id, body: { body } });
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not add note.');
    }
  };

  const deleteNote = async (id: number) => {
    try {
      await api(`/notes/${id}`, { method: 'DELETE' });
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not delete note.');
    }
  };

  const replyToNote = async (id: number, body: string) => {
    if (!currentUser) return;
    try {
      await api(`/notes/${id}/replies`, { method: 'POST', userId: currentUser.id, body: { body } });
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not add reply.');
    }
  };

  const totalReplies = notes.reduce((sum, n) => sum + n.replies.length, 0);

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
      <ScreenHeader title="Family notes" subtitle={`Shared across devices · ${notes.length} notes · ${totalReplies} replies`} />
      <View style={styles.body}>
        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Card>
          <View style={styles.addRow}>
            <TextInput
              style={styles.input}
              placeholder="Add a note for the family…"
              placeholderTextColor={colors.subtext}
              value={newNote}
              onChangeText={setNewNote}
              multiline
            />
          </View>
          <TouchableOpacity style={styles.addButton} onPress={addNote}>
            <Text style={styles.addButtonText}>Add note</Text>
          </TouchableOpacity>
        </Card>

        {notes.map((note) => (
          <NoteCard key={note.id} note={note} onDelete={deleteNote} onReply={replyToNote} />
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background },
  body: { padding: spacing.lg, paddingTop: 0 },
  error: { color: colors.danger, marginBottom: spacing.md },
  addRow: { marginBottom: spacing.sm },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 14,
    color: colors.text,
    minHeight: 44,
  },
  addButton: { backgroundColor: colors.primary, borderRadius: radius.md, paddingVertical: spacing.sm, alignItems: 'center' },
  addButtonText: { color: '#fff', fontWeight: '700' },
  noteBody: { fontSize: 15, color: colors.text, marginBottom: spacing.sm, lineHeight: 20 },
  noteMetaRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  noteMeta: { fontSize: 12, color: colors.subtext },
  deleteText: { fontSize: 12, color: colors.danger, fontWeight: '600' },
  replyRow: { marginTop: spacing.sm, paddingLeft: spacing.md, borderLeftWidth: 2, borderLeftColor: colors.border },
  replyBody: { fontSize: 13, color: colors.text },
  replyInputRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.sm },
  replyInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    fontSize: 13,
    color: colors.text,
  },
  replyButton: { color: colors.primary, fontWeight: '700', fontSize: 13 },
});
