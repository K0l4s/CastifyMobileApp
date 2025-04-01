import React, { useState, useRef } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, ScrollView, 
  SafeAreaView, Share, ActivityIndicator 
} from 'react-native';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Orientation from 'react-native-orientation-locker';
import { RootParamList } from '../type/navigationType';
import Icon from 'react-native-vector-icons/Ionicons';
import Video, { VideoRef } from 'react-native-video';
import CommentSection from '../components/podcast/CommentSection';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { useBottomSheet } from '../context/BottomSheetContext';
import ContentBottomSheet from '../components/podcast/ContentBottomSheet';
import DateUtil from '../utils/dateUtil';

type PodcastScreenRouteProp = RouteProp<RootParamList, 'Podcast'>;
type PodcastScreenNavigationProp = StackNavigationProp<RootParamList, 'Podcast'>;

interface Podcast {
  id: string;
  title: string;
  videoUrl: string;
  thumbnailUrl?: string;
  views?: number;
  duration?: string;
  content?: string;
  createdDay: Date;
}

interface PodcastScreenProps {
  route: RouteProp<RootParamList, 'Podcast'>;
  navigation: StackNavigationProp<RootParamList, 'Podcast'>;
}

const PodcastScreen: React.FC<PodcastScreenProps> = ({ route, navigation }) => {
  //const route = useRoute<PodcastScreenRouteProp>();
  //const navigation = useNavigation<PodcastScreenNavigationProp>();
  const { podcast } = route.params;
  const [isPlaying, setIsPlaying] = useState(false);
  const [isBuffering, setIsBuffering] = useState(true);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false); // Trạng thái để quản lý overlay
  const videoRef = useRef<VideoRef>(null);
  const contentRef = useRef<BottomSheet>(null);

  const snapPoints = ['50%', '90%'];

  const { showCommentSection, hideBottomSheet } = useBottomSheet();

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out this podcast: ${podcast.title}`,
        url: podcast.videoUrl
      });
    } catch (error) {
      console.error(error);
    }
  };

  const toggleFullScreen = () => {
    if (isFullScreen) {
      Orientation.lockToPortrait(); // Khóa về dọc
    } else {
      Orientation.lockToLandscape(); // Xoay ngang
    }
    setIsFullScreen(!isFullScreen);
  };

  const handleOpenComments = () => {
    setIsBottomSheetOpen(true);
    showCommentSection(podcast.id, podcast.totalComments);
  };

  const handleOpenContent = () => {
    contentRef.current?.expand();
  };

  const handleCloseContent = () => {
    contentRef.current?.close();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.headerButton} 
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Icon name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.headerButton} 
          onPress={handleShare}
          activeOpacity={0.7}
        >
          <Icon name="share-social" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.videoContainer}>
          <Video
            ref={videoRef}
            source={{ uri: podcast.videoUrl, headers: { 'X-Mobile-App': 'true' } }}
            style={styles.video}
            controls
            resizeMode="contain"
            onBuffer={({ isBuffering }) => setIsBuffering(isBuffering)}
            onProgress={() => setIsPlaying(true)}
            onEnd={() => setIsPlaying(false)}
            poster={podcast.thumbnailUrl || ""}
          />
          {isBuffering && (
            <View style={styles.bufferingContainer}>
              <ActivityIndicator size="large" color="#fff" />
            </View>
          )}
          <TouchableOpacity 
            style={styles.fullscreenButton} 
            onPress={toggleFullScreen}
          >
            <Icon name={isFullScreen ? "contract" : "expand"} size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.title}>{podcast.title}</Text>
          <View style={styles.statsContainer}>
            <Icon name="eye-outline" size={16} color="#666" />
            <Text style={styles.statsText}>{podcast.views || 0} views</Text>
            <Icon name="time-outline" size={16} color="#666" style={styles.statsIcon} />
            {/* <Text style={styles.statsText}>{DateUtil.formatTimeDuration(podcast.duration) || '0:00'}</Text> */}
            {/* <Icon name={isPlaying ? "pause-circle" : "play-circle"} size={16} color="#666" style={styles.statsIcon} />
            <Text style={styles.statsText}>{isPlaying ? 'Playing' : 'Paused'}</Text> */}
            <Text style={styles.statsText}>{DateUtil.formatDateToTimeAgo(new Date(podcast.createdDay))} ago</Text>
          </View>
          
          <TouchableOpacity onPress={handleOpenContent} style={styles.descriptionContainer}>
            <Text style={styles.description} numberOfLines={3}>
              {podcast.content}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
        
      {/* Sử dụng ContentBottomSheet */}
      <ContentBottomSheet
        content={podcast.content || ''}
        sheetRef={contentRef}
        onClose={handleCloseContent}
      />

      {/* Comment section */}
      <TouchableOpacity style={styles.commentPreview} onPress={handleOpenComments}>
        <Text style={styles.commentPreviewText}>View Comments</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Màu nền mờ
    zIndex: 1, // Đảm bảo overlay nằm trên các thành phần khác
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
  },
  videoContainer: {
    position: 'relative',
    width: '100%',
    height: 200,
    backgroundColor: '#000',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  bufferingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  fullscreenButton: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 8,
    borderRadius: 5,
  },
  infoContainer: {
    padding: 15,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#1a1a1a',
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    flexWrap: 'wrap',
  },
  statsText: {
    marginLeft: 5,
    color: '#666',
    fontSize: 14,
  },
  statsIcon: {
    marginLeft: 15,
  },
  descriptionContainer: {
    borderWidth: 1,
    borderColor: "#f5f5f5",
    backgroundColor: "#f5f5f5",
    borderRadius: 10,
    padding: 5,
  },
  description: {
    fontSize: 12,
    color: '#4a4a4a',
    lineHeight: 24,
  },
  commentPreview: {
    padding: 16,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    marginTop: 20,
  },
  commentPreviewText: {
    color: '#007BFF',
    fontWeight: 'bold',
  },
});

export default PodcastScreen;
