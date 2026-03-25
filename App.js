import React, { useState, useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import your screens
import HomeScreen from './src/screens/HomeScreen';
import SearchScreen from './src/screens/SearchScreen';
import ForecastScreen from './src/screens/ForecastScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  const [initialRoute, setInitialRoute] = useState(null);

  useEffect(() => {
    const checkFirstTime = async () => {
      try {
        const savedCity = await AsyncStorage.getItem('savedCity');
        if (savedCity) {
          // If a city exists, go to Home
          setInitialRoute('Home');
        } else {
          // If no city (first time), go to Search
          setInitialRoute('Search');
        }
      } catch (e) {
        setInitialRoute('Search'); // Fallback
      }
    };

    checkFirstTime();
  }, []);

  // Show a loading spinner while checking storage
  if (!initialRoute) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8F9FA' }}>
        <ActivityIndicator size="large" color="#4A90E2" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={initialRoute} screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Search" component={SearchScreen} />
        <Stack.Screen name="Forecast" component={ForecastScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}