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
import { ConversationDetail, FullMemberInfor } from '../models/Conversation';

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
  const [chatDetail, setChatDetail] = useState<ConversationDetail>(
    {
      id: "",
      title: "",
      imageUrl: "",
      memberSize: 0,
      memberList: [],
      createdAt: "",
      active: false,
    }
  );

  useEffect(() => {
    // dispatch(setClick(!click))

    const fetchChatDetail = async () => {
      if (!conversationId) return;
      try {
        const response = await conversationService.getDetailChat(conversationId);
        setChatDetail(response.data);
        console.log("🚀 ~ file: ChatDetailScreen.tsx:88 ~ fetchChatDetail ~ response.data:", response.data)
      } catch (error) {
        console.error("❌ Failed to fetch chat detail:", error);
      }
      {
        conversationService.readMsg(conversationId);
      }
    };
    fetchChatDetail();
  }
    , [conversationId]);
  useEffect(() => {
    navigation.setOptions({
      title: chatDetail.title,
      headerTitleStyle: {
        fontSize: 20,
        fontWeight: 'bold',
      },
      headerLeft: () => (
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginLeft: 16 }}>
          <Text style={{ fontSize: 20 }}>←</Text>
        </TouchableOpacity>
      ),
      headerRight: () => (
        <TouchableOpacity
          //onPress={() => 
          // navigation.navigate('GroupInfo', { conversationId })
          //} 
          style={{ marginRight: 16 }}>
          <Text style={{ fontSize: 20 }}>
            {/* setting icon */}
            ⚙️
          </Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation,chatDetail]);

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
  const [members, setMembers] = useState<FullMemberInfor[]>([]);
  useEffect(() => {
    const fetchMembers = async () => {
      if (!conversationId) return;
      try {
        const response = await conversationService.getMembers(conversationId);
        setMembers(response.data);
      } catch (error) {
        console.error("❌ Failed to fetch members:", error);
      }
    };
    fetchMembers();
  }
    , [conversationId]);
  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
      <FlatList
        ref={flatListRef}
        data={messages}
        inverted={true}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const isMyMessage = item.sender.id === userId;
          // Tìm những members có members.id === item.sender.id
          const readers = members.filter(member =>
            member.lastReadMessage?.lastMessageId === item.id
            && member.members.id !== userId
          );
          return (
            <View
              key={item.id}
              style={{
                flexDirection: 'column',
                alignItems: isMyMessage ? 'flex-end' : 'flex-start',
                marginVertical: 5,
                paddingHorizontal: 10,
              }}
            >
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'flex-start',
                  justifyContent: isMyMessage ? 'flex-end' : 'flex-start',
                  gap: 8,
                }}
              >
                {!isMyMessage && (
                  <Image
                    source={{
                      uri:
                        item.sender.avatarUrl ||
                        'https://i.imgur.com/2vP3hDA.png',
                    }}
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      marginRight: 8,
                    }}
                  />
                )}
                <View
                  style={{
                    maxWidth: '75%',
                    flexDirection: 'column',
                    alignItems: isMyMessage ? 'flex-end' : 'flex-start',
                  }}
                >
                  <Text
                    style={{
                      fontWeight: 'bold',
                      color: isMyMessage ? 'white' : 'black',
                    }}
                  >
                    {item.sender.fullname}
                  </Text>
                  <View
                    style={{
                      backgroundColor: isMyMessage ? '#4D90FE' : '#E5E5E5',
                      padding: 10,
                      borderRadius: 15,
                    }}
                  >
                    <Text style={{ color: isMyMessage ? 'white' : 'black' }}>
                      {item.content}
                    </Text>
                  </View>
                  <Text
                    style={{
                      fontSize: 10,
                      color: 'gray',
                      marginTop: 5,
                    }}
                  >
                    {DateUtil.formatDateToTimeAgo(new Date(item.timestamp))}
                  </Text>
                </View>
              </View>

              {/* Avatars của những người đã đọc */}
              {readers.length > 0 && (
                <View
                  style={{
                    flexDirection: 'row',
                    marginTop: 4,
                    paddingHorizontal: 40,
                    gap: 4,
                  }}
                >
                  {readers.map((reader) => (
                    <Image
                      key={reader.members.id}
                      source={{ uri: reader.members.avatarUrl }}
                      style={{
                        width: 20,
                        height: 20,
                        borderRadius: 10,
                        borderWidth: 2,
                        borderColor: 'white',
                      }}
                    />
                  ))}
                </View>
              )}
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
