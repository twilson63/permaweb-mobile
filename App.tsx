import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAppStore } from './store/AppStore';

// Screens
import { AuthScreen } from './screens/AuthScreen';
import { HomeScreen } from './screens/HomeScreen';
import { SessionScreen } from './screens/SessionScreen';
import { FilesScreen } from './screens/FilesScreen';
import { SettingsScreen } from './screens/SettingsScreen';

// Types
type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  Session: { podId: string };
};

type MainTabParamList = {
  Home: undefined;
  Files: undefined;
  Settings: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

// Tab Navigator
function MainTabs() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Files" component={FilesScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

// Main App
export default function App() {
  const isAuthenticated = useAppStore((state) => state.isAuthenticated);

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {!isAuthenticated ? (
          <Stack.Screen 
            name="Auth" 
            component={AuthScreen}
            options={{ headerShown: false }}
          />
        ) : (
          <>
            <Stack.Screen 
              name="Main" 
              component={MainTabs}
              options={{ headerShown: false }}
            />
            <Stack.Screen 
              name="Session" 
              component={SessionScreen}
              options={{ title: 'Coding Session' }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}