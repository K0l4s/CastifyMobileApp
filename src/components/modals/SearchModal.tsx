import React, { useEffect, useState, useCallback } from 'react';
import { 
  View, TextInput, StyleSheet, Modal, TouchableOpacity, Text, 
  FlatList, KeyboardAvoidingView, Platform, ActivityIndicator, ScrollView 
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { debounce } from 'lodash';
import UserService from '../../services/userService';
import UserItem from '../../components/user/UserItem';
import PodcastItem from '../../components/podcast/PodcastItem';
import { userCard } from "../../models/User";
import { Podcast } from '../../models/PodcastModel';

interface SearchModalProps {
  visible: boolean;
  onClose: () => void;
}

const SearchModal: React.FC<SearchModalProps> = ({ visible, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [userResults, setUserResults] = useState<userCard[]>([]);
  const [postResults, setPostResults] = useState<Podcast[]>([]);
  const [loading, setLoading] = useState(false);
  const [userPage, setUserPage] = useState(0);
  const [postPage, setPostPage] = useState(0);
  const [totalUserPages, setTotalUserPages] = useState(0);
  const [totalPostPages, setTotalPostPages] = useState(0);

  useEffect(() => {
    if (!visible) {
      setSearchQuery('');
      setUserResults([]);
      setPostResults([]);
      setUserPage(0);
      setPostPage(0);
    }
  }, [visible]);

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
      
      // Ép từng item về đúng interface Podcast
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

      // Gán vào state nếu cần
      setPostResults(prevPosts => [...prevPosts, ...podcasts]);
      setTotalPostPages(postResponse.totalPages || 0);
  } catch (err) {
    console.error("Error fetching posts:", err);
  }
};

  const handleSubmit = () => {
    setPostResults([])
    setPostPage(0)
    setTotalPostPages(0)
    setTotalUserPages(0)
    setUserPage(0)
    setUserResults([])
    fetchPosts(searchQuery, 0);
    fetchUsers(searchQuery, 0)
  }
  const back = () => {
    onClose();
    setSearchQuery('')
    setPostResults([])
    setPostPage(0)
    setTotalPostPages(0)
    setTotalUserPages(0)
    setUserPage(0)
    setUserResults([])
  }

  const renderUserSection = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Users</Text>
      <FlatList
        data={userResults || []}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <UserItem user={item} />}
        scrollEnabled={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="people-outline" size={40} color="#999" />
            <Text style={styles.noResults}>No users found</Text>
          </View>
        }
      />
      {userPage + 1 < totalUserPages && (
        <TouchableOpacity 
          onPress={() => {
            if (userPage + 1 < totalUserPages) {
              setUserPage(prevPage => prevPage + 1);
              fetchUsers(searchQuery, userPage + 1);
            }
          }} 
          style={styles.viewMoreButton}
        >
          <Text style={styles.viewMoreText}>View More Users</Text>
          <Icon name="chevron-down" size={16} color="#007AFF" />
        </TouchableOpacity>
      )}
    </View>
  );

  const renderPodcastSection = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Podcasts</Text>
      <FlatList
        data={postResults || []}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <PodcastItem podcast={item} />}
        scrollEnabled={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="mic-outline" size={40} color="#999" />
            <Text style={styles.noResults}>No podcasts found</Text>
          </View>
        }
      />
      {postPage + 1 < totalPostPages && (
        <TouchableOpacity 
          onPress={() => {
            if (postPage + 1 < totalPostPages) {
              setPostPage(prevPage => prevPage + 1);
              fetchPosts(searchQuery, postPage + 1);
            }
          }} 
          style={styles.viewMoreButton}
        >
          <Text style={styles.viewMoreText}>View More Podcasts</Text>
          <Icon name="chevron-down" size={16} color="#007AFF" />
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <Modal animationType="slide" transparent visible={visible} onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalContainer}>
        <View style={styles.header}>
          <View style={styles.searchBar}>
            <TouchableOpacity onPress={back} style={styles.backButton}>
              <Icon name="arrow-back" size={24} color="#333" />
            </TouchableOpacity>
            <View style={styles.searchInputContainer}>
              <Icon name="search" size={20} color="#666" style={styles.searchIcon} />
              <TextInput
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
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.loadingText}>Searching...</Text>
          </View>
        ) : (
          <ScrollView 
            style={styles.resultsContainer}
            showsVerticalScrollIndicator={false}
          >
            {renderUserSection()}
            {renderPodcastSection()}
          </ScrollView>
        )}
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
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
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginVertical: 12,
    paddingLeft: 4,
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
});

export default SearchModal;