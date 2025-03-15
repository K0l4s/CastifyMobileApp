import React, { useState, useEffect } from 'react';
import { View, Button, StyleSheet, TouchableOpacity, ActivityIndicator, Text, FlatList } from 'react-native';
import GenreService from '../services/genreService';
import { Genre } from '../models/PodcastModel';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useBottomSheet } from '../context/BottomSheetContext';

const CreateScreen = () => {
  const [selectedGenres, setSelectedGenres] = useState<Genre[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();
  const { showGenrePicker, hideBottomSheet } = useBottomSheet();

  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const genresData = await GenreService.getGenres();
        setGenres(genresData);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchGenres();
  }, []);

  const toggleGenre = (genre: Genre) => {
    setSelectedGenres((prev) => {
      if (prev.includes(genre)) {
        return prev.filter((g) => g !== genre);
      } else if (prev.length < 5) {
        return [...prev, genre];
      }
      return prev;
    });
  };

  const openGenrePicker = () => {
    showGenrePicker(genres, selectedGenres, toggleGenre);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <TouchableOpacity style={styles.closeButton} onPress={() => navigation.goBack()}>
        <Icon name="close" size={30} color="#000" />
      </TouchableOpacity>
      <Button title="Select Genres" onPress={openGenrePicker} />
      <FlatList
        data={selectedGenres}
        renderItem={({ item }) => (
          <View style={styles.genreItem}>
            <Text style={styles.genreText}>{item.name}</Text>
          </View>
        )}
        keyExtractor={(item) => item.id.toString()}
        numColumns={3} // Adjust the number of columns as needed
        contentContainerStyle={styles.selectedGenresContainer}
      />
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  closeButton: {
    position: 'absolute',
    top: 20,
    right: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedGenresContainer: {
    marginTop: 10,
  },
  genreItem: {
    backgroundColor: '#2169de',
    padding: 10,
    margin: 5,
    borderRadius: 20,
  },
  genreText: {
    color: 'white',
  },
});

export default CreateScreen;