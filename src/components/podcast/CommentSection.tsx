import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Image, ActivityIndicator, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import CommentService from '../../services/commentService';
import { Comment } from '../../models/CommentModel';
import { FlatList } from 'react-native-gesture-handler';
import Icon from 'react-native-vector-icons/Ionicons';
import { noCommentImg } from '../../utils/fileUtil';
import DateUtil from '../../utils/dateUtil';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import CommentOptionsBottomSheet from './CommentOptionsBottomSheet';
import ConfirmDialog from '../modals/ConfirmDialogModal';

interface CommentSectionProps {
  sheetRef: React.RefObject<BottomSheet>;
  podcastId: string;
  totalComments: number;
  isVisible: boolean;
  onClose: () => void;
}

const CommentSection: React.FC<CommentSectionProps> = ({ sheetRef, podcastId, totalComments, isVisible, onClose }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [replies, setReplies] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [selectedCommentId, setSelectedCommentId] = useState<string | null>(null); 
  const [isLoadingReplies, setIsLoadingReplies] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  
  const [isOptionsVisible, setIsOptionsVisible] = useState(false);
  const optionsSheetRef = useRef<BottomSheet>(null);

  const [isConfirmVisible, setIsConfirmVisible] = useState(false); 
  const confirmDialogRef = useRef<BottomSheet>(null);

  const [parentComment, setParentComment] = useState<Comment | null>(null);
  const inputRef = useRef<TextInput>(null); 

  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const user = useSelector((state: RootState) => state.auth.user);

  const snapPoints = ['50%', '90%'];

  const fetchComments = async (pageNumber: number) => {
    if (isLoading || isLoadingMore || !hasMore) return;

    pageNumber === 0 ? setIsLoading(true) : setIsLoadingMore(true);

    try {
      const response = await CommentService.getCommentsByPodcast(podcastId, pageNumber, 10);
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

  const fetchReplies = async (commentId: string) => {
    console.log(commentId); //67eb66ffddbd725479de7655

    const parent = comments.find((comment) => comment.id === commentId);
    setParentComment(parent || null);

    // Nếu comment gốc không có replies, chỉ hiển thị comment gốc
    if (parent && parent.totalReplies <= 0) {
      setReplies([parent]); // Chỉ hiển thị comment gốc
      return;
    }

    setIsLoadingReplies(true);
    try {
      const response = await CommentService.getCommentReplies(commentId, isAuthenticated);
      
      const repliesWithParent = parent ? [parent, ...response] : response;
      setReplies(repliesWithParent);
    } catch (error) {
      console.error(`Failed to fetch replies for comment ID: ${commentId}`, error);
    } finally {
      setIsLoadingReplies(false);
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

  const toggleLike = (commentId: string) => {
    setComments((prevComments) =>
      prevComments.map((comment) =>
        comment.id === commentId
          ? {
              ...comment,
              liked: !comment.liked,
              totalLikes: comment.liked ? comment.totalLikes - 1 : comment.totalLikes + 1,
            }
          : comment
      )
    );
  };

  const handleShowReplies = (commentId: string) => {
    setSelectedCommentId(commentId);
    fetchReplies(commentId);
  };

  const handleReplyToComment = (commentId: string) => {
    setSelectedCommentId(commentId);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 300);
  };

  const handleBackToComments = () => {
    setSelectedCommentId(null);
    setReplies([]);
    setParentComment(null);
  };

  const handleMenuPress = (commentId: string) => {
    setSelectedCommentId(commentId);
    setIsOptionsVisible(true);
  };

  const handleEditComment = () => {
    console.log(`Edit comment ID: ${selectedCommentId}`);
    setIsOptionsVisible(false);
  };

  const handleDeleteComment = async () => {
    if (!selectedCommentId) return;
  
    try {
      await CommentService.deleteComment([selectedCommentId]);
  
      // Cập nhật danh sách bình luận trong FlatList
      setComments((prevComments) =>
        prevComments.filter((comment) => comment.id !== selectedCommentId)
      );
  
      console.log(`Deleted comment ID: ${selectedCommentId}`);
    } catch (error) {
      console.error(`Failed to delete comment ID: ${selectedCommentId}`, error);
    } finally {
      setIsConfirmVisible(false);
      setIsOptionsVisible(false);
      setSelectedCommentId(null);
    }
  };

  const handleReportComment = () => {
    console.log(`Report comment ID: ${selectedCommentId}`);
    setIsOptionsVisible(false);
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
          {/* Nút Close */}
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Icon name="close" size={24} color="#333" />
          </TouchableOpacity>

          {/* Header */}
          <View style={styles.headerContainer}>
            {selectedCommentId ? (
              <TouchableOpacity style={styles.backButton} onPress={handleBackToComments}>
                <Icon name="arrow-back" size={24} color="#333" />
              </TouchableOpacity>
            ) : null}
            <Text style={styles.header}>
              {selectedCommentId ? 'Replies' : `Comments (${totalComments})`}
            </Text>
          </View>
          
          {comments.length === 0 && (
            <View style={styles.noCommentsContainer}>
            <Text style={styles.noCommentsText}>Be the first one to comment</Text>
            <Image source={noCommentImg} style={styles.noCommentsImage} />
            </View>
          )}
            
          {isLoadingReplies ? (
            <ActivityIndicator size="large" color="#000" />
          ) : selectedCommentId && replies.length > 0 ? (
            <FlatList
              data={replies}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View
                  style={[
                    styles.replyContainer,
                    item.id === parentComment?.id && styles.parentCommentContainer,
                  ]}
                >
                  <Image source={{ uri: item.user.avatarUrl }} style={styles.avatar} />
                  <View style={styles.commentContent}>
                    <View style={styles.commentHeader}>
                      <Text style={styles.username}>{item.user.fullname}</Text>
                      <TouchableOpacity onPress={() => handleMenuPress(item.id)} style={styles.menuButton}>
                        <Icon name="ellipsis-vertical" size={20} color="#666" />
                      </TouchableOpacity>
                    </View>
                    <Text style={styles.commentText}>{item.content}</Text>
                    <View style={styles.commentActions}>
                      <TouchableOpacity onPress={() => toggleLike(item.id)} style={styles.actionButton}>
                        <Icon
                          name={item.liked ? 'heart' : 'heart-outline'}
                          size={20}
                          color={item.liked ? 'red' : '#666'}
                        />
                        <Text style={styles.actionText}>{item.totalLikes}</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => handleReplyToComment(item.id)} style={styles.actionButton}>
                        <Icon name="chatbubble-outline" size={20} color="#666" />
                        <Text style={styles.actionText}>Reply</Text>
                      </TouchableOpacity>
                      <Text style={styles.timestamp}>
                        {DateUtil.formatDateToTimeAgo(new Date(item.timestamp))} ago
                      </Text>
                    </View>
                  </View>
                </View>
              )}
            />
          ) : (
            <FlatList
              data={comments}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View style={styles.commentContainer}>
                  <Image source={{ uri: item.user.avatarUrl }} style={styles.avatar} />
                  <View style={styles.commentContent}>
                    <View style={styles.commentHeader}>
                      <Text style={styles.username}>{item.user.fullname}</Text>
                      <TouchableOpacity onPress={() => handleMenuPress(item.id)} style={styles.menuButton}>
                        <Icon name="ellipsis-vertical" size={20} color="#666" />
                      </TouchableOpacity>
                    </View>
                    <Text style={styles.commentText}>{item.content}</Text>
                    <View style={styles.commentActions}>
                      <TouchableOpacity onPress={() => toggleLike(item.id)} style={styles.actionButton}>
                        <Icon
                          name={item.liked ? 'heart' : 'heart-outline'}
                          size={20}
                          color={item.liked ? 'red' : '#666'}
                        />
                        <Text style={styles.actionText}>{item.totalLikes}</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => handleShowReplies(item.id)} style={styles.actionButton}>
                        <Icon name="chatbubble-outline" size={20} color="#666" />
                        <Text style={styles.actionText}>Reply</Text>
                      </TouchableOpacity>
                      <Text style={styles.timestamp}>
                        {DateUtil.formatDateToTimeAgo(new Date(item.timestamp))} ago
                      </Text>
                    </View>

                    {/* Show replies button */}
                    {item.totalReplies > 0 && (
                      <TouchableOpacity style={styles.showRepliesBtn} onPress={() => handleShowReplies(item.id)}>
                        <Icon name="chevron-forward-outline" size={18} color="#666" />
                        <Text style={styles.showRepliesText}>Show {item.totalReplies} replies</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              )}
            />
          )}
        </BottomSheetView>
      </BottomSheet>
      
      {/* Input để thêm bình luận */}
      {isVisible && (
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.inputContainer}
        >
          <TextInput
            ref={inputRef}
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
      
      {/* Comment Options BottomSheet */}
      <CommentOptionsBottomSheet
        sheetRef={optionsSheetRef}
        isVisible={isOptionsVisible}
        isOwner={selectedCommentId ? comments.find((c) => c.id === selectedCommentId)?.user.id === user?.id : false}
        onClose={() => setIsOptionsVisible(false)}
        onEdit={handleEditComment}
        onDelete={() => setIsConfirmVisible(true)}
        onReport={handleReportComment}
      />

      {/* ConfirmDialog */}
      <ConfirmDialog
        sheetRef={confirmDialogRef}
        isVisible={isConfirmVisible}
        title="Confirm Delete"
        message="Are you sure you want to delete this comment?"
        onCancel={() => setIsConfirmVisible(false)}
        onConfirm={handleDeleteComment}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: 'white',
  },
  closeButton: {
    position: 'absolute',
    top: 0,
    right: 16,
    zIndex: 1,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  backButton: {
    marginRight: 10,
    marginBottom: 5,
  },
  header: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  noCommentsContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  noCommentsText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#999',
    marginTop: 20,
  },
  noCommentsImage: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
  },
  commentContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  replyContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    marginLeft: 20,
  },
  parentCommentContainer: {
    marginLeft: 0,
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 5,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between'
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
    fontSize: 14,
    marginBottom: 8,
  },
  commentActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
  },
  actionText: {
    marginLeft: 5,
    color: '#666',
    fontSize: 12,
  },
  timestamp: {
    color: '#999',
    fontSize: 12,
    marginLeft: 'auto',
  },
  menuButton: {
    padding: 2
  },
  showRepliesBtn: {
    flexDirection: 'row',
    paddingVertical: 5,
    paddingHorizontal: 5,
    backgroundColor: "#e0dfe6",
    borderRadius: 10,
    marginTop: 5,
    alignSelf: 'flex-start',
  },
  showRepliesText: {
    fontSize: 12,
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