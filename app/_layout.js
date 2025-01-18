import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useEffect } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { DataManager } from '../utils/storage';

export default function Layout() {
  useEffect(() => {
    // Initialize data manager
    DataManager.initialize();

    // Set up network status listener
    const unsubscribe = NetInfo.addEventListener(state => {
      DataManager.setOnlineStatus(state.isConnected);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <Tabs
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'journal') {
            iconName = focused ? 'journal' : 'journal-outline';
          } else if (route.name === 'plan') {
            iconName = focused ? 'grid' : 'grid-outline';
          } else if (route.name === 'today') {
            iconName = focused ? 'today' : 'today-outline';
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tabs.Screen
        name="journal"
        options={{
          title: 'Journal',
        }}
      />
      <Tabs.Screen
        name="plan"
        options={{
          title: 'Plan',
        }}
      />
      <Tabs.Screen
        name="today"
        options={{
          title: 'Today',
        }}
      />
    </Tabs>
  );
}