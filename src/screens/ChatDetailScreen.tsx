import React, { useEffect, useState, useRef } from 'react';
import {
  View, Text, FlatList, TextInput, TouchableOpacity, Image,
  KeyboardAvoidingView, Platform
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { conversationService } from '../services/conversationService';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import DateUtil from '../utils/dateUtil';

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
  const flatListRef = useRef<FlatList<Message>>(null);

  const userId = useSelector((state: RootState) => state.auth.user?.id); // Lấy userId của mình

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const response = await conversationService.getMsgByConversationId(conversationId, 0, 20);
      // setMessages(response.data.data.reverse());
      setMessages((prevMessages) => [...response.data.data, ...prevMessages]);
    } catch (error) {
      console.error('Lỗi tải tin nhắn:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    try {
      await conversationService.sendMessage(newMessage, conversationId);
      setNewMessage('');
      fetchMessages();
      scrollToBottom();
    } catch (error) {
      console.error('Lỗi gửi tin nhắn:', error);
    }
  };

  const scrollToBottom = () => {
    flatListRef.current?.scrollToEnd({ animated: true });
  };

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
  

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
      <FlatList
        ref={flatListRef}
        data={messages}
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
        inverted
      />
      <View style={{ flexDirection: 'row', padding: 10, borderTopWidth: 1, borderTopColor: '#ddd', alignItems: 'center' }}>
        <TextInput
          style={{ flex: 1, borderWidth: 1, borderColor: '#ccc', borderRadius: 20, padding: 10 }}
          placeholder="Nhập tin nhắn..."
          value={newMessage}
          onChangeText={setNewMessage}
        />
        <TouchableOpacity onPress={sendMessage} style={{ marginLeft: 10, backgroundColor: '#4D90FE', padding: 10, borderRadius: 20 }}>
          <Text style={{ color: 'white', fontWeight: 'bold' }}>→</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

export default ChatDetailScreen;
