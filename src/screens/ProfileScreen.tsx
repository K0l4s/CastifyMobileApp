import React, { useEffect, useState, useRef } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootParamList } from '../type/navigationType';
import Icon from 'react-native-vector-icons/Ionicons';
import { Podcast } from '../models/PodcastModel';
import PodcastService from '../services/podcastService';
import { FlatList, RefreshControl, ScrollView } from 'react-native-gesture-handler';
import PodcastItemMini from '../components/podcast/PodcastItemMini';
import EditProfileModal from '../components/modals/EditProfileModal';
import BottomSheet from '@gorhom/bottom-sheet';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import CustomBottomSheet from '../components/common/OptionsBottomSheet';
import AuthenticateService from '../services/authenticateService';
import { logout, setUser, updateAvatar } from '../redux/reducer/authSlice';
import { defaultAvatar, defaultCover } from '../utils/fileUtil';
import Toast from 'react-native-toast-message';
import UserService from '../services/userService';

type ProfileScreenRouteProp = RouteProp<RootParamList, 'Profile'>;

const ProfileScreen: React.FC = () => {
  const route = useRoute<ProfileScreenRouteProp>();
  const { username } = route.params || {};
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const isCurrentUser = !username || username === currentUser?.username;
  const dispatch = useDispatch();
  const navigation = useNavigation<StackNavigationProp<RootParamList>>();
  const [user, setNewUser] = useState(currentUser);
  const [isFollowing, setIsFollowing] = useState(user?.follow || false);
  const [selectedTab, setSelectedTab] = useState('Video');
  const [myPodcasts, setMyPodcasts] = useState<Podcast[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLoading, setUserLoading] = useState(true);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isBottomSheetVisible, setIsBottomSheetVisible] = useState(false);
  const sheetRef = useRef<BottomSheet>(null);

  const [isRefreshing, setIsRefreshing] = useState(false);

  const fullName = user?.fullname || `${user?.lastName || ''} ${user?.middleName || ''} ${user?.firstName || ''}`.trim();
  const avatarSource = user?.avatarUrl && user.avatarUrl !== '' ? { uri: user.avatarUrl } : defaultAvatar;
  const coverSource = user?.coverUrl && user.coverUrl !== '' ? { uri: user.coverUrl } : defaultCover;

  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

  const onRefresh = async () => {
    setIsRefreshing(true);
    const response = await UserService.getUserByUsername(user!.username, isAuthenticated);
    setNewUser(response);
    dispatch(setUser(response))
    setIsRefreshing(false);
  };

  useEffect(() => {
    if (!isCurrentUser) {
      fetchUserProfile();
    } else {
      setUserLoading(false);
    }
  }, [username]);

  useEffect(() => {
    if (selectedTab === 'Video') {
      fetchMyPodcasts();
    }
  }, [selectedTab]);

  const fetchUserProfile = async () => {
    try {
      setUserLoading(true);
      const response = await UserService.getUserByUsername(username, isAuthenticated);
      setNewUser(response);
    } catch (error) {
      console.error('Error fetching user profile:', error);
    } finally {
      setUserLoading(false); // Set loading state to false after fetching
    }
  };

  useEffect(() => {
    if (user) {
      setIsFollowing(user.follow || false);
    }
  }, [user]);

  const fetchMyPodcasts = async () => {
    try {
      if (isCurrentUser) {
        const response = await PodcastService.getPodcastBySelf(0, 10);
        setMyPodcasts(response.content);
      }
      else {
        const response = await PodcastService.getUserPodcasts(username);
        setMyPodcasts(response.content);
      }
    } catch (error) {
      console.error('Error retrieving my podcasts from server', error);
    } finally {
      setLoading(false);
    }
  };

  const renderTabContent = () => {
    if (selectedTab === 'Video') {
      return loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <FlatList
          data={myPodcasts}
          renderItem={({ item }) => <PodcastItemMini podcast={item} />}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          style={{ alignSelf: 'flex-start' }}
        />
      );
    } else {
      return (
        <View style={styles.placeholderContainer}>
          <Text style={styles.placeholderText}>No playlist available</Text>
        </View>
      );
    }
  };

  const bottomSheetOptions = isCurrentUser
  ? [
      { label: 'Share', onPress: () => Toast.show({ type: 'info', text1: 'Coming soon!' }) },
      { label: 'Settings', onPress: () => Toast.show({ type: 'info', text1: 'Coming soon!' }) },
      { label: 'Logout', onPress: () => {
          AuthenticateService.logOut(navigation);
          dispatch(logout());
        },
      },
    ]
  : [
      { label: 'Share', onPress: () => Toast.show({ type: 'info', text1: 'Coming soon!' }) },
      { label: 'Report', onPress: () => Toast.show({ type: 'info', text1: 'Reported!' }) },
    ];

  const handleFollow = async () => {
    try {
      if (!isAuthenticated) {
        Toast.show({
          type: 'info',
          text1: 'Please login to perform this action!',
          position: 'bottom',
          visibilityTime: 2000,
        });
        return;
      }
  
      // Call the followUser API
      await UserService.followUser(username || user?.username || '');
  
      // Toggle the follow state and update the UI
      setNewUser((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          follow: !prev.follow,
          totalFollower: prev.follow ? prev.totalFollower - 1 : prev.totalFollower + 1, // Update follower count
        };
      });
      setIsFollowing(!isFollowing);
  
      Toast.show({
        type: 'success',
        text1: isFollowing ? 'Unfollowed successfully!' : 'Followed successfully!',
        position: 'bottom',
        visibilityTime: 2000,
      });
    } catch (error) {
      console.error('Error following/unfollowing user:', error);
      Toast.show({
        type: 'error',
        text1: 'Something went wrong!',
        position: 'bottom',
        visibilityTime: 2000,
      });
    }
  };
  
  if (userLoading) {
    // Show a loading indicator while user data is being fetched
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <View style={styles.header}>
        {/* Back Button on the Left */}
        <TouchableOpacity style={styles.headerButton} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>

        {/* Buttons on the Right */}
        <View style={styles.headerRight}>
          {isCurrentUser && (
            <TouchableOpacity
              style={styles.headerButton}
              onPress={() => navigation.navigate('ViewedHistory')}
            >
              <Icon name="time-outline" size={24} color="#000" />
            </TouchableOpacity>
          )}

          {isCurrentUser && (
            <TouchableOpacity
              style={styles.headerButton}
              onPress={() => onRefresh()}
            >
              <Icon name="reload-outline" size={24} color="#000" />
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.headerButton} onPress={() => setIsBottomSheetVisible(true)}>
            <Icon name="ellipsis-vertical" size={24} color="#000" />
          </TouchableOpacity>
        </View>
      </View>

      <Image source={coverSource} style={styles.coverUrl} />

      <View style={styles.profileContainer}>
        <Image source={avatarSource} style={styles.avatar} />
        <View style={styles.profileDetails}>
          <Text style={styles.fullname}>{fullName}</Text>
          <Text style={styles.username}>@{user?.username}</Text>
          <Text style={styles.stats}>
            <Text style={styles.statsText}>{user?.totalFollower} Followers </Text>
            <Text style={styles.statsText}> • </Text>
            <Text style={styles.statsText}>{user?.totalPost} Podcasts</Text>
          </Text>
        </View>
      </View>
      
      {isCurrentUser && (
        <TouchableOpacity 
          style={styles.editButton} 
          onPress={() => { 
            sheetRef.current?.close();
            setIsEditModalVisible(true);
          }}
        >
          <Text style={{fontWeight: "bold"}}>Edit your profile</Text>
          <Icon name="pencil" size={20} color="#000" />
        </TouchableOpacity>
      )}

      {!isCurrentUser && (
        <TouchableOpacity 
          style={[styles.followButton, isFollowing && styles.unfollowButton]} 
          onPress={handleFollow}
        >
          <Text style={styles.followButtonText}>
            {isFollowing ? 'Unfollow' : 'Follow'}
          </Text>
        </TouchableOpacity>
      )}

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tabButton, selectedTab === 'Video' && styles.activeTabButton]}
          onPress={() => setSelectedTab('Video')}
        >
          <Text style={[styles.tabText, selectedTab === 'Video' && styles.activeTabText]}>Video</Text>
        </TouchableOpacity>
        {isCurrentUser && (
          <TouchableOpacity
            style={[styles.tabButton, selectedTab === 'Playlist' && styles.activeTabButton]}
            onPress={() => setSelectedTab('Playlist')}
          >
            <Text style={[styles.tabText, selectedTab === 'Playlist' && styles.activeTabText]}>Playlist</Text>
          </TouchableOpacity>
        )}
      </View>

      {renderTabContent()}
      <EditProfileModal
        isVisible={isEditModalVisible}
        onClose={() => setIsEditModalVisible(false)}
      />
      {!isEditModalVisible && (
        <CustomBottomSheet
        sheetRef={sheetRef}
        options={bottomSheetOptions}
        isVisible={isBottomSheetVisible}
        onClose={() => setIsBottomSheetVisible(false)}
      />
      )}
      
    </GestureHandlerRootView>
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
    alignItems: 'center',
    paddingTop: 40,
  },
  header: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
    position: 'absolute',
    top: 10,
  },
  headerButton: {
    padding: 5,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  coverUrl: {
    width: '90%',
    height: 150,
    borderRadius: 15,
    resizeMode: 'cover',
    marginTop: 15,
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    width: '90%',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 50,
  },
  profileDetails: {
    marginLeft: 15,
    flex: 1,
  },
  fullname: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  username: {
    fontSize: 14,
    fontWeight: 'semibold',
    fontStyle: 'italic',
  },
  stats: {
    marginTop: 5,
  },
  statsText: {
    fontSize: 14,
    fontWeight: 'regular',
  },
  editButton: {
    width: '90%',
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: "center",
    gap: 10,
    backgroundColor: '#d4d4d4',
    borderRadius: 15,
    marginTop: 20,
  },
  followButton: {
    width: '90%',
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007BFF',
    borderRadius: 15,
    marginTop: 20,
  },
  unfollowButton: {
    backgroundColor: '#a09bbf',
  },
  followButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  tabContainer: {
    flexDirection: 'row',
    marginTop: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
  },
  activeTabButton: {
    borderBottomWidth: 2,
    borderBottomColor: '#2647bf',
  },
  tabText: {
    fontSize: 16,
    color: '#666',
  },
  activeTabText: {
    color: '#2647bf',
    fontWeight: 'bold',
  },
  listContent: {
    width: '100%',
    paddingHorizontal: 10,
  },
  placeholderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 18,
    color: '#666',
  }
});

export default ProfileScreen;