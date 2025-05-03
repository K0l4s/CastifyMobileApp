import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { userCard } from '../../models/User';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootParamList } from '../../type/navigationType';
import UserService from '../../services/userService';
import Toast from 'react-native-toast-message';
import { defaultAvatar } from '../../utils/fileUtil';

export interface UserItemProps {
  user: userCard;
}

const UserItem: React.FC<UserItemProps> = ({ user }) => {
  const navigation = useNavigation<StackNavigationProp<RootParamList>>();
  const [isFollowing, setIsFollowing] = useState(user.follow);

  const handleOpenProfile = (username: string) => {
    navigation.navigate('Profile', { username });
  };

  const handleFollowToggle = async () => {
    try {
      await UserService.followUser(user.username);

      setIsFollowing(!isFollowing);

      user.totalFollower = isFollowing
      ? user.totalFollower - 1
      : user.totalFollower + 1;

      Toast.show({
        type: 'success',
        text1: isFollowing ? 'Unfollowed successfully' : 'Followed successfully',
      });
    } catch (error) {
      console.error('Error toggling follow status:', error);
      Toast.show({
        type: 'error',
        text1: 'Failed to update follow status',
      });
    }
  };

  return (
    <TouchableOpacity style={styles.container} onPress={() => handleOpenProfile(user.username)}>
      <View style={styles.avatarContainer}>
        <Image source={user.avatarUrl ? { uri: user.avatarUrl } : defaultAvatar} style={styles.avatar} />
      </View>
      <View style={styles.info}>
        <Text style={styles.fullName}>{user.fullname}</Text>
        <Text style={styles.username}>{user.username}</Text>
        <Text style={styles.stats}>
          {user.totalFollower || 0} followers {" "} {user.totalPost || 0} Podcasts
        </Text>
      </View>
      <TouchableOpacity 
        style={[styles.followButton, isFollowing && styles.unfollowButton]} 
        onPress={handleFollowToggle}
      >
        <Text style={styles.followText}>{isFollowing ? 'Unfollow' : 'Follow'}</Text>
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
  unfollowButton: {
    backgroundColor: '#a09bbf',
  },
  followText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default UserItem;