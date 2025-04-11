import React, { useState, useRef, useCallback, useEffect } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, ScrollView, 
  SafeAreaView, Share, ActivityIndicator, 
  Image
} from 'react-native';
import { RouteProp, useRoute, useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Orientation from 'react-native-orientation-locker';
import { RootParamList } from '../type/navigationType';
import Icon from 'react-native-vector-icons/Ionicons';
import Video, { OnProgressData, VideoRef } from 'react-native-video';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { useBottomSheet } from '../context/BottomSheetContext';
import ContentBottomSheet from '../components/podcast/ContentBottomSheet';
import DateUtil from '../utils/dateUtil';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import CommonUtil from '../utils/commonUtil';
import PodcastService from '../services/podcastService';
import Toast from 'react-native-toast-message';
import { setupVideoViewTracking } from '../utils/video';
import Animated, { runOnUI, useAnimatedStyle, useSharedValue, withSequence, withTiming } from 'react-native-reanimated';
import SuggestedPodcasts from '../components/podcast/SuggestedPodcasts';

// type PodcastScreenRouteProp = RouteProp<RootParamList, 'Podcast'>;
// type PodcastScreenNavigationProp = StackNavigationProp<RootParamList, 'Podcast'>;

// interface Podcast {
//   id: string;
//   title: string;
//   videoUrl: string;
//   thumbnailUrl?: string;
//   views?: number;
//   duration?: string;
//   content?: string;
//   createdDay: Date;
// }

interface PodcastScreenProps {
  route: RouteProp<RootParamList, 'Podcast'>;
  navigation: StackNavigationProp<RootParamList, 'Podcast'>;
}

const PodcastScreen: React.FC<PodcastScreenProps> = ({ route, navigation }) => {
  const { podcast } = route.params;
  const [genres, setGenres] = useState<string[]>(podcast.genres?.map((genre) => genre.id) || []);
  // const [isPlaying, setIsPlaying] = useState(false);
  const [isBuffering, setIsBuffering] = useState(true);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const videoRef = useRef<VideoRef>(null);
  const contentRef = useRef<BottomSheet>(null);
  const [updatedPodcast, setUpdatedPodcast] = useState(podcast);

  // Shared value cho animation
  const animatedViews = useSharedValue(podcast.views || 0);

  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const user = useSelector((state: RootState) => state.auth.user);

  const { showCommentSection, hideBottomSheet } = useBottomSheet();
  
  const fetchPodcastDetails = async () => {
    try {
      console.log("Fetching podcast details...");
      const response = await PodcastService.getPodcastById(podcast.id);
      setUpdatedPodcast(response);
      setGenres(response.genres?.map((genre) => genre.id) || []);
      setIsLiked(response.liked);
    } catch (error) {
      console.error('Error fetching podcast details:', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      if (isAuthenticated) {
        fetchPodcastDetails(); // Tải lại dữ liệu khi màn hình được focus
      }
    }, [isAuthenticated, podcast.id])
  );

  useEffect(() => {
    videoTrackingRef.current = setupVideoViewTracking(
      videoRef,
      PodcastService.incrementPodcastViews,
      podcast.id,
      handleViewIncremented,
      podcast.duration || 0
    );
    setGenres(podcast.genres?.map((genre) => genre.id) || []);
  }, [podcast.id]);

  const handleViewIncremented = () => {
    setUpdatedPodcast((prev) => {
      const newViews = (prev.views || 0) + 1;

      runOnUI(() => {
        animatedViews.value = withTiming(newViews, { duration: 500 }); // Animation trong 500ms
      })();

      return {
        ...prev,
        views: newViews,
      };
    });
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          scale: withSequence(
            withTiming(animatedViews.value > podcast.views ? 1.2 : 1, { duration: 200 }), // Phóng to 200ms
            withTiming(1, { duration: 200 }) // Trở lại kích thước ban đầu
          ),
        },
      ],
    };
  });

  const videoTrackingRef = useRef(
    setupVideoViewTracking(
      videoRef, 
      PodcastService.incrementPodcastViews, 
      podcast.id,
      handleViewIncremented,
      podcast.duration || 0
    )
  );

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

  const handleToggleLike = async () => {
    if (!isAuthenticated) {
      Toast.show({
        type: 'info',
        text1: 'Please login to do this action!',
        position: 'bottom',
        visibilityTime: 2000,
      });
      return;
    }

    try {
      await PodcastService.likePodcast(podcast.id);

      // Cập nhật trạng thái isLiked và totalLikes
      setIsLiked(!isLiked);
      setUpdatedPodcast((prev) => ({
        ...prev,
        totalLikes: prev.totalLikes + (isLiked ? -1 : 1),
      }));
    } catch (error) {
      console.error('Error liking podcast:', error);
    }
  };

  const handleToggleSave = () => {
    if (!isAuthenticated) {
      Toast.show({
        type: 'info',
        text1: 'Please login to do this action!',
        position: 'bottom',
        visibilityTime: 2000,
      });
      return;
    }
    setIsSaved(!isSaved);
  };

  const handleReport = () => {
    if (!isAuthenticated) {
      Toast.show({
        type: 'info',
        text1: 'Please login to do this action!',
        position: 'bottom',
        visibilityTime: 2000,
      });
      return;
    }

    console.log('Report video');
  };

  const handleFollow = () => {
    if (!isAuthenticated) {
      Toast.show({
        type: 'info',
        text1: 'Please login to do this action!',
        position: 'bottom',
        visibilityTime: 2000,
      });
      return;
    }

    console.log('Follow user');
  };

  const handleEditVideo = () => {
    console.log('Edit video');
  };

  const handleOpenProfile = () => {
    navigation.navigate('Profile', { username: podcast.user.username });
  };

  if (!updatedPodcast) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

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
            onProgress={videoTrackingRef.current.handleProgress}
            onEnd={videoTrackingRef.current.handleEnd}
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
            <Animated.Text style={[styles.statsText, animatedStyle]}>
              {CommonUtil.formatNumber(updatedPodcast.views || 0)} views
            </Animated.Text>
            <Icon name="time-outline" size={16} color="#666" style={styles.statsIcon} />
            <Text style={styles.statsText}>{DateUtil.formatDateToTimeAgo(new Date(podcast.createdDay))} ago</Text>
          </View>
          
          <TouchableOpacity onPress={handleOpenContent} style={styles.descriptionContainer}>
            <Text style={styles.description} numberOfLines={3}>
              {podcast.content}
            </Text>
          </TouchableOpacity>
        </View>

        {/* User Info Container */}
        <View style={styles.userInfoContainer}>
          <TouchableOpacity onPress={handleOpenProfile} style={styles.userInfo}>
            <Image source={{ uri: podcast.user.avatarUrl }} style={styles.avatar} />
            <View>
              <Text style={styles.username} numberOfLines={2}>{podcast.user.fullname}</Text>
              <Text style={styles.followers}>{CommonUtil.formatNumber(podcast.user.totalFollower)} followers</Text>
            </View>
          </TouchableOpacity>
          {user?.id === podcast.user.id ? (
            <TouchableOpacity style={styles.editButton} onPress={handleEditVideo}>
              <Text style={styles.editButtonText}>Edit Video</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.followButton} onPress={handleFollow}>
              <Text style={styles.followButtonText}>Follow</Text>
            </TouchableOpacity>
          )}
        </View>
          
          {/* Video Actions */}
        <View style={styles.videoActions}>
          <TouchableOpacity onPress={handleToggleLike} style={styles.actionButton}>
            <Icon name={isLiked ? "heart" : "heart-outline"} size={24} color={isLiked ? "red" : "#666"} />
            <Text style={styles.actionText}>{CommonUtil.formatNumber(updatedPodcast.totalLikes)}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleToggleSave} style={styles.actionButton}>
            <Icon name={isSaved ? "bookmark" : "bookmark-outline"} size={24} color={isSaved ? "#270ad1" : "#666"} />
            <Text style={styles.actionText}>Save</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleReport} style={styles.actionButton}>
            <Icon name="flag-outline" size={24} color="#666" />
            <Text style={styles.actionText}>Report</Text>
          </TouchableOpacity>
        </View>
        
        <SuggestedPodcasts 
          genreIds={genres} 
          currentPodcastId={podcast.id} 
        />

      </ScrollView>
        
      {/* Sử dụng ContentBottomSheet */}
      <ContentBottomSheet
        content={podcast.content || ''}
        sheetRef={contentRef}
        onClose={handleCloseContent}
      />

      {/* Comment section */}
      {isAuthenticated ? (
        <TouchableOpacity style={styles.commentPreview} onPress={handleOpenComments}>
          <Text style={styles.commentPreviewText}>View Comments ({CommonUtil.formatNumber(podcast.totalComments)})</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.commentPreview}>
          <Text style={styles.commentPreviewText}>Please login to view comments</Text>
        </View>
      )}
      
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
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
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#1a1a1a',
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
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
  userInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    marginVertical: 0,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 25,
    marginRight: 10,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  username: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  followers: {
    fontSize: 14,
    color: '#666',
  },
  editButton: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    backgroundColor: '#007BFF',
    borderRadius: 5,
  },
  editButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  followButton: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
  },
  followButtonText: {
    color: '#007BFF',
    fontWeight: 'bold',
  },
  videoActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  actionButton: {
    alignItems: 'center',
  },
  actionText: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
});

export default PodcastScreen;