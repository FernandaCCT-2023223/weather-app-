/**
 * SearchScreen
 * -------------
 * This is the main weather search screen for the app.
 * Here you can search for weather by city name, or use your current location.
 * It shows the current weather, a 5-day forecast, and keeps a wee history of your searches.
 * You can also clear your search history, and switch between Celsius and Fahrenheit.
 * All the UI follows the app's theme (light/dark/system).
 * 
 */

import { ThemeSwitcher } from '@/components/ThemeSwitcher';
import { ThemedText } from '@/components/ThemedText';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import * as Location from 'expo-location';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator, Animated, FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View
} from 'react-native';

/**
 * Normalises a city name so it looks tidy.
 * E.g. "dublin" becomes "Dublin", "new york" becomes "New York".
 */
function normaliseCityName(name: string) {
  return name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export default function SearchScreen() {
  const { width } = useWindowDimensions();

  // State for city input, units, weather data, loading, error, history, forecast, etc.
  const [city, setCity] = useState('');
  const [unit, setUnit] = useState<'metric' | 'imperial'>('metric');
  const [weather, setWeather] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [forecast, setForecast] = useState<any[]>([]);
  const [fromCache, setFromCache] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const weatherOpacity = useState(new Animated.Value(0))[0];

  // On mount, load search history from storage
  useEffect(() => {
    AsyncStorage.getItem('searchHistory').then(data => {
      if (data) setHistory(JSON.parse(data));
    });
  }, []);

  // Listen for network changes
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOffline(!state.isConnected);
    });
    return () => unsubscribe();
  }, []);

  const buttonText = '#f8fafc';
  const buttonActive = '#22c55e'; 

  /**
   * Fetches weather and forecast for a given city.
   * Uses cache if available and recent.
   */
  const fetchWeather = async (cityName: string, units = unit) => {
    setLoading(true);
    setError('');
    setWeather(null);
    setForecast([]);
    setFromCache(false);

    const normalisedCity = normaliseCityName(cityName);
    const cacheKey = `weather-${normalisedCity}-${units}`;
    const cacheTimestampKey = `weather-timestamp-${normalisedCity}-${units}`;

    try {
      const cachedData = await AsyncStorage.getItem(cacheKey);
      const cachedTimestamp = await AsyncStorage.getItem(cacheTimestampKey);

      const now = Date.now();
      const cacheAge = cachedTimestamp ? now - parseInt(cachedTimestamp) : Infinity;
      const maxAge = 30 * 60 * 1000; // 30 minutos

      if (cachedData && cacheAge < maxAge) {
        const parsed = JSON.parse(cachedData);
        setWeather(parsed.weather);
        setForecast(parsed.forecast);
        setFromCache(true);
        return;
      }

      const apiKey = '175890de4b6acd7fd24e63f41dc2cf6b';

      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(cityName)}&appid=${apiKey}&units=${units}`
      );
      if (!response.ok) throw new Error('City not found.');
      const data = await response.json();

      const forecastRes = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(cityName)}&appid=${apiKey}&units=${units}`
      );
      if (!forecastRes.ok) throw new Error('Could not fetch forecast.');
      const forecastData = await forecastRes.json();

      const daily: Record<string, any[]> = {};
      forecastData.list.forEach((item: any) => {
        const date = new Date(item.dt * 1000).toLocaleDateString('en-IE');
        if (!daily[date]) daily[date] = [];
        daily[date].push(item);
      });

      const dailyForecast = Object.entries(daily).slice(0, 5).map(([date, items]) => {
        const temps = items.map((i: any) => i.main.temp);
        const min = Math.min(...temps);
        const max = Math.max(...temps);
        const iconItem = items[Math.floor(items.length / 2)] || items[0];
        return {
          date,
          min,
          max,
          icon: iconItem.weather[0].icon,
          main: iconItem.weather[0].main,
        };
      });

      weatherOpacity.setValue(0);
      setWeather(data);
      Animated.timing(weatherOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
      
      setForecast(dailyForecast);

      const cachePayload = {
        weather: data,
        forecast: dailyForecast,
      };
      await AsyncStorage.setItem(cacheKey, JSON.stringify(cachePayload));
      await AsyncStorage.setItem(cacheTimestampKey, now.toString());
    } catch (err: any) {
      setError(err.message || 'Failed to fetch weather.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Fetches weather and forecast for the user's current location.
   * Asks for location permission.
   */
  const fetchWeatherByLocation = async () => {
    setError('');
    setLoading(true);
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('Permission to access location was denied');
        setLoading(false);
        return;
      }
      let location = await Location.getCurrentPositionAsync({});
      const lat = location.coords.latitude;
      const lon = location.coords.longitude;

      const apiKey = '175890de4b6acd7fd24e63f41dc2cf6b';
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=${unit}`
      );
      if (!response.ok) throw new Error('Could not fetch weather for your location.');
      const data = await response.json();
      setWeather(data);

      // Fetch forecast
      const forecastRes = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=${unit}`
      );
      if (!forecastRes.ok) throw new Error('Could not fetch forecast for your location.');
      const forecastData = await forecastRes.json();

      // Agrupe e processe o forecast igual ao fetchWeather
      const daily: Record<string, any[]> = {};
      forecastData.list.forEach((item: any) => {
        const date = new Date(item.dt * 1000).toLocaleDateString('en-IE');
        if (!daily[date]) daily[date] = [];
        daily[date].push(item);
      });
      const dailyForecast = Object.entries(daily).slice(0, 5).map(([date, items]) => {
        const temps = items.map((i: any) => i.main.temp);
        const min = Math.min(...temps);
        const max = Math.max(...temps);
        const iconItem = items[Math.floor(items.length / 2)] || items[0];
        return {
          date,
          min,
          max,
          icon: iconItem.weather[0].icon,
          main: iconItem.weather[0].main,
        };
      });
      setForecast(dailyForecast);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch weather by location.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handles search button press.
   * Adds city to history if successful.
   */
  const handleSearch = async () => {
    if (!city.trim()) return setError('Please enter a city name.');
    const normalisedCity = normaliseCityName(city);
    await fetchWeather(normalisedCity);
  
    // Só adiciona ao histórico se encontrou a cidade
    if (!error && weather) {
      const newHistory = [normalisedCity, ...history.filter(c => c.toLowerCase() !== normalisedCity.toLowerCase())];
      setHistory(newHistory);
      await AsyncStorage.setItem('searchHistory', JSON.stringify(newHistory));
    }
  
    setCity('');
  };

  /**
   * Clears the search history.
   */
  const clearHistory = async () => {
    setHistory([]);
    await AsyncStorage.removeItem('searchHistory');
  };

  /**
   * Handles tap on a previous search.
   * Searches for that city again.
   */
  const handleHistoryPress = (item: string) => {
    setCity(item);
    handleSearch();
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollWrapper} keyboardShouldPersistTaps="handled">
        <ThemeSwitcher />
        <View style={styles.panel}>
          <Text style={styles.title}>🌤️ Weather App</Text>
          <Text style={styles.notice}>Enter a city to get current weather and a 5-day forecast</Text>

          <TextInput
            value={city}
            onChangeText={setCity}
            placeholder="Type a city name..."
            placeholderTextColor="#94a3b8"
            style={styles.input}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />

          <TouchableOpacity style={styles.searchBtn} onPress={handleSearch}>
            <Text style={styles.searchBtnText}>🔍 Search</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={fetchWeatherByLocation}
            style={[styles.actionButton, { backgroundColor: buttonActive }]}
          >
            <ThemedText style={{ color: buttonText, fontWeight: 'bold' }}>
              📍 Use Current Location
            </ThemedText>
          </TouchableOpacity>

          {error && <Text style={styles.error}>{error}</Text>}

          <TouchableOpacity onPress={clearHistory} style={styles.clearBtn}>
            <Text style={styles.clearBtnText}> 🗑️ Clear History</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              const newUnit = unit === 'metric' ? 'imperial' : 'metric';
              setUnit(newUnit);
              if (weather) fetchWeather(weather.name, newUnit);
            }}
            style={styles.unitBtn}
          >
            <Text style={styles.unitBtnText}>{unit === 'metric' ? 'Show in \u00B0F' : 'Show in \u00B0C'}</Text>
          </TouchableOpacity>
        </View>

        {loading && <ActivityIndicator size="large" color="#2563eb" style={styles.loading} />}

        {isOffline && (
            <Text style={{ color: '#fbbf24', fontWeight: '600', marginBottom: 12 }}>
              ⚠️ You are offline. Displaying saved weather info.
          </Text>
        )}
        {weather && (
          <Animated.View style={[styles.weatherBox, {opacity: weatherOpacity }]}>
            <Text style={styles.weatherCity}>{weather.name}, {weather.sys?.country}</Text>
            <Text style={styles.weatherDate}>{new Date(weather.dt * 1000).toLocaleString()}</Text>
            <Image
              source={{ uri: `https://openweathermap.org/img/wn/${weather.weather[0].icon}@4x.png` }}
              style={{ width: 100, height: 100, marginBottom: 10 }}
            />
            <Text style={styles.temp}>{Math.round(weather.main.temp)}° {unit === 'metric' ? 'C' : 'F'}</Text>
          </Animated.View>
        )}

        {forecast.length > 0 && (
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={forecast}
            keyExtractor={(_, index) => index.toString()}
            contentContainerStyle={{ paddingHorizontal: 8, justifyContent: 'center', alignItems: 'center', gap: 12 }}
            renderItem={({ item }) => (
              <View style={styles.forecastCard}>
                <Text style={styles.forecastDate}>{item.date}</Text>
                <Image
                  source={{ uri: `https://openweathermap.org/img/wn/${item.icon}@2x.png` }}
                  style={{ width: 50, height: 50, marginVertical: 6 }}
                />
                <Text style={styles.forecastMain}>{item.main}</Text>
                <Text style={styles.forecastTemp}>{Math.round(item.min)}° {Math.round(item.max)}°</Text>
              </View>
            )}
          />
        )}

        {history.length > 0 && (
          <View style={styles.historyWrapper}>
            <Text style={styles.historyTitle}>🕓 Previous Searches.</Text>
            {history.map((item, index) => (
              <TouchableOpacity key={index} onPress={() => handleHistoryPress(item)} style={styles.historyItem}>
                <Text>{item}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1e293b' },
  scrollWrapper: { paddingTop: 40, paddingHorizontal: 16, paddingBottom: 32 },
  panel: {
    backgroundColor: '#475569',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 5,
  },
  title: { fontSize: 28, fontWeight: 'bold', color: '#1e3a8a', marginBottom: 4 },
  notice: { fontSize: 14, color: '#64748b', marginBottom: 16 },
  input: {
    backgroundColor: '#f8fafc',
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    color: '#0f172a',
    marginBottom: 12,
  },
  searchBtn: { backgroundColor: '#2563eb', paddingVertical: 12, borderRadius: 10, alignItems: 'center', marginBottom: 10 },
  searchBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  clearBtn: { backgroundColor: '#475569', paddingVertical: 10, borderRadius: 10, alignItems: 'center', marginBottom: 10 },
  clearBtnText: { color: '#f1f5f9', fontWeight: '500' },
  unitBtn: { backgroundColor: '#cbd5e1', paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
  unitBtnText: { color: '#1e293b', fontWeight: '500' },
  loading: { marginVertical: 20 },
  weatherBox: {
    backgroundColor: '#64748b',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
    elevation: 4,
  },
  weatherCity: { fontSize: 22, fontWeight: '600', color: '#1e3a8a' },
  weatherDate: { color: '#475569', marginBottom: 6 },
  temp: { fontSize: 40, fontWeight: 'bold', color: '#0f172a' },
  forecastCard: {
    backgroundColor: '#334155',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginRight: 12,
    elevation: 2,
    width: 120,
    justifyContent: 'center',
    marginVertical: 10,
  },
  forecastDate: { fontSize: 12, color: '#64748b', marginBottom: 4 },
  forecastMain: { color: '#1e3a8a', fontWeight: '500', marginBottom: 4 },
  forecastTemp: { color: '#0f172a', fontWeight: '600' },
  error: { color: '#dc2626', textAlign: 'center', marginBottom: 12, fontWeight: '600' },
  historyWrapper: {
    marginTop: 24,
    backgroundColor: '#334155',
    borderRadius: 12,
    padding: 16,
    elevation: 2,
  },
  historyTitle: { fontSize: 16, fontWeight: '600', color: '#1e3a8a', marginBottom: 8 },
  historyItem: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#475569',
    borderRadius: 8,
    marginBottom: 6,
  },
  actionButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
});