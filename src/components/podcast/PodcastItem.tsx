import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Podcast } from '../../models/PodcastModel';
import DateUtil from '../../utils/dateUtil';
import { defaultAvatar } from '../../utils/fileUtil';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootParamList } from '../../type/navigationType';
import { useBottomSheet } from '../../context/BottomSheetContext';

interface PodcastItemProps {
  podcast: Podcast;
  menuOptions?: { label: string; onPress: () => void }[]; // Allow dynamic menu options
}

const PodcastItem: React.FC<PodcastItemProps> = ({ podcast, menuOptions }) => {
  const navigation = useNavigation<StackNavigationProp<RootParamList>>();
  const { showBottomSheet } = useBottomSheet();
  const username = podcast.user.username;
  const defaultOptions = [
    { label: 'Add to playlist', onPress: () => console.log('Add to playlist') },
    { label: 'Share', onPress: () => console.log('Share') },
    { label: 'Report', onPress: () => console.log('Report') },
  ];

  const options = [...(menuOptions || []), ...defaultOptions]; // Use custom options if provided

  return (
    <View style={styles.itemContainer}>
      <TouchableOpacity onPress={() => navigation.navigate('Podcast', { podcast })}>
        <View style={styles.thumbnailContainer}>
          <Image source={{ uri: podcast.thumbnailUrl || '' }} style={styles.thumbnail} />
          <Text style={styles.duration}>{DateUtil.formatTimeDuration(podcast.duration)}</Text>
        </View>
      </TouchableOpacity>
      <View style={styles.infoContainer}>
        <TouchableOpacity onPress={() => navigation.navigate('Profile', { username })}>
          <Image source={podcast.user.avatarUrl ? { uri: podcast.user.avatarUrl } : defaultAvatar} style={styles.avatar} />
        </TouchableOpacity>
        <View style={styles.textContainer}>
          <Text style={styles.title} numberOfLines={2} ellipsizeMode="tail">{podcast.title}</Text>
          <Text style={styles.subtitle} numberOfLines={1}>{podcast.user.fullname}</Text>
          <Text style={styles.subtitle}>
            {podcast.views} views · {DateUtil.formatDateToTimeAgo(new Date(podcast.createdDay))}
          </Text>
        </View>
        <TouchableOpacity onPress={() => showBottomSheet(options)}>
          <Icon name="ellipsis-vertical" size={20} color="#000" />
        </TouchableOpacity>
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
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
  },
  thumbnailContainer: {
    position: 'relative',
  },
  thumbnail: {
    width: '100%',
    height: 200,
    resizeMode: 'contain',
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
    flexDirection: 'row',
    padding: 10,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#ddd',
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
});

export default React.memo(PodcastItem);