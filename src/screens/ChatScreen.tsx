import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, Image, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
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
  const [hasMore, setHasMore] = useState(true);
  const userId = useSelector((state: RootState) => state.auth.user?.id);

  const navigation = useNavigation<StackNavigationProp<RootParamList, 'ChatScreen'>>();

  const fetchData = useCallback(async () => {
    if (loading || !hasMore || !userId) return;
    setLoading(true);
    try {
      const response = await conversationService.getByUserId(page, PAGE_SIZE);
      const newData = response.data.data;
      setChatData((prev) => [...prev, ...newData]);
      setHasMore(newData.length === PAGE_SIZE);
      setPage((prev) => prev + 1);
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  }, [page, loading, hasMore, userId]);

  // ✅ Reset data khi userId thay đổi
  useEffect(() => {
    if (!userId) return;
    setChatData([]);
    setPage(0);
    setHasMore(true);
  }, [userId]);

  // ✅ Tự động fetch dữ liệu mỗi khi page reset (sau khi userId đổi)
  useEffect(() => {
    if (userId) {
      fetchData();
    }
  }, [fetchData]);

  const renderFooter = () => {
    if (!loading) return null;
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
        onEndReached={fetchData}
        onEndReachedThreshold={0.2}
        ListFooterComponent={renderFooter}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.chatItem} 
            onPress={() => navigation.navigate('ChatDetailScreen', { conversationId: item.id })}
          >
            <Image 
              source={{ uri: item.imageUrl || "https://png.pngtree.com/element_our/png_detail/20180904/group-avatar-icon-design-vector-png_75950.jpg" }} 
              style={styles.avatar} 
            />
            <View style={styles.chatDetails}>
              <Text style={styles.groupName}>{item.title}</Text>
              <Text style={[styles.lastMessage, 
                // item.unread && styles.unreadMessage
                ]}>
                {item.lastMessage?.sender?.fullname 
                  ? `${item.lastMessage.sender.fullname}: ${item.lastMessage.content}` 
                  : item.lastMessage?.content}
              </Text>
            </View>
            <Text style={styles.time}>
              {item.lastMessage?.timestamp &&
                DateUtil.formatDateToTimeAgo(new Date(item.lastMessage.timestamp))}
            </Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white' },
  header: { padding: 16, alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#ddd' },
  createNewText: { fontWeight: 'bold', color: 'black' },
  chatItem: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#ddd' },
  avatar: { width: 50, height: 50, borderRadius: 25, marginRight: 12 },
  chatDetails: { flex: 1 },
  groupName: { fontWeight: 'bold', color: 'black' },
  lastMessage: { color: 'gray' },
  unreadMessage: { fontWeight: 'bold', color: 'black' },
  time: { color: 'gray', fontSize: 12 },
  footer: { paddingVertical: 10, alignItems: 'center' },
});

export default ChatScreen;
