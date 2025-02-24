import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Modal, Button, Animated } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import SearchModal from '../modals/SearchModal';
import LoginModal from '../modals/LoginModal';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import GenresTabNavigation from '../podcast/GenresTabNavigation';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootParamList } from '../../type/navigationType';
import { defaultAvatar } from '../../utils/fileUtil';

const appLogo = require('../../assets/images/logo.png');

interface HeaderProps {
  selectedTab: string;
  onSelectTab: (tab: string) => void;
  genres: { id: string; name: string }[];
  animatedStyle: any;
}

const Header: React.FC<HeaderProps> = ({ selectedTab, onSelectTab, genres, animatedStyle }) => {
  const user = useSelector((state: RootState) => state.auth.user);
  const [isLoginModalVisible, setIsLoginModalVisible] = useState(false);
  const navigation = useNavigation<StackNavigationProp<RootParamList>>();
  const toggleModal = () => {
    setIsLoginModalVisible(!isLoginModalVisible);
  };
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  
  const handleAvatarPress = () => {
    navigation.navigate('Profile');
  }

  const avatarSource = user?.avatarUrl && user.avatarUrl !== '' ? { uri: user.avatarUrl } : defaultAvatar;

  return (
    <>
    <Animated.View style={[styles.headerContainer, animatedStyle]}>
      <View style={styles.header}>
        {/* Logo và tên ứng dụng */}
        <View style={styles.leftSection}>
          <Image source={appLogo} style={styles.logoImage} />
          <Text style={styles.logoText}>CASTIFY</Text>
        </View>

        <View style={styles.rightSection}>
          {/* Nút tìm kiếm */}
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => setIsSearchVisible(true)}>
            <Icon name="search" size={22} color="#0c0461" />
          </TouchableOpacity>

          {/* Ảnh đại diện */}
          {user ? (
            <TouchableOpacity 
              onPress={handleAvatarPress}
              style={styles.iconButton}>
            <Image
              source={avatarSource}
              style={styles.profilePic}
            />
          </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={toggleModal}>
              <Text style={styles.loginBtn}>Login</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <GenresTabNavigation 
        selectedTab={selectedTab}
        onSelectTab={onSelectTab}
        genres={genres} 
        animatedStyle={animatedStyle}
      />
    </Animated.View>
    {/* Login Modal */}
    <LoginModal 
        isOpen={isLoginModalVisible} 
        onClose={toggleModal} 
        trigger={toggleModal} 
      />
    {/* Modal tìm kiếm */}
    <SearchModal
        visible={isSearchVisible}
        onClose={() => setIsSearchVisible(false)}
      />
    </>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'column',
    backgroundColor: '#fff',
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
    backgroundColor: '#fff',
    elevation: 2,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoImage: {
    width: 35,
    height: 35,
    marginRight: 8,
  },
  logoText: {
    fontWeight: 'bold',
    fontSize: 18,
    color: '#0c0461'
  },
  iconButton: {
    padding: 5,
  },
  profilePic: {
    width: 30,
    height: 30,
    padding: 5,
    borderRadius: 20,
    resizeMode: 'contain',
    borderColor: '#ddd',
    borderWidth: 1
  },
  loginBtn: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    alignItems: 'center',
    borderRadius: 5,
    backgroundColor: '#104fb5',
    color: 'white',
  }
});

export default Header;
