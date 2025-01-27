import React from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import Header from '../components/header/Header';
import PodcastItem from '../components/podcast/PodcastItem';

const HomeScreen = () => {
  const data = Array(10).fill({}); // Fake data

  return (
    <View style={styles.container}>
      <Header />
      <FlatList
        data={data}
        renderItem={() => <PodcastItem />}
        keyExtractor={(item, index) => index.toString()}
        contentContainerStyle={styles.list}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  list: {
    padding: 10,
  },
});

export default HomeScreen;
