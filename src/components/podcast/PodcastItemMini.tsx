import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Podcast } from '../../models/PodcastModel';
import DateUtil from '../../utils/dateUtil';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootParamList } from '../../type/navigationType';

interface PodcastItemMiniProps {
  podcast: Podcast;
}

const PodcastItemMini: React.FC<PodcastItemMiniProps> = ({ podcast }) => {
  const navigation = useNavigation<StackNavigationProp<RootParamList>>();

  return (
    <TouchableOpacity onPress={() => navigation.navigate('Podcast', { podcast })}>
      <View style={styles.itemContainer}>
        <View style={styles.thumbnailContainer}>
          <Image source={{ uri: podcast.thumbnailUrl || '' }} style={styles.thumbnail} />
          <Text style={styles.duration}>{DateUtil.formatTimeDuration(podcast.duration)}</Text>
        </View>
        <View style={styles.infoContainer}>
          <View style={styles.textContainer}>
            <Text style={styles.title} numberOfLines={2} ellipsizeMode="tail">
                {podcast.title}
            </Text>
            <Text style={styles.subtitle}>
              {podcast.views} views · {DateUtil.formatDateToTimeAgo(new Date(podcast.createdDay))}
            </Text>
          </View>
        </View>
        <TouchableOpacity style={styles.menuBtn}>
          <Icon name="ellipsis-vertical" size={20} color="#000" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  itemContainer: {
    flexDirection: 'row',
    marginVertical: 10,
    justifyContent: 'space-around',
  },
  thumbnailContainer: {
    position: 'relative',
  },
  thumbnail: {
    width: 140,
    height: 80,
    resizeMode: 'cover',
  },
  duration: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    color: '#fff',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 5,
    fontSize: 12,
  },
  infoContainer: {
    flexDirection: 'column',
    marginHorizontal: 10,
    maxWidth: 160,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 14,
    color: '#333',
  },
  subtitle: {
    fontSize: 12,
    color: '#666',
  },
  menuBtn: {
    padding: 5,
    alignSelf: 'flex-start',
  },
});

export default React.memo(PodcastItemMini);
