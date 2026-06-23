import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from 'react-native-paper';

import { LogScreen } from '../features/blood_sugar/screens/LogScreen';
import { GraphScreen } from '../features/graph/screens/GraphScreen';
import { SettingsScreen } from '../features/settings/screens/SettingsScreen';
import { BloodSugarFormScreen } from '../features/blood_sugar/screens/BloodSugarFormScreen';
import { FoodFormScreen } from '../features/food_log/screens/FoodFormScreen';
import { WeightFormScreen } from '../features/weight/screens/WeightFormScreen';

export type RootStackParamList = {
  Tabs: undefined;
  Settings: undefined;
  BloodSugarForm: { readingId?: number } | undefined;
  FoodForm: { entryId?: number } | undefined;
  WeightForm: { entryId?: number } | undefined;
};

export type TabParamList = {
  Log: undefined;
  Graph: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

function TabNavigator() {
  const theme = useTheme();

  function SettingsButton({ navigation }: { navigation: any }) {
    return (
      <MaterialCommunityIcons
        name="cog-outline"
        size={24}
        color={theme.colors.primary}
        style={{ marginRight: 16 }}
        onPress={() => navigation.navigate('Settings')}
      />
    );
  }

  return (
    <Tab.Navigator
      screenOptions={({ navigation }) => ({
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: '#757575',
        headerRight: () => <SettingsButton navigation={navigation} />,
      })}
    >
      <Tab.Screen
        name="Log"
        component={LogScreen}
        options={{
          title: 'Log',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="clipboard-list-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Graph"
        component={GraphScreen}
        options={{
          title: 'Graph',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="chart-line" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Tabs" component={TabNavigator} />
        <Stack.Screen
          name="Settings"
          component={SettingsScreen}
          options={{ headerShown: true, title: 'Settings' }}
        />
        <Stack.Screen
          name="BloodSugarForm"
          component={BloodSugarFormScreen}
          options={{ headerShown: true, title: 'Log Blood Sugar' }}
        />
        <Stack.Screen
          name="FoodForm"
          component={FoodFormScreen}
          options={{ headerShown: true, title: 'Log Food / Drink' }}
        />
        <Stack.Screen
          name="WeightForm"
          component={WeightFormScreen}
          options={{ headerShown: true, title: 'Log Weight' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
