import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Animated, FlatList, ActivityIndicator } from 'react-native';
import Header from '../components/header/Header';
import PodcastItem from '../components/podcast/PodcastItem';
import { Podcast } from '../models/PodcastModel';
import PodcastService from '../services/podcastService';
import GenreService from '../services/genreService';
import GenresTabNavigation from '../components/podcast/GenresTabNavigation';

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);

const HomeScreen = () => {
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [genres, setGenres] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedTab, setSelectedTab] = useState('All');

  const scrollY = useRef(new Animated.Value(0)).current;
  const lastScrollY = useRef(0);
  const scrollDirection = useRef<'up' | 'down'>('down');

  const fetchPodcasts = async (page: number, genreId?: string) => {
    try {
      if (page === 0) setLoading(true);
      const response =
        genreId && genreId !== 'All'
          ? await PodcastService.getPodcastsByGenre(genreId, page, 10)
          : await PodcastService.getRecentPodcasts(page, 10);

      setPodcasts((prev) => (page === 0 ? response.content : [...prev, ...response.content]));
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error('Error retrieving podcasts from server', error);
    } finally {
      setLoading(false);
      setIsFetchingMore(false);
    }
  };

  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const response = await GenreService.getGenres();
        setGenres(response);
      } catch (error) {
        console.error('Error retrieving genres from server', error);
      }
    };
    fetchGenres();
  }, []);

  useEffect(() => {
    fetchPodcasts(page, selectedTab);
  }, [page, selectedTab]);

  const handleLoadMore = () => {
    if (!isFetchingMore && page < totalPages - 1) {
      setIsFetchingMore(true);
      setPage((prevPage) => prevPage + 1);
    }
  };

  const handleTabSelect = (selectedGenreId: string) => {
    setSelectedTab(selectedGenreId);
    setPodcasts([]);
    setPage(0);
    fetchPodcasts(0, selectedGenreId);
  };

  scrollY.addListener(({ value }) => {
    if (value > lastScrollY.current) {
      scrollDirection.current = 'down';
    } else {
      scrollDirection.current = 'up';
    }
    lastScrollY.current = value;
  });

  const translateY = scrollY.interpolate({
    inputRange: [0, 50],
    outputRange: [0, -60],
    extrapolate: 'clamp',
  });

  const opacity = scrollY.interpolate({
    inputRange: [0, 50],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const animatedStyle = {
    transform: [{ translateY }],
    opacity,
  };

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.headerContainer, animatedStyle]}>
        <Header 
          selectedTab={selectedTab}
          onSelectTab={(genreId) => handleTabSelect(genreId)}
          genres={genres}
          animatedStyle={animatedStyle}
        />
      </Animated.View>

      {loading ? (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      ) : (
        <>
          <AnimatedFlatList
            data={podcasts}
            renderItem={({ item }) => <PodcastItem podcast={item as Podcast} />}
            keyExtractor={(item) => (item as Podcast).id}
            contentContainerStyle={styles.list}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { y: scrollY } } }],
              { useNativeDriver: true }
            )}
            scrollEventThrottle={16}
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.5}
            ListFooterComponent={isFetchingMore ? <ActivityIndicator size="small" color="#0000ff" /> : null}
          />
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  headerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    backgroundColor: '#fff',
    elevation: 5,
  },
  list: {
    paddingTop: 115,
    paddingHorizontal: 10,
  },
  genresTab: {
    marginTop: 60,
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default HomeScreen;