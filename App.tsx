import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { PaperProvider } from 'react-native-paper';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';

import { theme } from './src/app/theme';
import { AppNavigator } from './src/app/navigation';
import { initDatabase } from './src/shared/database/client';
import { initSkiaWeb } from './src/shared/skia/initSkiaWeb';
import { useSettingsStore } from './src/features/settings/store';

export default function App() {
  const [dbReady, setDbReady] = useState(false);
  const [isOnboarded, setIsOnboarded] = useState(false);

  useEffect(() => {
    async function setup() {
      await initSkiaWeb();
      await initDatabase();
      await useSettingsStore.getState().load();
      const s = useSettingsStore.getState().settings;
      setIsOnboarded(s !== null && s.userName.length > 0);
      setDbReady(true);
    }
    setup();
  }, []);

  if (!dbReady) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <PaperProvider theme={theme}>
        <StatusBar style="auto" />
        <AppNavigator isOnboarded={isOnboarded} />
      </PaperProvider>
    </GestureHandlerRootView>
  );
}
