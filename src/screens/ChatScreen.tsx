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
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';

const PAGE_SIZE = 10;

const ChatScreen = () => {
  const [chatData, setChatData] = useState<shortConversation[]>([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const userId = useSelector((state: RootState) => state.auth.user?.id);

  const navigation = useNavigation<StackNavigationProp<RootParamList, 'ChatScreen'>>();

  const fetchData = async (currentPage: number, isRefresh = false) => {
    if (loading || !userId) return;

    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

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

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.createNewText}>CREATE NEW CONVERSATION</Text>
      </View>

      {/* Chat List */}
      <FlatList
        data={chatData}
        keyExtractor={(item) => item.id}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.2}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        ListFooterComponent={renderFooter}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.chatItem}
            onPress={() =>
              navigation.navigate('ChatDetailScreen', {
                conversationId: item.id,
              })
            }
          >
            <Image
              source={{
                uri:
                  item.imageUrl ||
                  'https://png.pngtree.com/element_our/png_detail/20180904/group-avatar-icon-design-vector-png_75950.jpg',
              }}
              style={styles.avatar}
            />
            <View style={styles.chatDetails}>
              <Text style={styles.groupName}>{item.title}</Text>
              <Text style={styles.lastMessage}>
                {item.lastMessage?.sender?.fullname
                  ? `${item.lastMessage.sender.fullname}: ${item.lastMessage.content}`
                  : item.lastMessage?.content}
              </Text>
            </View>
            <Text style={styles.time}>
              {item.lastMessage?.timestamp &&
                DateUtil.formatDateToTimeAgo(
                  new Date(item.lastMessage.timestamp)
                )}
            </Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          !loading && !refreshing ? (
            <Text style={styles.emptyText}>Không có cuộc trò chuyện nào</Text>
          ) : null
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white' },
  header: {
    padding: 16,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  createNewText: { fontWeight: 'bold', color: 'black' },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  avatar: { width: 50, height: 50, borderRadius: 25, marginRight: 12 },
  chatDetails: { flex: 1 },
  groupName: { fontWeight: 'bold', color: 'black' },
  lastMessage: { color: 'gray' },
  time: { color: 'gray', fontSize: 12 },
  footer: { paddingVertical: 10, alignItems: 'center' },
  emptyText: {
    textAlign: 'center',
    padding: 20,
    color: '#888',
  },
});

export default ChatScreen;
