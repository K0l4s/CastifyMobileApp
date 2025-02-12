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
      <Image source={{ uri: user?.avatarUrl }} style={styles.avatar} />
      <Text style={styles.fullname}>{fullName}</Text>
      <Text style={styles.username}>@{user?.username}</Text>
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
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginTop: 20,
  },
  coverUrl: {
    width: '90%',
    height: 150,
    borderRadius: 20,
    resizeMode: 'cover',
    marginTop: 15,
  },
  fullname: {
    marginTop: 10,
    fontSize: 18,
    fontWeight: 'bold',
  },
  username: {
    marginTop: 5,
    fontSize: 14,
    fontWeight: 'semibold',
    fontStyle: 'italic',
  },
});

export default ProfileScreen;