import React, { useState } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, FlatList, KeyboardAvoidingView, Platform
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchCitySuggestions } from '../api/weatherApi';

export default function SearchScreen() {
  const navigation = useNavigation();
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);

  const handleTyping = async (text) => {
    setQuery(text);
    if (text.length > 2) {
      const results = await fetchCitySuggestions(text);
      setSuggestions(results);
    } else {
      setSuggestions([]);
    }
  };

  const saveAndGoHome = async (cityName) => {
    try {
      await AsyncStorage.setItem('savedCity', cityName);
      // Replace the current screen with Home so we don't stack multiple Home screens
      navigation.replace('Home'); 
    } catch (e) {
      console.error(e);
    }
  };

  const handleSearchButton = () => {
    if (query.trim().length > 0) {
      saveAndGoHome(query.trim());
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        {/* Only show back button if there is a screen to go back to */}
        {navigation.canGoBack() ? (
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Feather name="arrow-left" size={24} color="#2C3E50" />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 40 }} /> // Placeholder to keep title centered
        )}
        
        <Text style={styles.headerTitle}>Search City</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.searchSection}
      >
        <View style={styles.searchContainer}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="Type city name (e.g. London)"
              placeholderTextColor="#9CA3AF"
              value={query}
              onChangeText={handleTyping}
              autoFocus={true}
            />
          </View>

          {suggestions.length > 0 && (
            <View style={styles.dropdownMenu}>
              <FlatList
                data={suggestions}
                keyExtractor={(item, index) => index.toString()}
                keyboardShouldPersistTaps="handled"
                renderItem={({ item }) => (
                  <TouchableOpacity 
                    style={styles.dropdownItem}
                    onPress={() => saveAndGoHome(item.name)}
                  >
                    <Feather name="map-pin" size={16} color="#4A90E2" style={{ marginRight: 10 }} />
                    <Text style={styles.dropdownText}>
                      {item.name}{item.state ? `, ${item.state}` : ''}, {item.country}
                    </Text>
                  </TouchableOpacity>
                )}
              />
            </View>
          )}

          <TouchableOpacity style={styles.searchButton} onPress={handleSearchButton}>
            <Text style={styles.searchButtonText}>Show Weather</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8F9FA' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 24 },
  backButton: { padding: 8, backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: 50 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#2C3E50' },
  searchSection: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: 100 },
  searchContainer: { width: '90%', maxWidth: 400, position: 'relative' },
  inputWrapper: { marginBottom: 16 },
  input: { 
    width: '100%', 
    paddingHorizontal: 20, 
    paddingVertical: 16, 
    borderRadius: 16, 
    borderWidth: 2, 
    borderColor: '#4A90E2', 
    backgroundColor: '#FFFFFF', 
    color: '#2C3E50', 
    fontSize: 18 
  },
  dropdownMenu: { 
    position: 'absolute', 
    top: 75, 
    left: 0, 
    right: 0, 
    backgroundColor: 'white', 
    borderRadius: 16, 
    elevation: 5, 
    maxHeight: 200, 
    zIndex: 20,
    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)' 
  },
  dropdownItem: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  dropdownText: { fontSize: 16, color: '#2C3E50' },
  searchButton: { 
    width: '100%', 
    paddingVertical: 16, 
    backgroundColor: '#4A90E2', 
    borderRadius: 16, 
    alignItems: 'center',
    elevation: 3,
    boxShadow: '0px 4px 8px rgba(74, 144, 226, 0.3)'
  },
  searchButtonText: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' },
});