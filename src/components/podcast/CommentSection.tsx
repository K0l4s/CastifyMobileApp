import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, ActivityIndicator, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import CommentService from '../../services/commentService';
import { Comment } from '../../models/CommentModel';
import { FlatList } from 'react-native-gesture-handler';

interface CommentSectionProps {
  sheetRef: React.RefObject<BottomSheet>;
  podcastId: string;
  isVisible: boolean;
  onClose: () => void;
}

const CommentSection: React.FC<CommentSectionProps> = ({ sheetRef, podcastId, isVisible, onClose }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const snapPoints = ['50%', '90%'];

  const fetchComments = async (pageNumber: number) => {
    if (isLoading || isLoadingMore || !hasMore) return;
  
    pageNumber === 0 ? setIsLoading(true) : setIsLoadingMore(true);
  
    try {
      const response = await CommentService.getCommentsByPodcast(podcastId, pageNumber, 10);
      console.log('Fetched comments:');
      setComments((prevComments) =>
        pageNumber === 0 ? response.content : [...prevComments, ...response.content]
      );
      setHasMore(response.content.length === 10);
      setPage(pageNumber + 1);
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      pageNumber === 0 ? setIsLoading(false) : setIsLoadingMore(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    try {
      const response = await CommentService.addComment({
        podcastId,
        content: newComment,
      });
      setComments((prevComments) => [response, ...prevComments]); // Thêm bình luận mới vào đầu danh sách
      setNewComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  // Reset trạng thái khi podcastId thay đổi
  useEffect(() => {
    setComments([]);
    setPage(0);
    setHasMore(true);
    if (isVisible) {
      fetchComments(0);
    }
  }, [podcastId]);

  useEffect(() => {
    if (isVisible) {
      sheetRef.current?.expand();
      if (comments.length === 0) {
        fetchComments(0);
      }
    } else {
      sheetRef.current?.close();
    }
  }, [isVisible]);

  return (
    <>
    <BottomSheet
      ref={sheetRef}
      index={isVisible ? 0 : -1}
      snapPoints={snapPoints}
      enablePanDownToClose={true}
      onClose={onClose}
    >
      <BottomSheetView style={styles.container}>
        <Text style={styles.header}>Comments</Text>
        {isLoading && page === 0 ? (
          <ActivityIndicator size="large" color="#000" />
        ) : (
          <FlatList
            data={comments}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.commentContainer}>
                <Image source={{ uri: item.user.avatarUrl }} style={styles.avatar} />
                <View style={styles.commentContent}>
                  <Text style={styles.username}>{item.user.fullname}</Text>
                  <Text style={styles.commentText}>{item.content}</Text>
                </View>
              </View>
            )}
            onEndReached={() => {
              if (hasMore && !isLoadingMore) {
                fetchComments(page);
              }
            }}
            onEndReachedThreshold={0.5}
            ListFooterComponent={
              isLoadingMore ? <ActivityIndicator size="small" color="#000" /> : null
            }
            contentContainerStyle={{ paddingBottom: 80 }}
          />
        )}
        
      </BottomSheetView>
      
      
    </BottomSheet>

    {/* Input để thêm bình luận */}
    {(isVisible && podcastId) && (
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.inputContainer}
      >
        <TextInput
          style={styles.input}
          placeholder="Add a comment..."
          placeholderTextColor="#999"
          value={newComment}
          onChangeText={setNewComment}
        />
        <TouchableOpacity style={styles.sendButton} onPress={handleAddComment}>
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    )}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: 'white',
  },
  header: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  commentContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  commentContent: {
    flex: 1,
  },
  username: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  commentText: {
    color: '#333',
  },
  inputContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    padding: 10,
    backgroundColor: 'white',
  },
  input: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    paddingHorizontal: 10,
    backgroundColor: '#f9f9f9',
  },
  sendButton: {
    marginLeft: 10,
    backgroundColor: '#007BFF',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  sendButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default CommentSection;