import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { userCard } from '../../models/User';

interface UserItemProps {
  user: userCard;
}

const UserItem: React.FC<UserItemProps> = ({ user }) => {
  return (
    <TouchableOpacity style={styles.container}>
      <Image source={{ uri: user.avatarUrl }} style={styles.avatar} />
      <View style={styles.info}>
        <Text style={styles.username}>{user.username}</Text>
        <Text style={styles.fullName}>{user.fullname}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  info: {
    marginLeft: 10,
  },
  username: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  fullName: {
    fontSize: 14,
    color: 'gray',
  },
});

export default UserItem;