import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootParamList } from '../type/navigationType';
import Icon from 'react-native-vector-icons/Ionicons';
import Video from 'react-native-video';

type PodcastScreenRouteProp = RouteProp<RootParamList, 'Podcast'>;
type PodcastScreenNavigationProp = StackNavigationProp<RootParamList, 'Podcast'>;

const PodcastScreen: React.FC = () => {
  const route = useRoute<PodcastScreenRouteProp>();
  const navigation = useNavigation<PodcastScreenNavigationProp>();
  const { podcast } = route.params;

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Icon name="arrow-back" size={24} color="#000" />
      </TouchableOpacity>
      <Video
        source={{ uri: podcast.videoUrl, headers: { 'X-Mobile-App': 'true' } }}
        style={styles.video}
        controls
        resizeMode="contain"
      />
      <Text style={styles.title}>{podcast.title}</Text>
      <Text style={styles.description}>{podcast.content}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    padding: 20,
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    zIndex: 10,
  },
  video: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    color: '#666',
  },
});

export default PodcastScreen;