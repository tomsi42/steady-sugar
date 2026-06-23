import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { PaperProvider } from 'react-native-paper';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';

import { theme } from './src/app/theme';
import { AppNavigator } from './src/app/navigation';
import { initDatabase } from './src/shared/database/client';

export default function App() {
  const [dbReady, setDbReady] = useState(false);

  useEffect(() => {
    initDatabase();
    setDbReady(true);
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
        <AppNavigator />
      </PaperProvider>
    </GestureHandlerRootView>
  );
}
