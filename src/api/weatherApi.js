import axios from 'axios';

const API_KEY = '2ba36c87ce9a2798028325fd65a00a3a'; // <-- PASTE YOUR REAL KEY HERE
const BASE_URL = 'https://api.openweathermap.org/data/2.5';
const GEO_URL = 'https://api.openweathermap.org/geo/1.0';

// 1. Fetches the live weather data
export const fetchWeatherByCity = async (cityName) => {
  try {
    const response = await axios.get(
      `${BASE_URL}/weather?q=${cityName}&appid=${API_KEY}&units=metric`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching weather data: ", error);
    return null;
  }
};

// 2. Fetches the dropdown city suggestions as you type
export const fetchCitySuggestions = async (query) => {
  if (!query || query.length < 2) return [];
  try {
    const response = await axios.get(
      `${GEO_URL}/direct?q=${query}&limit=5&appid=${API_KEY}`
    );
    return response.data; 
  } catch (error) {
    console.error("Error fetching city suggestions: ", error);
    return [];
  }
};

// 3. Fetches the 5-day forecast
export const fetchForecastByCity = async (cityName) => {
  try {
    const response = await axios.get(
      `${BASE_URL}/forecast?q=${cityName}&appid=${API_KEY}&units=metric`
    );
    return response.data;
  } catch (error) {
    console.error("404 FAILED URL:", error.config?.url);
    return null;
  }
};