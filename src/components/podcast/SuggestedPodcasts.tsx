import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Podcast } from '../../models/PodcastModel';
import PodcastService from '../../services/podcastService';
import GenreService from '../../services/genreService';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootParamList } from '../../type/navigationType';
import SuggestedItem from './SuggestedItem';
import { ScrollView } from 'react-native-gesture-handler';

interface SuggestedPodcastsProps {
  genreIds: string[];
  currentPodcastId: string;
}

const SuggestedPodcasts: React.FC<SuggestedPodcastsProps> = ({ genreIds, currentPodcastId }) => {
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [genreNames, setGenreNames] = useState<string[]>([]);

  const navigation = useNavigation<StackNavigationProp<RootParamList, 'Podcast'>>();

  const handlePodcastSelect = (podcast: Podcast) => {
    navigation.replace('Podcast', {
      podcast, // Pass the selected podcast
    });
  };

  // Fetch genre names
  const fetchGenreNames = async () => {
    try {
      const genres = await GenreService.getGenresByList(genreIds); // Fetch genres
      const names = genres.map((genre: { id: string; name: string }) => genre.name); // Extract names
      setGenreNames(names); // Set genre names
    } catch (error) {
      console.error('Error fetching genre names:', error);
    }
  };

  // Fetch suggested podcasts
  const fetchSuggestedPodcasts = async (reset = false) => {
    if (!hasMore && !reset) return;

    try {
      if (reset) {
        setLoading(true);
        setPage(0);
        setHasMore(true);
      } else {
        setLoadingMore(true);
      }

      const response = await PodcastService.getSuggestedPodcastsByGenres(
        currentPodcastId,
        selectedGenre ? [selectedGenre] : genreIds,
        reset ? 0 : page,
        5
      );

      setPodcasts((prev) => {
        const newPodcasts = response.content.filter(
          (podcast) => podcast.id !== currentPodcastId && !prev.some((p) => p.id === podcast.id)
        );
        return reset ? newPodcasts : [...prev, ...newPodcasts];
      });

      setHasMore(response.content.length > 0);
      setPage((prev) => prev + 1);
    } catch (error) {
      console.error('Error fetching suggested podcasts:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchGenreNames();
    fetchSuggestedPodcasts(true);
  }, [selectedGenre, genreIds]);

  const handleGenreSelect = (genreId: string) => {
    setSelectedGenre((prev) => (prev === genreId ? null : genreId)); // Toggle genre selection
  };

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={styles.loadingMoreContainer}>
        <ActivityIndicator size="small" color="#000" />
      </View>
    );
  };

  if (loading && page === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  if (podcasts.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No suggested podcasts available.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Suggested Podcasts</Text>

      {/* Genre Buttons */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.genreContainer}>
          {genreNames.map((genreName, index) => (
            <TouchableOpacity
              key={genreIds[index]}
              style={[
                styles.genreButton,
                selectedGenre === genreIds[index] && styles.genreButtonSelected,
              ]}
              onPress={() => handleGenreSelect(genreIds[index])}
            >
              <Text
                style={[
                  styles.genreButtonText,
                  selectedGenre === genreIds[index] && styles.genreButtonTextSelected,
                ]}
              >
                {genreName}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Podcast List */}
      <FlatList
        data={podcasts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => handlePodcastSelect(item)}>
            <SuggestedItem podcast={item} />
          </TouchableOpacity>
        )}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        ItemSeparatorComponent={() => <View style={styles.itemSeparator} />}
        onEndReached={() => fetchSuggestedPodcasts()}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    paddingHorizontal: 15,
  },
  header: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  genreContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 0,
  },
  genreButton: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    marginRight: 10,
    marginBottom: 10,
  },
  genreButtonSelected: {
    backgroundColor: '#007BFF',
  },
  genreButtonText: {
    fontSize: 14,
    color: '#333',
  },
  genreButtonTextSelected: {
    color: '#fff',
    fontWeight: 'bold',
  },
  listContainer: {
    paddingHorizontal: 5,
  },
  itemSeparator: {
    width: 10,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    color: '#666',
    fontSize: 14,
  },
  loadingMoreContainer: {
    padding: 10,
    alignItems: 'center',
  },
});

export default SuggestedPodcasts;