import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { Genre } from '../../models/PodcastModel';
import { ScrollView } from 'react-native-gesture-handler';
import Icon from 'react-native-vector-icons/Ionicons';

interface GenrePickerBottomSheetProps {
  sheetRef: React.RefObject<BottomSheet>;
  genres: Genre[];
  selectedGenres: Genre[];
  toggleGenre: (genre: Genre) => void;
  isVisible: boolean;
  onClose: () => void;
}

const GenrePickerBottomSheet: React.FC<GenrePickerBottomSheetProps> = ({
  sheetRef,
  genres,
  selectedGenres: initialSelectedGenres,
  toggleGenre,
  isVisible,
  onClose,
}) => {
  const [selectedGenres, setSelectedGenres] = useState<Genre[]>(initialSelectedGenres);
  const snapPoints = ['100%'];

  useEffect(() => {
    if (isVisible) {
      sheetRef.current?.expand();
    } else {
      sheetRef.current?.close();
    }
  }, [isVisible]);

  useEffect(() => {
    setSelectedGenres(initialSelectedGenres);
  }, [initialSelectedGenres]);

  const handleToggleGenre = (genre: Genre) => {
    if (selectedGenres.includes(genre)) {
      setSelectedGenres(selectedGenres.filter(g => g.id !== genre.id));
    } else if (selectedGenres.length < 5) {
      setSelectedGenres([...selectedGenres, genre]);
    }
    toggleGenre(genre);
  };

  const sheetTitleText = `Select Genres (${selectedGenres.length}/5)`;
  return (
    <BottomSheet
      ref={sheetRef}
      index={isVisible ? 0 : -1}
      snapPoints={snapPoints}
      enablePanDownToClose={true}
      onClose={onClose}
    >
      <BottomSheetView style={styles.contentContainer}>
        <Text style={styles.sheetTitle}>{sheetTitleText}</Text>
        <Text style={styles.sheetDesc}>Please select at least 1 genre and maximum 5 genres</Text>
        <ScrollView contentContainerStyle={styles.scrollContainer} >
          {genres.map((genre) => (
            <TouchableOpacity
              key={genre.id}
              style={[
                styles.genreItem,
                selectedGenres.includes(genre) && styles.selectedGenre,
              ]}
              onPress={() => handleToggleGenre(genre)}
            >
              <Text style={selectedGenres.includes(genre) ? styles.selectedGenreText : styles.genreText}>
                {genre.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
          <Text style={{ fontSize: 16, color: 'blue', marginEnd: 20 }}>
            Done
          </Text>
        </TouchableOpacity>
      </BottomSheetView>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    position: 'relative',
    padding: 16,
    backgroundColor: 'white',
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  sheetDesc: {
    fontSize: 12,
    marginBottom: 10,
  },
  scrollContainer: {
    paddingBottom: 20,
  },
  genreItem: {
    marginBottom: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 20,
  },
  selectedGenre: {
    backgroundColor: '#2169de',
  },
  genreText: {
    color: 'black',
  },
  selectedGenreText: {
    color: 'white',
  },
  closeBtn: {
    position: 'absolute',
    top: 0,
    right: 0,
    padding: 0,
  }
});

export default GenrePickerBottomSheet;