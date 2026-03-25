import React, { useRef, useEffect, useState, useCallback } from 'react';
import { 
  View, Text, TouchableOpacity, ScrollView, StyleSheet, 
  Animated, ActivityIndicator, StatusBar 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchWeatherByCity } from '../api/weatherApi';

export default function HomeScreen() {
  const navigation = useNavigation();
  const floatAnim = useRef(new Animated.Value(0)).current;
  const [weatherData, setWeatherData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const getWeatherIcon = (main) => {
    switch (main) {
      case 'Clouds': return 'cloud-sharp';
      case 'Rain': return 'rainy-sharp';
      case 'Snow': return 'snow-sharp';
      case 'Clear': return 'sunny-sharp';
      default: return 'partly-sunny-sharp';
    }
  };

  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      const loadSavedCity = async () => {
        setIsLoading(true);
        try {
          const savedCity = await AsyncStorage.getItem('savedCity');
          if (!savedCity) {
            navigation.navigate('Search');
          } else {
            const data = await fetchWeatherByCity(savedCity);
            if (isActive) setWeatherData(data);
          }
        } catch (e) {
          console.error(e);
        } finally {
          if (isActive) setIsLoading(false);
        }
      };
      loadSavedCity();
      return () => { isActive = false; };
    }, [navigation])
  );

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, { toValue: -10, duration: 2000, useNativeDriver: true }),
        Animated.timing(floatAnim, { toValue: 0, duration: 2000, useNativeDriver: true }),
      ])
    ).start();
  }, [floatAnim]);

  if (isLoading) {
    return (
      <LinearGradient colors={['#1A237E', '#3949AB']} style={[styles.container, {justifyContent: 'center'}]}>
        <ActivityIndicator size="large" color="#FFD600" />
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#1A237E', '#3949AB', '#5C6BC0']} style={styles.container}>
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={[styles.glassCard, styles.searchContainer]}
            onPress={() => navigation.navigate('Search')}
          >
            <Feather name="search" size={16} color="rgba(255,255,255,0.7)" style={styles.searchIcon} />
            <Text style={styles.searchPlaceholder}>Search new city...</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.heroSection}>
            {weatherData ? (
              <>
                <Text style={styles.cityName}>{weatherData.name}</Text>
                <Animated.View style={[styles.heroIconContainer, { transform: [{ translateY: floatAnim }] }]}>
                  <Ionicons 
                    name={getWeatherIcon(weatherData.weather[0].main)} 
                    size={140} 
                    color="#FFD600" 
                  />
                </Animated.View>
                <View style={styles.temperatureContainer}>
                  <Text style={styles.temperatureText}>{Math.round(weatherData.main.temp)}°</Text>
                  <Text style={styles.weatherDescription}>
                    {weatherData.weather[0].description}
                  </Text>
                </View>
                <View style={styles.highLowContainer}>
                  <Text style={styles.highLowText}>H: {Math.round(weatherData.main.temp_max)}°</Text>
                  <Text style={styles.highLowText}>L: {Math.round(weatherData.main.temp_min)}°</Text>
                </View>

                <View style={styles.detailsGrid}>
                  <View style={[styles.glassCard, styles.detailItem]}>
                    <Text style={styles.detailLabel}>HUMIDITY</Text>
                    <Text style={styles.detailValue}>{weatherData.main.humidity}%</Text>
                  </View>
                  <View style={[styles.glassCard, styles.detailItem]}>
                    <Text style={styles.detailLabel}>WIND</Text>
                    <Text style={styles.detailValue}>{Math.round(weatherData.wind.speed * 3.6)} km/h</Text>
                  </View>
                </View>
              </>
            ) : (
              <View style={{alignItems: 'center'}}>
                <Text style={styles.cityName}>City not found</Text>
                <TouchableOpacity onPress={() => navigation.navigate('Search')}>
                   <Text style={{color: '#FFD600'}}>Go back to search</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {weatherData && (
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={[styles.glassCard, styles.forecastButton]} onPress={() => navigation.navigate('Forecast')}>
                <Text style={styles.forecastButtonText}>View 7-Day Forecast</Text>
                <Feather name="chevron-right" size={24} color="white" />
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

// Styles remain the same as yours...
const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  glassCard: { backgroundColor: 'rgba(255, 255, 255, 0.12)', borderColor: 'rgba(255, 255, 255, 0.15)', borderWidth: 1, borderRadius: 20 },
  header: { alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24, paddingTop: 16, paddingBottom: 16, zIndex: 10 },
  searchContainer: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, width: '100%', maxWidth: 300 },
  searchIcon: { marginRight: 8 },
  searchPlaceholder: { flex: 1, color: 'rgba(255,255,255,0.7)', fontSize: 16, textAlign: 'center' },
  scrollView: { flex: 1, paddingHorizontal: 24 },
  heroSection: { alignItems: 'center', justifyContent: 'center', paddingTop: 32, paddingBottom: 48 },
  cityName: { color: '#F8F9FA', fontSize: 24, fontWeight: 'bold', letterSpacing: 1, marginBottom: 20 },
  heroIconContainer: { width: 200, height: 200, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  temperatureContainer: { alignItems: 'center' },
  temperatureText: { color: '#F8F9FA', fontSize: 96, fontWeight: '200', letterSpacing: -2 },
  weatherDescription: { color: '#F8F9FA', fontSize: 24, fontWeight: '300', opacity: 0.8, marginTop: 4, textTransform: 'capitalize' },
  highLowContainer: { flexDirection: 'row', gap: 16, marginTop: 16 },
  highLowText: { color: '#F8F9FA', fontWeight: '500', opacity: 0.9, fontSize: 16 },
  detailsGrid: { marginTop: 40, flexDirection: 'row', justifyContent: 'space-between', gap: 16 },
  detailItem: { flex: 1, padding: 16, alignItems: 'center' },
  detailLabel: { color: '#F8F9FA', opacity: 0.6, fontSize: 12, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 },
  detailValue: { color: '#F8F9FA', fontSize: 20, fontWeight: '600' },
  buttonContainer: { marginTop: 24, paddingBottom: 40, alignItems: 'center' },
  forecastButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 18, paddingHorizontal: 24, width: '100%' },
  forecastButtonText: { color: 'white', fontSize: 16, fontWeight: '600', marginRight: 10 },
});