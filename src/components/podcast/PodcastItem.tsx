import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

const PodcastItem = () => {
  return (
    <View style={styles.itemContainer}>
      <Image
        source={{ uri: 'https://cdn.prod.website-files.com/62d84e447b4f9e7263d31e94/6557420216a456cfaef685c0_6399a4d27711a5ad2c9bf5cd_ben-sweet-2LowviVHZ-E-unsplash-1-p-1600.jpg' }}
        style={styles.thumbnail}
      />
      <View style={styles.infoContainer}>
        <Image
          source={{ uri: 'https://i.redd.it/snoovatar/avatars/0cec69b2-0fb5-4185-b4f1-56c069511f8a.png' }}
          style={styles.avatar}
        />
        <View style={styles.textContainer}>
          <Text style={styles.title}>SPECIAL EVENT | CHRISTMAS EVE | NAUHT</Text>
          <Text style={styles.subtitle}>Nauht · 2.5M views · 2 years ago</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  itemContainer: {
    marginVertical: 10,
    backgroundColor: '#fff',
    borderRadius: 10,
    overflow: 'hidden',
    elevation: 2, // Shadow on Android
    shadowColor: '#000', // Shadow on iOS
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
  },
  thumbnail: {
    width: '100%',
    height: 200,
  },
  infoContainer: {
    flexDirection: 'row',
    padding: 10,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 5,
    color: '#333',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
});

export default PodcastItem;
