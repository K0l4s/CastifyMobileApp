import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ActivityIndicator, RefreshControl, Dimensions } from 'react-native';
import PodcastService from '../services/podcastService';
import UserService from '../services/userService';
import { Podcast } from '../models/PodcastModel';
import PodcastItem from '../components/podcast/PodcastItem';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootParamList } from '../type/navigationType';
import { AxiosError } from 'axios';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface FollowingUser {
  id: string;
  username: string;
  avatarUrl: string;
  fullname: string;
}

const USERS_PER_PAGE = 10;

const FollowingScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootParamList>>();
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const [followingUsers, setFollowingUsers] = useState<FollowingUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<FollowingUser | null>(null);
  const [allPodcasts, setAllPodcasts] = useState<Podcast[]>([]);
  const [displayedPodcasts, setDisplayedPodcasts] = useState<Podcast[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userPage, setUserPage] = useState(0);
  const [hasMoreUsers, setHasMoreUsers] = useState(true);
  const [loadingMoreUsers, setLoadingMoreUsers] = useState(false);
  const [totalPages, setTotalPages] = useState(1);

  const fetchFollowingUsers = async (page: number = 0) => {
    try {
      setError(null);
      if (!isAuthenticated) {
        setError('Please login to view your following list');
        setLoading(false);
        return;
      }
      if (!currentUser?.username) {
        setError('User information not found');
        setLoading(false);
        return;
      }

      const response = await UserService.getFollowingUsers(currentUser.username, page, USERS_PER_PAGE);
      console.log('Following users response:', response);
      
      if (response && Array.isArray(response.data)) {
        setFollowingUsers(prev => page === 0 ? response.data : [...prev, ...response.data]);
        setTotalPages(response.totalPages || 1);
        setHasMoreUsers(response.data.length === USERS_PER_PAGE);
        
        if (page === 0) {
          await fetchAllFollowingPodcasts(response.data);
        }
      } else {
        console.error('Invalid response format:', response);
        setError('Invalid response format from server');
      }
    } catch (error: any) {
      console.error('Error fetching following users:', error);
      if (error.response?.status === 403) {
        setError('Your session has expired. Please login again.');
      } else {
        setError('Failed to load following users. Please try again.');
      }
    } finally {
      setLoading(false);
      setLoadingMoreUsers(false);
    }
  };

  const loadMoreUsers = async () => {
    if (!loadingMoreUsers && hasMoreUsers && userPage < totalPages - 1) {
      setLoadingMoreUsers(true);
      const nextPage = userPage + 1;
      setUserPage(nextPage);
      await fetchFollowingUsers(nextPage);
    }
  };

  const fetchAllFollowingPodcasts = async (users: FollowingUser[]) => {
    try {
      const allPodcastsPromises = users.map(user => 
        PodcastService.getUserPodcasts(user.username, 0, 50)
      );
      const results = await Promise.all(allPodcastsPromises);
      const podcasts = results.flatMap(result => result.content);
      setAllPodcasts(podcasts);
      setDisplayedPodcasts(podcasts);
    } catch (error) {
      console.error('Error fetching all podcasts:', error);
      setError('Failed to load podcasts. Please try again.');
    }
  };

  useEffect(() => {
    fetchFollowingUsers();
  }, []);

  useEffect(() => {
    if (selectedUser) {
      const userPodcasts = allPodcasts.filter(podcast => podcast.user.id === selectedUser.id);
      setDisplayedPodcasts(userPodcasts);
    } else {
      setDisplayedPodcasts(allPodcasts);
    }
  }, [selectedUser, allPodcasts]);

  const handleUserSelect = (user: FollowingUser) => {
    setSelectedUser(prevUser => prevUser?.id === user.id ? null : user);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    setUserPage(0);
    setHasMoreUsers(true);
    await fetchFollowingUsers(0);
    setRefreshing(false);
  };

  const navigateToAllUsers = () => {
    navigation.navigate('AllFollowingUsers');
  };

  const renderUserItem = ({ item }: { item: FollowingUser }) => (
    <TouchableOpacity
      style={[
        styles.userItem,
        selectedUser?.id === item.id && styles.selectedUserItem
      ]}
      onPress={() => handleUserSelect(item)}
    >
      <View style={[styles.avatarContainer, selectedUser?.id === item.id && styles.selectedAvatarContainer]}>
        <Image 
          source={{ uri: item.avatarUrl || 'https://via.placeholder.com/150' }} 
          style={styles.userAvatar} 
        />
      </View>
      <Text style={[
        styles.username,
        selectedUser?.id === item.id && styles.selectedUsername
      ]} numberOfLines={1}>
        {item.username}
      </Text>
    </TouchableOpacity>
  );

  const renderFooter = () => {
    if (!loadingMoreUsers) return null;
    return (
      <View style={styles.loaderFooter}>
        <ActivityIndicator size="small" color="#0000ff" />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Following</Text>
      </View>

      {!isAuthenticated ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Please login to view your following list</Text>
          <TouchableOpacity 
            style={styles.loginButton}
            onPress={() => navigation.navigate('Main')}
          >
            <Text style={styles.loginText}>Login</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <View style={styles.usersList}>
            <FlatList
              data={followingUsers}
              renderItem={renderUserItem}
              keyExtractor={item => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.usersListContainer}
              onEndReached={loadMoreUsers}
              onEndReachedThreshold={0.5}
              ListHeaderComponent={
                <TouchableOpacity
                  style={[styles.userItem, !selectedUser && styles.selectedUserItem]}
                  onPress={() => setSelectedUser(null)}
                >
                  <View style={[styles.avatarContainer, !selectedUser && styles.selectedAvatarContainer]}>
                    <Icon name="people" size={30} color="#666" />
                  </View>
                  <Text style={[styles.username, !selectedUser && styles.selectedUsername]}>
                    Tất cả
                  </Text>
                </TouchableOpacity>
              }
              ListFooterComponent={
                loadingMoreUsers ? (
                  <View style={styles.loaderFooter}>
                    <ActivityIndicator size="small" color="#0000ff" />
                  </View>
                ) : null
              }
            />
            <TouchableOpacity
              style={[styles.userItem, styles.seeAllButton]}
              onPress={navigateToAllUsers}
            >
              <View style={styles.avatarContainer}>
                <Icon name="chevron-right" size={30} color="#666" />
              </View>
              <Text style={styles.username}>Xem tất cả</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.loader}>
              <ActivityIndicator size="large" color="#0000ff" />
            </View>
          ) : error ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity onPress={() => fetchFollowingUsers(0)} style={styles.retryButton}>
                <Text style={styles.retryText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <FlatList
              data={displayedPodcasts}
              renderItem={({ item }) => <PodcastItem podcast={item} />}
              keyExtractor={item => item.id}
              contentContainerStyle={styles.podcastsList}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={handleRefresh}
                  colors={['#0000ff']}
                />
              }
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>
                    {selectedUser 
                      ? 'No podcasts found for this user'
                      : 'No podcasts found from following users'}
                  </Text>
                </View>
              }
            />
          )}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderColor: '#ccc',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  usersList: {
    height: 110,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    flexDirection: 'row',
    alignItems: 'center',
  },
  usersListContainer: {
    paddingHorizontal: 8,
    paddingVertical: 12,
  },
  userItem: {
    alignItems: 'center',
    marginHorizontal: 6,
    width: 70,
  },
  seeAllButton: {
    opacity: 0.7,
    marginRight: 8,
  },
  avatarContainer: {
    padding: 2,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    marginBottom: 6,
    width: 56,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  selectedAvatarContainer: {
    borderColor: '#065fd4',
  },
  userAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
  },
  selectedUserItem: {
    opacity: 1,
  },
  username: {
    fontSize: 12,
    color: '#606060',
    textAlign: 'center',
    marginTop: 4,
  },
  selectedUsername: {
    color: '#065fd4',
    fontWeight: '500',
  },
  podcastsList: {
    padding: 10,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderFooter: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#ff0000',
    textAlign: 'center',
    marginBottom: 10,
  },
  retryButton: {
    backgroundColor: '#065fd4',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  retryText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  loginButton: {
    backgroundColor: '#065fd4',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  loginText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default FollowingScreen;
