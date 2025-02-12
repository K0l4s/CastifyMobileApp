import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootParamList } from '../type/navigationType';
import Icon from 'react-native-vector-icons/Ionicons';

const ProfileScreen: React.FC = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  const navigation = useNavigation<StackNavigationProp<RootParamList>>();

  const fullName = `${user?.lastName} ${user?.middleName} ${user?.firstName}`;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.headerButton} onPress={() => { /* Add your action here */ }}>
          <Icon name="ellipsis-vertical" size={24} color="#000" />
        </TouchableOpacity>
      </View>
      <Image source={{ uri: user?.coverUrl }} style={styles.coverUrl} />
      <View style={styles.profileContainer}>
        <Image source={{ uri: user?.avatarUrl }} style={styles.avatar} />
        <View style={styles.profileDetails}>
          <Text style={styles.fullname}>{fullName}</Text>
          <Text style={styles.username}>@{user?.username}</Text>
          <Text style={styles.stats}>
            <Text style={styles.statsText}>Followers: {user?.followers || "1.34 k"} </Text>
            <Text style={styles.statsText}> • </Text>
            <Text style={styles.statsText}>Podcasts: {user?.podcastCount || "120"}</Text>
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 40,
  },
  header: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
    position: 'absolute',
    top: 10,
  },
  headerButton: {
    padding: 5,
  },
  coverUrl: {
    width: '90%',
    height: 150,
    borderRadius: 20,
    resizeMode: 'cover',
    marginTop: 15,
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    width: '90%',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 50,
  },
  profileDetails: {
    marginLeft: 15,
    flex: 1,
  },
  fullname: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  username: {
    fontSize: 14,
    fontWeight: 'semibold',
    fontStyle: 'italic',
  },
  stats: {
    marginTop: 5,
  },
  statsText: {
    fontSize: 14,
    fontWeight: 'regular',
  },
});

export default ProfileScreen;