import React, { useEffect, useState } from 'react';
import {
  Image,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

// Define article structure to help with autocompletion and avoid VSCode errors
type Article = {
  title: string;
  description?: string;
  link?: string;
  thumbnail?: string;
};

export default function HomeScreen() {
  const [articles, setArticles] = useState<Article[]>([]);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await fetch(
          'https://api.rss2json.com/v1/api.json?rss_url=https://news.google.com/rss/search?q=weather'
        );
        const data = await response.json();
        setArticles(data.items || []);
      } catch (error) {
        console.error('Error fetching news:', error);
      }
    };

    fetchNews();
  }, []);

  return (
    <ScrollView style={styles.container}>
      {/* Header with image */}
      <View style={styles.header}>
        <Image
          source={require('../../assets/images/wheatherImage.webp')}
          style={styles.headerImage}
          resizeMode="cover"
        />
        <View style={styles.headerOverlay}>
          <Text style={styles.headerText}>🌤️ Welcome to the Weather App</Text>
        </View>
      </View>

      {/* News Section */}
      <View style={styles.newsSection}>
        <Text style={styles.sectionTitle}>📰 Weather News</Text>
        {articles.length === 0 ? (
          <Text style={{ color: '#94a3b8' }}>Loading news...</Text>
        ) : (
          articles.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.newsItem}
              onPress={() => {
                if (item.link) Linking.openURL(item.link);
              }}
            >
              {item.thumbnail && (
                <Image source={{ uri: item.thumbnail }} style={styles.thumbnail} />
              )}
              <View style={{ flex: 1 }}>
                <Text style={styles.newsTitle}>{item.title}</Text>
                <Text style={styles.newsSummary}>
                  {item.description
                    ? item.description.replace(/<[^>]+>/g, '').slice(0, 100) + '...'
                    : 'No description available.'}
                </Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  header: {
    height: 200,
    position: 'relative',
  },
  headerImage: {
    width: '100%',
    height: '100%',
  },
  headerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerText: {
    fontSize: 24,
    color: '#f1f5f9',
    fontWeight: 'bold',
    textAlign: 'center',
    paddingHorizontal: 12,
  },
  newsSection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    color: '#38bdf8',
    fontWeight: '600',
    marginBottom: 12,
  },
  newsItem: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    flexDirection: 'row',
    gap: 12,
  },
  thumbnail: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 10,
  },
  newsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#e2e8f0',
    marginBottom: 4,
  },
  newsSummary: {
    fontSize: 14,
    color: '#94a3b8',
  },
});
