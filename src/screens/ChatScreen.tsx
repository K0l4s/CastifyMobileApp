import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { shortConversation } from '../models/Conversation';
import { conversationService } from '../services/conversationService';
import DateUtil from '../utils/dateUtil';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootParamList } from '../type/navigationType';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import CreateConversationModal from '../components/chat/CreateChatModal';
import { resetNewConversation, setClick } from '../redux/reducer/messageSlice';
import useStomp from '../hooks/useStomp';

const PAGE_SIZE = 10;

const ChatScreen = () => {
  const [chatData, setChatData] = useState<shortConversation[]>([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const userId = useSelector((state: RootState) => state.auth.user?.id);
  const [isOpenCreateChatModal, setIsOpenCreateChatModal] = useState(false);
  const dispatch = useDispatch();
  const navigation = useNavigation<StackNavigationProp<RootParamList, 'ChatScreen'>>();

  const fetchData = async (currentPage: number, isRefresh = false) => {
    if (loading || !userId) return;

    isRefresh ? setRefreshing(true) : setLoading(true);

    try {
      const response = await conversationService.getByUserId(currentPage, PAGE_SIZE);
      const newData = response.data.data;

      setChatData(prev =>
        currentPage === 0 ? newData : [...prev, ...newData]
      );
      setHasMore(newData.length === PAGE_SIZE);
      setPage(currentPage + 1);
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setHasMore(true);
    setPage(0);
    fetchData(0, true);
  };

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      fetchData(page);
    }
  };

  useEffect(() => {
    if (userId) {
      setChatData([]);
      setPage(0);
      setHasMore(true);
      fetchData(0);
    }
  }, [userId]);

  const renderFooter = () => {
    if (!loading || refreshing) return null;
    return (
      <View style={styles.footer}>
        <ActivityIndicator size="small" color="#888" />
      </View>
    );
  };
  const data: shortConversation = useStomp(
    {
      subscribeUrl: `/user/${userId}/queue/msg`,
      trigger: [userId],
    }
  )
  useEffect(() => {
    if (data && data.id) {
      setChatData((prev) => {
        const existingConversation = prev.find((item) => item.id === data.id);
        if (existingConversation) {
          return prev.map((item) =>
            item.id === data.id ? { ...item, ...data } : item
          );
        } else {
          return [data, ...prev];
        }
      });
      
      dispatch(setClick(!isClick));
    }
  }
  , [data]);
  const isClick = useSelector((state:RootState)=> state.message.isClick)

  return (
    <View style={styles.container}>
      {/* Header */}
      {
        userId && (
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => setIsOpenCreateChatModal(true)}
              activeOpacity={0.8}
              style={styles.createButton}
            >
              <Text style={styles.createButtonText}>+ Tạo cuộc trò chuyện</Text>
            </TouchableOpacity>
          </View>
        )
      }

      {/* Chat List */}
      <FlatList
        data={chatData}
        keyExtractor={(item) => item.id}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.2}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        ListFooterComponent={renderFooter}
        contentContainerStyle={{ padding: 12 }}
        renderItem={({ item }) => {
          const isUnread = item.lastMessage &&
            !item.lastMessage.read &&
            item.lastMessage.sender.id !== userId;

          return (
            <TouchableOpacity
              style={[styles.chatItem, isUnread && styles.unreadItem]}
              onPress={() => {
                navigation.navigate('ChatDetailScreen', {
                  conversationId: item.id,
                });
                chatData.forEach((chat) => {
                  if (chat.id === item.id && chat.lastMessage) {
                    chat.lastMessage.read = true;
                  }
                });
                setChatData([...chatData]);
                
              }}
              activeOpacity={0.8}
            >
              <View style={styles.avatarContainer}>
                <Image
                  source={{
                    uri: item.imageUrl || 'https://png.pngtree.com/element_our/png_detail/20180904/group-avatar-icon-design-vector-png_75950.jpg',
                  }}
                  style={styles.avatar}
                />
                {isUnread && <View style={styles.unreadDot} />}
              </View>

              <View style={styles.chatInfo}>
                <Text style={styles.groupName} numberOfLines={1}>
                  {item.title}
                </Text>
                <Text
                  style={[styles.lastMessage, isUnread && styles.unreadText]}
                  numberOfLines={1}
                >
                  {item.lastMessage?.sender?.fullname
                    ? `${item.lastMessage.sender.fullname}: ${item.lastMessage.content}`
                    : item.lastMessage?.content || 'Nhóm đã được tạo'}
                </Text>
              </View>

              <Text style={styles.time}>
                {item.lastMessage?.timestamp &&
                  DateUtil.formatDateToTimeAgo(
                    new Date(item.lastMessage.timestamp)
                  )}
              </Text>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          !loading && !refreshing ? (
            <Text style={styles.emptyText}>Không có cuộc trò chuyện nào</Text>
          ) : null
        }
      />

      <CreateConversationModal
        isOpen={isOpenCreateChatModal}
        onClose={() => setIsOpenCreateChatModal(false)}
        conversations={chatData}
        setConversations={setChatData}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7f8fa' },
  header: {
    padding: 16,
    alignItems: 'center',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  createButton: {
    backgroundColor: '#007bff',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  createButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  chatItem: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  unreadItem: {
    backgroundColor: '#ffeaea',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
  },
  unreadDot: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 14,
    height: 14,
    backgroundColor: '#f00',
    borderRadius: 7,
    borderWidth: 2,
    borderColor: '#fff',
  },
  chatInfo: {
    flex: 1,
  },
  groupName: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#333',
    marginBottom: 2,
  },
  lastMessage: {
    color: '#777',
    fontSize: 14,
  },
  unreadText: {
    fontWeight: '600',
    color: '#000',
  },
  time: {
    fontSize: 12,
    color: '#999',
    marginLeft: 8,
  },
  footer: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  emptyText: {
    textAlign: 'center',
    padding: 20,
    color: '#aaa',
  },
});

export default ChatScreen;
