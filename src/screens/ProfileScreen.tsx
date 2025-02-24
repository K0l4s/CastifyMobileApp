import React, { useEffect, useState, useRef } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootParamList } from '../type/navigationType';
import Icon from 'react-native-vector-icons/Ionicons';
import { Podcast } from '../models/PodcastModel';
import PodcastService from '../services/podcastService';
import { FlatList } from 'react-native-gesture-handler';
import PodcastItemMini from '../components/podcast/PodcastItemMini';
import EditProfileModal from '../components/modals/EditProfileModal';
import BottomSheet from '@gorhom/bottom-sheet';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import CustomBottomSheet from '../components/common/CustomBottomSheet';
import AuthenticateService from '../services/authenticateService';
import { logout } from '../redux/reducer/authSlice';
import { defaultAvatar, defaultCover } from '../utils/fileUtil';
import Toast from 'react-native-toast-message';

const ProfileScreen: React.FC = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  const dispatch = useDispatch();
  const navigation = useNavigation<StackNavigationProp<RootParamList>>();
  const [selectedTab, setSelectedTab] = useState('Video');
  const [myPodcasts, setMyPodcasts] = useState<Podcast[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isBottomSheetVisible, setIsBottomSheetVisible] = useState(false);
  const sheetRef = useRef<BottomSheet>(null);

  const fullName = `${user?.lastName} ${user?.middleName} ${user?.firstName}`;
  const avatarSource = user?.avatarUrl && user.avatarUrl !== '' ? { uri: user.avatarUrl } : defaultAvatar;
  const coverSource = user?.coverUrl && user.coverUrl !== '' ? { uri: user.coverUrl } : defaultCover;

  useEffect(() => {
    if (selectedTab === 'Video') {
      fetchMyPodcasts();
    }
  }, [selectedTab]);

  const fetchMyPodcasts = async () => {
    try {
      const response = await PodcastService.getPodcastBySelf(0, 10);
      setMyPodcasts(response.content);
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

  const bottomSheetOptions = [
    { label: 'Share', onPress: () => Toast.show({ type: 'info', text1: "Coming soon!"}) },
    { label: 'Settings', onPress: () => Toast.show({ type: 'info', text1: "Coming soon!"}) },
    { label: 'Logout', onPress: () => 
      { 
        AuthenticateService.logOut(navigation)
        dispatch(logout());
      } 
    },
  ];

  return (
    <GestureHandlerRootView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.headerButton} onPress={() => setIsBottomSheetVisible(true)}>
          <Icon name="ellipsis-vertical" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      <Image source={coverSource} style={styles.coverUrl} />

      <View style={styles.profileContainer}>
        <Image source={avatarSource} style={styles.avatar} />
        <View style={styles.profileDetails}>
          <Text style={styles.fullname}>{fullName}</Text>
          <Text style={styles.username}>@{user?.username}</Text>
          <Text style={styles.stats}>
            <Text style={styles.statsText}>{user?.followers || "1"} Followers </Text>
            <Text style={styles.statsText}> • </Text>
            <Text style={styles.statsText}>{user?.podcastCount || "1"} Podcasts</Text>
          </Text>
        </View>
      </View>

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

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tabButton, selectedTab === 'Video' && styles.activeTabButton]}
          onPress={() => setSelectedTab('Video')}
        >
          <Text style={[styles.tabText, selectedTab === 'Video' && styles.activeTabText]}>Video</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, selectedTab === 'Playlist' && styles.activeTabButton]}
          onPress={() => setSelectedTab('Playlist')}
        >
          <Text style={[styles.tabText, selectedTab === 'Playlist' && styles.activeTabText]}>Playlist</Text>
        </TouchableOpacity>
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