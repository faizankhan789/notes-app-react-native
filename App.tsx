import React, { useEffect } from 'react';
import { StatusBar, useColorScheme, ActivityIndicator, View, StyleSheet, LogBox } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import RNBootSplash from 'react-native-bootsplash';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { NotesProvider } from './src/context/NotesContext';
import { LoginScreen } from './src/screens/LoginScreen';
import { SignUpScreen } from './src/screens/SignUpScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { NotesListScreen } from './src/screens/NotesListScreen';
import { AddEditNoteScreen } from './src/screens/AddEditNoteScreen';

// Ignore Firebase deprecation warnings
LogBox.ignoreLogs([
  'This method is deprecated',
  'Please use `getApp()` instead',
  'Please use `onAuthStateChanged()` instead',
  'Please use `collection()` instead',
  'Please use `where()` instead',
]);



const Stack = createNativeStackNavigator();

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="SignUp" component={SignUpScreen} />
    </Stack.Navigator>
  );
}

function AppStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="NotesList"
        component={NotesListScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="AddEditNote"
        component={AddEditNoteScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}

function Navigation() {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      RNBootSplash.hide({ fade: true });
    }
  }, [loading]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {user ? <AppStack /> : <AuthStack />}
    </NavigationContainer>
  );
}

function App() {

  
  const isDarkMode = useColorScheme() === 'dark';


  return (
    <SafeAreaProvider>
      <AuthProvider>
        <NotesProvider>
          <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
          <Navigation />
        </NotesProvider>
      </AuthProvider>
    </SafeAreaProvider>

  );
}


const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});

export default App;
