import React, { useRef } from 'react';
import { View, StyleSheet, Animated, FlatList } from 'react-native';
import Header from '../components/header/Header';
import PodcastItem from '../components/podcast/PodcastItem';

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);
const HomeScreen = () => {
  const data = Array(10).fill({}); // Fake data

  const scrollY = useRef(new Animated.Value(0)).current;
  const lastScrollY = useRef(0);
  const scrollDirection = useRef<'up' | 'down'>('down');

  // Header appearance animation
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
    outputRange: [1, 0], // Header sẽ mờ dần khi cuộn xuống
    extrapolate: 'clamp',
  });

  const animatedStyle = {
    transform: [{ translateY }],
    opacity
  };

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.headerContainer, animatedStyle]}>
        <Header />
      </Animated.View>

      <AnimatedFlatList
        data={data}
        renderItem={() => <PodcastItem />}
        keyExtractor={(item, index) => index.toString()}
        contentContainerStyle={styles.list}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
      />
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
    elevation: 5, // cast shadow
  },
  list: {
    paddingTop: 60,
    paddingHorizontal: 10,
  },
});

export default HomeScreen;
