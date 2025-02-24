import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { shortConversation } from '../models/Conversation';
import { conversationService } from '../services/conversationService';
import DateUtil from '../utils/dateUtil';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootParamList } from '../type/navigationType';

const ChatScreen = () => {
  const [chatData, setChatData] = useState<shortConversation[]>([]);
  const navigation = useNavigation<StackNavigationProp<RootParamList, 'ChatScreen'>>();

  const fetchData = async () => {
    const response = await conversationService.getByUserId(0, 10);
    setChatData(response.data.data);
  };

  useEffect(() => {
    fetchData();
  }, []);

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
              <Text style={[styles.lastMessage && styles.unreadMessage]}>
                {item.lastMessage?.sender.fullname + ": " + item.lastMessage?.content}
              </Text>
            </View>
            <Text style={styles.time}>
              {item.lastMessage?.timestamp &&
                DateUtil.formatDateToTimeAgo(new Date(item.lastMessage?.timestamp))}
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
  unreadMessage: { fontWeight: 'bold' },
  time: { color: 'gray', fontSize: 12 },
});

export default ChatScreen;
