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
import Toast from 'react-native-toast-message';

interface PodcastItemProps {
  podcast: Podcast;
}

const SuggestedItem: React.FC<PodcastItemProps> = ({ podcast }) => {
  const navigation = useNavigation<StackNavigationProp<RootParamList>>();
  const { showBottomSheet } = useBottomSheet();

  const bottomSheetOptions = [
    { label: 'Add to playlist', onPress: () => Toast.show({ type: 'info', text1: "Coming soon!"}) },
    { label: 'Share', onPress: () => Toast.show({ type: 'info', text1: "Coming soon!"}) },
    { label: 'Report', onPress: () => Toast.show({ type: 'info', text1: "Coming soon!"}) },
  ];
  return (
    <View style={styles.itemContainer}>
      <TouchableOpacity onPress={() => navigation.navigate('Podcast', { podcast })}>
        <View style={styles.thumbnailContainer}>
          <Image source={{ uri: podcast.thumbnailUrl || '' }} style={styles.thumbnail} />
          <Text style={styles.duration}>{DateUtil.formatTimeDuration(podcast.duration)}</Text>
        </View>
      </TouchableOpacity>
      <View style={styles.infoContainer}>
        <Image source={podcast.user.avatarUrl ? { uri: podcast.user.avatarUrl } : defaultAvatar} style={styles.avatar} />
        <View style={styles.textContainer}>
          <Text style={styles.title} numberOfLines={2} ellipsizeMode='tail'>{podcast.title}</Text>
          <Text style={styles.subtitle} numberOfLines={1}>{podcast.user.fullname} </Text>
          <Text style={styles.subtitle}>
            {podcast.views} views · {DateUtil.formatDateToTimeAgo(new Date(podcast.createdDay))}
          </Text>
        </View>
        <TouchableOpacity onPress={() => showBottomSheet(bottomSheetOptions)}>
          <Icon name="ellipsis-vertical" size={20} color="#000" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  itemContainer: {
    width: 300,
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

export default React.memo(SuggestedItem);