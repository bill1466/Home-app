import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Text } from 'react-native';
import { colors } from '../theme';
import { useProfile } from '../context/ProfileContext';
import { ProfilePickerScreen } from '../screens/ProfilePickerScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { DinnerScreen } from '../screens/DinnerScreen';
import { ChoresScreen } from '../screens/ChoresScreen';
import { NotesScreen } from '../screens/NotesScreen';
import { MoreScreen } from '../screens/MoreScreen';
import { BadgesScreen } from '../screens/BadgesScreen';
import { CalendarScreen } from '../screens/CalendarScreen';
import { LinksScreen } from '../screens/LinksScreen';
import { SettingsScreen } from '../screens/SettingsScreen';

const Tab = createBottomTabNavigator();
const MoreStack = createNativeStackNavigator();

const TAB_ICONS: Record<string, string> = {
  Home: '🏡',
  Dinner: '🍽️',
  Chores: '🧹',
  Notes: '📝',
  More: '⋯',
};

function MoreStackScreen() {
  return (
    <MoreStack.Navigator screenOptions={{ headerShown: false }}>
      <MoreStack.Screen name="MoreMenu" component={MoreScreen} />
      <MoreStack.Screen name="Badges" component={BadgesScreen} />
      <MoreStack.Screen name="Calendar" component={CalendarScreen} />
      <MoreStack.Screen name="Links" component={LinksScreen} />
      <MoreStack.Screen name="Settings" component={SettingsScreen} />
    </MoreStack.Navigator>
  );
}

function Tabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.subtext,
        tabBarIcon: () => <Text style={{ fontSize: 20 }}>{TAB_ICONS[route.name]}</Text>,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Dinner" component={DinnerScreen} />
      <Tab.Screen name="Chores" component={ChoresScreen} />
      <Tab.Screen name="Notes" component={NotesScreen} />
      <Tab.Screen name="More" component={MoreStackScreen} />
    </Tab.Navigator>
  );
}

export function RootNavigator() {
  const { currentUser } = useProfile();
  return <NavigationContainer>{currentUser ? <Tabs /> : <ProfilePickerScreen />}</NavigationContainer>;
}
