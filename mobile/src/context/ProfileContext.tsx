import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../api/client';
import { User } from '../types';

const STORAGE_KEY = 'homehub.currentUserId';

type ProfileContextValue = {
  users: User[];
  currentUser: User | null;
  loading: boolean;
  error: string | null;
  refreshUsers: () => Promise<void>;
  selectProfile: (user: User) => Promise<void>;
  logout: () => Promise<void>;
};

const ProfileContext = createContext<ProfileContextValue | undefined>(undefined);

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshUsers = useCallback(async () => {
    try {
      const list = await api<User[]>('/users');
      setUsers(list);
      setError(null);
    } catch (err: any) {
      setError(err?.message || 'Could not load household profiles.');
    }
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await refreshUsers();
      const storedId = await AsyncStorage.getItem(STORAGE_KEY);
      setLoading(false);
      if (storedId) {
        setCurrentUser((prev) => prev);
      }
    })();
  }, [refreshUsers]);

  useEffect(() => {
    (async () => {
      if (users.length === 0 || currentUser) return;
      const storedId = await AsyncStorage.getItem(STORAGE_KEY);
      if (storedId) {
        const match = users.find((u) => u.id === Number(storedId));
        if (match) setCurrentUser(match);
      }
    })();
  }, [users, currentUser]);

  const selectProfile = useCallback(async (user: User) => {
    setCurrentUser(user);
    await AsyncStorage.setItem(STORAGE_KEY, String(user.id));
    try {
      await api(`/users/${user.id}/login`, { method: 'POST' });
    } catch {
      // Non-fatal — badges just won't record today's login until the server is reachable.
    }
  }, []);

  const logout = useCallback(async () => {
    setCurrentUser(null);
    await AsyncStorage.removeItem(STORAGE_KEY);
  }, []);

  const value = useMemo(
    () => ({ users, currentUser, loading, error, refreshUsers, selectProfile, logout }),
    [users, currentUser, loading, error, refreshUsers, selectProfile, logout]
  );

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

export function useProfile() {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error('useProfile must be used within a ProfileProvider');
  return ctx;
}
