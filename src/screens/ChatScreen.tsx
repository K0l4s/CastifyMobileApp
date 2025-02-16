import React from 'react';
import { View, Text, FlatList, Image, StyleSheet } from 'react-native';

interface ChatItem {
  id: string;
  groupName: string;
  lastMessage: string;
  time: string;
  avatar: string;
  isRead: boolean;
}

const chatData: ChatItem[] = Array(6).fill(null).map((_, index) => ({
  id: index.toString(),
  groupName: 'Hội này vui nè',
  lastMessage: 'Huy: Xin chào mọi người nhé!',
  isRead: false,
  time: '3 hours ago',
  avatar: 'https://img.freepik.com/free-vector/group-happy-smiling-people-looking-up-top-view-white-background-flat-vector-illustration_1284-78599.jpg?size=338&ext=jpg&ga=GA1.1.2008272138.1728000000&semt=ais_hybrid',
}));

const ChatScreen = () => {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.createNewText}> CREATE NEW CONVERSATION</Text>
      </View>
      
      {/* Chat List */}
      <FlatList
        data={chatData}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.chatItem}>
            <Image source={{ uri: item.avatar }} style={styles.avatar} />
            <View style={styles.chatDetails}>
              <Text style={styles.groupName}>{item.groupName}</Text>
              <Text style={[styles.lastMessage, !item.isRead && styles.unreadMessage]}>
                {item.lastMessage}
              </Text>
            </View>
            <Text style={styles.time}>{item.time}</Text>
          </View>
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
