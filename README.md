# Weather Explorer App

Welcome to the Weather Explorer App, built by the CCT lads for the Cross Platform Development module (2025).

## What’s this then?
This wee app lets you:
- Search for weather by city name, or use your current location
- See the current weather, a 5-day forecast, and your search history
- Switch between Celsius and Fahrenheit
- Enjoy a tidy UI that follows your chosen theme (light, dark, or system)
- Read the latest weather news headlines

## How to run it
1. Clone the repo and `cd` into the folder.
2. Run `npm install` or `yarn` to get all the bits.
3. Start the app with `npx expo start`.
4. Scan the QR code with Expo Go, or run on web.

## Main files
- `app/(tabs)/search.tsx` – Main weather search screen
- `app/(tabs)/index.tsx` – News headlines tab
- `components/ThemeSwitcher.tsx` – Theme toggle button
- `components/ThemeContext.tsx` – Theme context provider
- `hooks/useColorScheme.ts` – Decides which theme to use
- `constants/Colors.ts` – All the colours for the app

## API Integration
- **Weather:** Uses [OpenWeatherMap](https://openweathermap.org/) for current weather and 5-day forecast. API key is hardcoded for demo purposes (replace with your own for production).
- **News:** Fetches weather news from Google News RSS via rss2json.
- **Geolocation:** Uses `expo-location` to fetch the user's current position (asks for permission).

## State Management
- Uses React's `useState` and `useEffect` for local state.
- Search history and theme preference are persisted with `AsyncStorage`.
- Theme is managed globally with React Context (`ThemeContext.tsx`), so the whole app updates when you change it.

## Design Decisions
- **Tabs:** Navigation is handled with Expo Router's Tabs, with custom icons and haptic feedback for a bit of craic.
- **Theming:** All screens and components use the theme context, so switching between light, dark, or system is instant and global.
- **Caching:** Weather data is cached for 10 minutes to avoid hammering the API and to support offline use.
- **Accessibility:** Good contrast, scalable text, and accessible labels on buttons.

## Error Handling & Offline Support
- If the user is offline, cached data is shown if available.
- All API calls are wrapped in try/catch, with friendly error messages for the user.
- If location permission is denied, the app tells you so (no silent failures).

## Running Unit Tests

This project includes a simple unit test for the `normaliseCityName` utility function, located in `utils/__tests__/normaliseCityName.test.ts`.

### How to run the test

1. Make sure you have all dev dependencies installed:
   ```sh
   npm install
   ```

2. Run the test suite using Jest:
   ```sh
   npx jest
   ```
   or
   ```sh
   npm test
   ```

3. You should see output indicating whether the test passed or failed.

### What is being tested?

The test checks that the `normaliseCityName` function:
- Capitalises single-word and multi-word city names correctly
- Trims extra spaces
- Handles empty strings gracefully

## Potential Future Improvements
- Add weather alerts and notifications
- Interactive weather maps
- Multiple saved locations
- Share weather info via social media
- Custom animations for different weather conditions
- More detailed accessibility features

## Reflections
- Building with Expo and React Native made cross-platform development a breeze.
- Managing theme globally with context keeps the code tidy and easy to maintain.
- Handling geolocation and permissions was grand with Expo, but always test on a real device!
- Caching and offline support are essential for a good user experience.

## Credits
- Built by Caio Jacob, Kevin Esteff, Matheus Leandro and Fernanda de Souza, 2025.
- Weather data from OpenWeatherMap.
- News from Google News RSS.

---



