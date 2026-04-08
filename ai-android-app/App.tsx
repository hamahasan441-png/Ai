import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import ChatScreen from './src/screens/ChatScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import ModulesScreen from './src/screens/ModulesScreen';
import AboutScreen from './src/screens/AboutScreen';

export type RootStackParamList = {
  Chat: undefined;
  Settings: undefined;
  Modules: undefined;
  About: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaProvider>
        <NavigationContainer
          theme={{
            dark: true,
            colors: {
              primary: '#6c63ff',
              background: '#1a1a2e',
              card: '#16213e',
              text: '#e8e8e8',
              border: '#2a2a4a',
              notification: '#6c63ff',
            },
          }}
        >
          <Stack.Navigator
            initialRouteName="Chat"
            screenOptions={{
              headerStyle: {
                backgroundColor: '#16213e',
              },
              headerTintColor: '#e8e8e8',
              headerTitleStyle: {
                fontWeight: 'bold',
              },
              animation: 'slide_from_right',
            }}
          >
            <Stack.Screen
              name="Chat"
              component={ChatScreen}
              options={{
                title: '🤖 AI Assistant',
                headerTitleAlign: 'center',
              }}
            />
            <Stack.Screen
              name="Settings"
              component={SettingsScreen}
              options={{ title: '⚙️ Settings' }}
            />
            <Stack.Screen
              name="Modules"
              component={ModulesScreen}
              options={{ title: '🧩 AI Modules' }}
            />
            <Stack.Screen
              name="About"
              component={AboutScreen}
              options={{ title: 'ℹ️ About' }}
            />
          </Stack.Navigator>
        </NavigationContainer>
        <StatusBar style="light" />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
