import React, { useEffect, useState } from 'react';
import { 
  View, Text, ScrollView, StyleSheet, 
  TouchableOpacity, ActivityIndicator 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchForecastByCity } from '../api/weatherApi';

export default function ForecastScreen() {
  const navigation = useNavigation();
  const [forecast, setForecast] = useState([]);
  const [loading, setLoading] = useState(true);
  const [city, setCity] = useState('');
  const [historyData, setHistoryData] = useState([]);

  const generateHistoryData = (baseTemp) => {
    const data = [];
    let currentTemp = baseTemp;
    for (let i = 0; i < 30; i++) {
      const change = (Math.random() * 4) - 2;
      currentTemp += change;
      const percentage = Math.max(10, Math.min(90, (currentTemp / 40) * 100));
      data.push(percentage);
    }
    return data;
  };

useEffect(() => {
    const getForecastData = async () => {
      try {
        // 1. Retrieve the city name from local storage
        const savedCity = await AsyncStorage.getItem('savedCity');

        if (!savedCity) {
          // If no city is saved, redirect back to search
          navigation.navigate('Search');
          return;
        }

        setCity(savedCity);

        // 2. Call the OpenWeather API (from your weatherApi.js)
        const data = await fetchForecastByCity(savedCity);

        // 3. Check if the response is valid and contains the forecast list
        if (data && data.list && data.list.length > 0) {
          
          // Filter logic: Get one forecast entry per day (filtering for midday)
          let dailyData = data.list.filter(item => item.dt_txt.includes("12:00:00"));

          // Fallback: If the API doesn't have a 12:00 PM entry (rare), 
          // just take 5 unique entries so the screen isn't empty.
          if (dailyData.length === 0) {
            dailyData = data.list.slice(0, 5);
          }

          setForecast(dailyData);

          // 4. Generate the 30-day "fake" history trend using the current temp as a baseline
          if (dailyData.length > 0) {
            const currentBaseTemp = dailyData[0].main.temp;
            const historyTrend = generateHistoryData(currentBaseTemp);
            setHistoryData(historyTrend);
          }
          
        } else {
          // Handle 404 or invalid city name cases
          alert(`City "${savedCity}" not found. Please try a more specific name.`);
          navigation.goBack();
        }

      } catch (error) {
        console.error("Error in getForecastData:", error);
        alert("An unexpected error occurred. Please check your connection.");
      } finally {
        // Stop the loading spinner regardless of success or failure
        setLoading(false);
      }
    };

    getForecastData();
  }, [navigation]); // Added navigation to the dependency array for best practice
  const getDayName = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  };

  const getWeatherEmoji = (main) => {
    switch (main) {
      case 'Clear': return '☀️';
      case 'Clouds': return '☁️';
      case 'Rain': return '🌧️';
      case 'Snow': return '❄️';
      default: return '⛅';
    }
  };

  if (loading) {
    return (
      <LinearGradient colors={['#a5f3fc', '#93c5fd']} style={[styles.container, { justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color="#2C3E50" />
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#a5f3fc', '#93c5fd']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Feather name="arrow-left" size={24} color="#2C3E50" />
          </TouchableOpacity>
          <Text style={styles.headerCity}>{city}</Text>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>5-Day Forecast</Text>
            <View style={styles.glassCard}>
              {forecast.map((item, index) => (
                <View key={index} style={[styles.forecastRow, index === forecast.length - 1 && styles.lastRow]}>
                  <Text style={styles.dayText}>{index === 0 ? 'Today' : getDayName(item.dt_txt)}</Text>
                  <View style={styles.iconContainer}>
                    <Text style={styles.emojiIcon}>{getWeatherEmoji(item.weather[0].main)}</Text>
                  </View>
                  <View style={styles.temperatureData}>
                    <Text style={styles.minTemp}>{Math.round(item.main.temp_min)}°</Text>
                    <View style={styles.tempBarBg}>
                      <LinearGradient
                        colors={['#3b82f6', '#f59e0b']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={[styles.tempBarFill, { left: '20%', width: '60%' }]}
                      />
                    </View>
                    <Text style={styles.maxTemp}>{Math.round(item.main.temp_max)}°</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Past 30-Day History</Text>
            <View style={[styles.glassCard, styles.chartCard]}>
              <Text style={styles.chartLabel}>TEMPERATURE TRENDS (°C)</Text>
              <View style={styles.mockChartContainer}>
                {historyData.map((height, index) => (
                  <View key={index} style={styles.chartColumn}>
                    <LinearGradient
                      colors={['rgba(59, 130, 246, 0.6)', 'rgba(59, 130, 246, 0.1)']}
                      style={[styles.chartBar, { height: `${height}%` }]}
                    />
                  </View>
                ))}
              </View>
              <View style={styles.chartLabelsContainer}>
                <Text style={styles.axisLabel}>30 Days Ago</Text>
                <Text style={styles.axisLabel}>15 Days Ago</Text>
                <Text style={styles.axisLabel}>Today</Text>
              </View>
            </View>
          </View>

        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },
  headerCity: { flex: 1, textAlign: 'center', fontSize: 18, fontWeight: 'bold', color: '#2C3E50', marginRight: 40 },
  backButton: { padding: 8, borderRadius: 50, backgroundColor: 'rgba(255,255,255,0.3)' },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40, alignItems: 'center' },
  sectionContainer: { width: '100%', maxWidth: 400, marginBottom: 32, marginTop: 16 },
  sectionTitle: { fontSize: 24, fontWeight: 'bold', color: '#2C3E50', textAlign: 'center', marginBottom: 16 },
  glassCard: { backgroundColor: 'rgba(255, 255, 255, 0.2)', borderColor: 'rgba(255, 255, 255, 0.3)', borderWidth: 1, borderRadius: 20, padding: 16 },
  forecastRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(255, 255, 255, 0.2)' },
  lastRow: { borderBottomWidth: 0 },
  dayText: { width: 60, fontSize: 16, fontWeight: '500', color: '#334155' },
  iconContainer: { flexDirection: 'row', alignItems: 'center', marginRight: 8 },
  emojiIcon: { fontSize: 22 },
  temperatureData: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 12 },
  minTemp: { fontSize: 14, fontWeight: '600', color: '#475569', width: 28, textAlign: 'right' },
  tempBarBg: { width: 80, height: 4, backgroundColor: 'rgba(0, 0, 0, 0.1)', borderRadius: 2 },
  tempBarFill: { position: 'absolute', height: 4, borderRadius: 2 },
  maxTemp: { fontSize: 14, fontWeight: '600', color: '#1e293b', width: 28 },
  chartCard: { height: 256, justifyContent: 'center', position: 'relative', overflow: 'hidden' },
  chartLabel: { position: 'absolute', top: 16, left: 24, fontSize: 10, fontWeight: 'bold', color: '#475569', letterSpacing: 1 },
  mockChartContainer: { flex: 1, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', paddingHorizontal: 8, marginTop: 40, marginBottom: 8 },
  chartColumn: { flex: 1, alignItems: 'center', justifyContent: 'flex-end', height: '100%', marginHorizontal: 2 },
  chartBar: { width: '100%', borderTopLeftRadius: 4, borderTopRightRadius: 4 },
  chartLabelsContainer: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 8, marginTop: 8 },
  axisLabel: { fontSize: 10, fontWeight: '500', color: '#475569' },
});