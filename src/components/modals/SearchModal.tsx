import React, { useEffect, useState, useCallback } from 'react';
import { 
  View, TextInput, StyleSheet, Modal, TouchableOpacity, Text, 
  FlatList, KeyboardAvoidingView, Platform, ActivityIndicator 
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
      const postResponse = await UserService.searchPodcasts(query, page, 1);
      
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
  return (
    <Modal animationType="slide" transparent visible={visible} onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalContainer}>
        <View style={styles.searchBar}>
          <TouchableOpacity onPress={
            back
            } style={styles.backButton}>
            <Icon name="arrow-back" size={22} color="black" />
          </TouchableOpacity>
          <TextInput
            style={styles.searchInput}
            placeholder="Search users or posts..."
            placeholderTextColor="#999"
            value={searchQuery}
            onSubmitEditing={handleSubmit}
            onChangeText={(text) => {
              setSearchQuery(text);
              // debouncedSearch(text);
            }}
          />
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#007AFF" style={{ marginTop: 20 }} />
        ) : (
          <>
            <FlatList
              data={userResults || []}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => <UserItem user={item} />}
              contentContainerStyle={styles.list}
              ListEmptyComponent={<Text style={styles.noResults}>No users found</Text>}
            />
            {userPage + 1 < totalUserPages && (
              <TouchableOpacity onPress={() => {
                // const nextPage = userPage + 1;
                if (userPage + 1 < totalUserPages){
                  setUserPage(prevPage => prevPage + 1);
                  fetchUsers(searchQuery, userPage + 1);
                }
              }} style={styles.viewMoreButton}>
                <Text style={styles.viewMoreText}>View More Users</Text>
              </TouchableOpacity>
            )}

            <FlatList
              data={postResults || []}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => <PodcastItem podcast={item} />}
              contentContainerStyle={styles.list}
              ListEmptyComponent={<Text style={styles.noResults}>No posts found</Text>}
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
              <Text style={styles.viewMoreText}>View More Posts</Text>
            </TouchableOpacity>            
            )}
          </>
        )}
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  backButton: {
    padding: 4,
  },
  searchInput: {
    flex: 1,
    height: 45,
    fontSize: 16,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    backgroundColor: '#f9f9f9',
    marginLeft: 10,
  },
  list: {
    paddingBottom: 20,
  },
  noResults: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: 'gray',
  },
  viewMoreButton: {
    padding: 10,
    alignItems: 'center',
  },
  viewMoreText: {
    fontSize: 16,
    color: '#007AFF',
  },
});

export default SearchModal;