import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import SearchModal from '../modals/SearchModal';

const appLogo = require('../../assets/images/logo.png');

const Header = () => {
  const [isSearchVisible, setIsSearchVisible] = useState(false);

  return (
    <>
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
        <TouchableOpacity style={styles.iconButton}>
          <Image
            source={{
              uri: 'https://i.redd.it/snoovatar/avatars/0cec69b2-0fb5-4185-b4f1-56c069511f8a.png',
            }}
            style={styles.profilePic}
          />
        </TouchableOpacity>
      </View>
    </View>
    {/* Modal tìm kiếm */}
    <SearchModal
        visible={isSearchVisible}
        onClose={() => setIsSearchVisible(false)}
      />
    </>
  );
};

const styles = StyleSheet.create({
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
  },
});

export default Header;
