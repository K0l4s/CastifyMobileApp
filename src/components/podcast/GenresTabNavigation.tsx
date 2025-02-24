import React, { useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import Icon from "react-native-vector-icons/Ionicons";

interface GenresTabNavigationProps {
  selectedTab: string;
  onSelectTab: (tab: string) => void;
  genres: { id: string; name: string }[];
  animatedStyle: any;
}

const GenresTabNavigation: React.FC<GenresTabNavigationProps> = ({ selectedTab, onSelectTab, genres, animatedStyle }) => {
  // const tabs = ["All", ...genres.map((genre) => genre.name)];
  const tabs = [{ id: 'All', name: 'All' }, ...genres];
  const scrollViewRef = useRef<ScrollView>(null);

  return (
    <Animated.View style={[styles.container, animatedStyle]}>

      <ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollView}
      >
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[
              styles.tab,
              selectedTab === tab.id ? styles.selectedTab : styles.unselectedTab,
            ]}
            onPress={() => onSelectTab(tab.id)}
          >
            <Text style={selectedTab === tab.id ? styles.selectedTabText : styles.unselectedTabText}>
              {tab.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    padding: 10,
  },
  button: {
    padding: 2,
  },
  scrollView: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 10,
    marginHorizontal: 5,
  },
  selectedTab: {
    backgroundColor: '#007bff',
  },
  unselectedTab: {
    backgroundColor: '#e0e0e0',
  },
  selectedTabText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  unselectedTabText: {
    color: '#000',
  },
});

export default GenresTabNavigation;