// app/_layout.js
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useEffect } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { DataManager } from '../utils/storage';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

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
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Tabs
        screenOptions={({ route }) => ({
          headerShown: true,
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;
            const routeName = route.name.replace('index', 'home');

            switch (routeName) {
              case 'journal':
                iconName = focused ? 'book' : 'book-outline';
                break;
              case 'plan':
                iconName = focused ? 'grid' : 'grid-outline';
                break;
              case '/':
                iconName = focused ? 'calendar' : 'calendar-outline';
                break;
              default:
                iconName = focused ? 'home' : 'home-outline';
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },
        })}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Today',
            headerTitle: 'Today\'s Schedule'
          }}
        />
        <Tabs.Screen
          name="journal"
          options={{
            title: 'Journal',
            headerTitle: 'My Journal'
          }}
        />
        <Tabs.Screen
          name="plan"
          options={{
            title: 'Plan',
            headerTitle: 'My Plans'
          }}
        />
      </Tabs>
    </GestureHandlerRootView>
  );
}