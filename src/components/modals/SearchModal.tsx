import React, { useEffect, useState, useRef } from 'react';
import { 
  View, TextInput, StyleSheet, TouchableOpacity, Text, 
  FlatList, KeyboardAvoidingView, Platform, ActivityIndicator
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import UserService from '../../services/userService';
import UserItem from '../../components/user/UserItem';
import PodcastItem from '../../components/podcast/PodcastItem';
import { userCard } from "../../models/User";
import { Podcast } from '../../models/PodcastModel';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootParamList } from '../../type/navigationType';

const SearchModal: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<RootParamList>>();
  const searchInputRef = useRef<TextInput>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [userResults, setUserResults] = useState<userCard[]>([]);
  const [postResults, setPostResults] = useState<Podcast[]>([]);
  const [loading, setLoading] = useState(false);
  const [userPage, setUserPage] = useState(0);
  const [postPage, setPostPage] = useState(0);
  const [totalUserPages, setTotalUserPages] = useState(0);
  const [totalPostPages, setTotalPostPages] = useState(0);
  const [activeTab, setActiveTab] = useState<'users' | 'podcasts'>('users');

  useEffect(() => {
    setTimeout(() => {
      searchInputRef.current?.focus();
    }, 100);
  }, []);

  const handleBack = () => {
    navigation.goBack(); // Quay lại màn hình trước đó
  };

  const fetchUsers = async (query: string, page: number = 0) => {
    try {
      const userResponse = await UserService.searchUsers(query, page, 1);
      setUserResults(prevUsers => [...prevUsers, ...userResponse.data]);
      setTotalUserPages(userResponse.totalPages || 0);
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  };

  const fetchPosts = async (query: string, page: number = 0) => {
    try {
      const postResponse = await UserService.searchPodcasts(query, page, 2);
      const podcasts: Podcast[] = postResponse.content.map((item: any): Podcast => ({
        id: item.id,
        title: item.title,
        content: item.content,
        thumbnailUrl: item.thumbnailUrl,
        videoUrl: item.videoUrl,
        genres: item.genres,
        views: item.views,
        duration: item.duration,
        totalLikes: item.totalLikes,
        totalComments: item.totalComments,
        username: item.username ?? item.user?.username ?? "unknown",
        createdDay: item.createdDay,
        lastEdited: item.lastEdited,
        user: item.user,
        active: item.active,
        liked: item.liked
      }));
      setPostResults(prevPosts => [...prevPosts, ...podcasts]);
      setTotalPostPages(postResponse.totalPages || 0);
    } catch (err) {
      console.error("Error fetching posts:", err);
    }
  };

  const handleSubmit = () => {
    setPostResults([]);
    setPostPage(0);
    setTotalPostPages(0);
    setTotalUserPages(0);
    setUserPage(0);
    setUserResults([]);
    fetchPosts(searchQuery, 0);
    fetchUsers(searchQuery, 0);
  };

  const handleTabChange = (tab: 'users' | 'podcasts') => {
    setActiveTab(tab);
    setPostResults([]);
    setUserResults([]);
    setPostPage(0);
    setUserPage(0);
    setTotalPostPages(0);
    setTotalUserPages(0);
    if (searchQuery.trim()) {
      if (tab === 'users') {
        fetchUsers(searchQuery, 0);
      } else {
        fetchPosts(searchQuery, 0);
      }
    }
  };

  const renderItem = ({ item }: { item: userCard | Podcast }) => {
    if (activeTab === 'users') {
      return <UserItem user={item as userCard} />;
    }
    return <PodcastItem podcast={item as Podcast} />;
  };

  const renderFooter = () => {
    if (activeTab === 'users' && userPage + 1 < totalUserPages) {
      return (
        <TouchableOpacity
          onPress={() => {
            setUserPage(prevPage => prevPage + 1);
            fetchUsers(searchQuery, userPage + 1);
          }}
          style={styles.viewMoreButton}
        >
          <Text style={styles.viewMoreText}>View More Users</Text>
          <Icon name="chevron-down" size={16} color="#007AFF" />
        </TouchableOpacity>
      );
    }

    if (activeTab === 'podcasts' && postPage + 1 < totalPostPages) {
      return (
        <TouchableOpacity
          onPress={() => {
            setPostPage(prevPage => prevPage + 1);
            fetchPosts(searchQuery, postPage + 1);
          }}
          style={styles.viewMoreButton}
        >
          <Text style={styles.viewMoreText}>View More Podcasts</Text>
          <Icon name="chevron-down" size={16} color="#007AFF" />
        </TouchableOpacity>
      );
    }

    return null;
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <View style={styles.header}>
        <View style={styles.searchBar}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Icon name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <View style={styles.searchInputContainer}>
            <Icon name="search" size={20} color="#666" style={styles.searchIcon} />
            <TextInput
              ref={searchInputRef}
              style={styles.searchInput}
              placeholder="Search users or posts..."
              placeholderTextColor="#999"
              value={searchQuery}
              onSubmitEditing={handleSubmit}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity 
                onPress={() => setSearchQuery('')}
                style={styles.clearButton}
              >
                <Icon name="close-circle" size={20} color="#666" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={styles.tabContainer}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'users' && styles.activeTab]}
            onPress={() => handleTabChange('users')}
          >
            <Text style={[styles.tabText, activeTab === 'users' && styles.activeTabText]}>Users</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'podcasts' && styles.activeTab]}
            onPress={() => handleTabChange('podcasts')}
          >
            <Text style={[styles.tabText, activeTab === 'podcasts' && styles.activeTabText]}>Podcasts</Text>
          </TouchableOpacity>
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Searching...</Text>
        </View>
      ) : (
        <FlatList
          data={activeTab === 'users' ? userResults : postResults}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Icon name={activeTab === 'users' ? 'people-outline' : 'mic-outline'} size={40} color="#999" />
              <Text style={styles.noResults}>
                {activeTab === 'users' ? 'No users found' : 'No podcasts found'}
              </Text>
            </View>
          }
          ListFooterComponent={renderFooter}
        />
      )}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  backButton: {
    padding: 8,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f3f4',
    borderRadius: 25,
    marginLeft: 8,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
    color: '#333',
  },
  clearButton: {
    padding: 4,
  },
  resultsContainer: {
    flex: 1,
    paddingHorizontal: 12,
    backgroundColor: '#f8f9fa',
  },
  section: {
    marginBottom: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  noResults: {
    marginTop: 8,
    fontSize: 16,
    color: '#999',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#fff',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#007AFF',
  },
  tabText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  viewMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 20,
    marginTop: 8,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  viewMoreText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#007AFF',
    marginRight: 4,
  },
});

export default SearchModal;