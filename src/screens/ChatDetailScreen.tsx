import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, FlatList, TextInput, TouchableOpacity, Image,
  KeyboardAvoidingView, Platform
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { conversationService } from '../services/conversationService';
import DateUtil from '../utils/dateUtil';
import useStomp from '../hooks/useStomp';

interface Message {
  id: string;
  sender: { id: string; fullname: string; avatarUrl?: string };
  content: string;
  timestamp: string;
}

const ChatDetailScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { conversationId } = route.params as { conversationId: string };

  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [scrollOffset, setScrollOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true); // Thêm state này

  const flatListRef = useRef<FlatList<Message>>(null);
  const userId = useSelector((state: RootState) => state.auth.user?.id);

  const fetchMessages = async (pageToLoad: number) => {
    if (isLoading || !hasMore) return;
    setIsLoading(true);
    try {
      const response = await conversationService.getMsgByConversationId(conversationId, pageToLoad, 20);
      const newMsgs: Message[] = response.data.data;

      if (newMsgs.length > 0) {
        setMessages((prev) => [...prev, ...newMsgs]);

        // Scroll giữ nguyên vị trí cũ sau khi load thêm
        setTimeout(() => {
          const estimatedHeight = newMsgs.length * 80; // ước lượng
          flatListRef.current?.scrollToOffset({ offset: scrollOffset + estimatedHeight, animated: false });
        }, 100);

        setPage(pageToLoad);
        setHasMore(newMsgs.length === 20); // Nếu ít hơn 20 tin → hết rồi
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error('Lỗi tải tin nhắn:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadMore = () => {
    if (!isLoading && hasMore) {
      fetchMessages(page + 1);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    try {
      await conversationService.sendMessage(newMessage, conversationId);
      setNewMessage('');
      scrollToBottom();
    } catch (error) {
      console.error('Lỗi gửi tin nhắn:', error);
    }
  };

  const scrollToBottom = () => {
    flatListRef.current?.scrollToEnd({ animated: true });
  };

  useEffect(() => {
    fetchMessages(0);
  }, []);

  useEffect(() => {
    navigation.setOptions({
      title: "Hội thoại",
      headerLeft: () => (
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginLeft: 16 }}>
          <Text style={{ fontSize: 20 }}>←</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  const object = useStomp({
    subscribeUrl: `/topic/group/${conversationId}`,
    trigger: [conversationId, userId],
    flag: !!conversationId
  });

  useEffect(() => {
    if (object) {
      const newMsg: Message = object;
      setMessages((prev) => [newMsg, ...prev]);
    }
  }, [object]);

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
      <FlatList
        ref={flatListRef}
        data={messages}
        inverted={true}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const isMyMessage = item.sender.id === userId;
          return (
            <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 5, paddingHorizontal: 10 }}>
              {!isMyMessage && (
                <Image
                  source={{ uri: item.sender.avatarUrl || 'https://i.imgur.com/2vP3hDA.png' }}
                  style={{ width: 40, height: 40, borderRadius: 20, marginRight: 10 }}
                />
              )}
              <View style={{
                maxWidth: '75%',
                backgroundColor: isMyMessage ? '#4D90FE' : '#E5E5E5',
                padding: 10,
                borderRadius: 15,
                alignSelf: isMyMessage ? 'flex-end' : 'flex-start',
                marginLeft: isMyMessage ? 'auto' : 0
              }}>
                {!isMyMessage && <Text style={{ fontWeight: 'bold', marginBottom: 3 }}>{item.sender.fullname}</Text>}
                <Text style={{ color: isMyMessage ? 'white' : 'black' }}>{item.content}</Text>
                <Text style={{ fontSize: 10, color: 'gray', marginTop: 5 }}>
                  {DateUtil.formatDateToTimeAgo(new Date(item.timestamp))}
                </Text>
              </View>
            </View>
          );
        }}
        onScroll={(e) => {
          const offsetY = e.nativeEvent.contentOffset.y;
          setScrollOffset(offsetY);
        }}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.1}
        scrollEventThrottle={16}
        ListFooterComponent={
          isLoading && messages.length > 0 ? (
            <Text style={{ textAlign: 'center', color: 'gray', marginBottom: 10 }}>
              Đang tải thêm tin nhắn...
            </Text>
          ) : null
        }
      />

      {/* Input gửi tin nhắn */}
      <View style={{
        flexDirection: 'row',
        padding: 10,
        borderTopWidth: 1,
        borderTopColor: '#ddd',
        alignItems: 'center'
      }}>
        <TextInput
          style={{
            flex: 1,
            borderWidth: 1,
            borderColor: '#ccc',
            borderRadius: 20,
            padding: 10
          }}
          placeholder="Nhập tin nhắn..."
          value={newMessage}
          onChangeText={setNewMessage}
        />
        <TouchableOpacity
          onPress={sendMessage}
          style={{
            marginLeft: 10,
            backgroundColor: '#4D90FE',
            padding: 10,
            borderRadius: 20
          }}
        >
          <Text style={{ color: 'white', fontWeight: 'bold' }}>→</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

export default ChatDetailScreen;
