// app/_layout.js
import { Stack } from 'expo-router/stack';
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
            <Stack>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            </Stack>
    </GestureHandlerRootView>
  );
}