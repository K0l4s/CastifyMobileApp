import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { userCard } from '../../models/User';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootParamList } from '../../type/navigationType';

interface UserItemProps {
  user: userCard;
}

const UserItem: React.FC<UserItemProps> = ({ user }) => {
  const navigation = useNavigation<StackNavigationProp<RootParamList>>();

  const handleOpenProfile = (username: string) => {
    navigation.navigate('Profile', { username });
  };

  const handleFollowUser = (userId: string) => {
    console.log(`Follow user with ID: ${userId}`);
    // Thực hiện logic follow/unfollow tại đây
  };

  return (
    <TouchableOpacity style={styles.container} onPress={() => handleOpenProfile(user.username)}>
      <View style={styles.avatarContainer}>
        <Image source={{ uri: user.avatarUrl }} style={styles.avatar} />
      </View>
      <View style={styles.info}>
        <Text style={styles.fullName}>{user.fullname}</Text>
        <Text style={styles.username}>{user.username}</Text>
        <Text style={styles.stats}>{user.totalFollower || 0} followers {" "} {user.totalPost || 0} Podcasts</Text>
      </View>
      <TouchableOpacity style={styles.followButton} onPress={() => handleFollowUser(user.id)}>
        <Text style={styles.followText}>Follow</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#fff',
    marginVertical: 4,
    borderRadius: 8,
  },
  avatarContainer: {
    backgroundColor: '#f0f0f0',
    borderRadius: 25,
    padding: 2,
  },
  avatar: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: '#fff',
  },
  info: {
    flex: 1,
    marginLeft: 12,
  },
  username: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  fullName: {
    fontWeight: '600',
    fontSize: 15,
    color: '#000',
  },
  stats: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  followButton: {
    backgroundColor: '#000',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    marginLeft: 8,
  },
  followText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default UserItem;